const pool = require("../pgPool");
const { v4: uuidv4 } = require("uuid");

class CartRepository {
  async findOrCreateCart({ userId = null } = {}) {
    if (!userId) return null;
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT * FROM carts WHERE user_id::text = $1 LIMIT 1",
        [userId]
      );
      if (res.rows.length) return res.rows[0];

      const newId = uuidv4();
      await client.query(
        "INSERT INTO carts (cart_id, user_id) VALUES ($1::uuid, $2::uuid)",
        [newId, userId]
      );
      return { cart_id: newId, user_id: userId };
    } catch (err) {
      console.error("Error finding or creating cart:", err);
      throw err;
    } finally {
      client.release();
    }
  }

  async getCartByCartId(cartId) {
    if (!cartId) return [];

    try {
      const { rows } = await pool.query(
        `SELECT 
          c.product_id, 
          c.quantity, 
          c.price, 
          c.name, 
          c.image, 
          c.size,
          p.quantity AS stock,
          p.category
       FROM cart_items c
       LEFT JOIN products p ON c.product_id::text = p.product_id::text
       WHERE c.cart_id::text = $1`,
        [cartId]
      );
      return rows;
    } catch (err) {
      console.error("Error getCartByCartId:", err);
      return [];
    }
  }

  async replaceCartItems(cartId, items = []) {
    if (!cartId) throw new Error("cartId required");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM cart_items WHERE cart_id::text = $1", [
        cartId,
      ]);

      if (items.length > 0) {
        const productIds = items.map((it) => it.product_id);
        const { rows: products } = await client.query(
          `SELECT product_id, name, price, image, size, quantity AS stock
           FROM products WHERE product_id::text = ANY($1)`,
          [productIds]
        );
        const productMap = new Map(products.map((p) => [p.product_id, p]));

        for (const it of items) {
          const snap = productMap.get(it.product_id) || {};
          if (!snap || !snap.product_id) continue;
          const priceSnapshot = snap.price ?? it.price ?? 0;

          const newItemId = uuidv4();
          await client.query(
            `INSERT INTO cart_items (id, cart_id, product_id, quantity, price, name, image, size)
             VALUES ($1::uuid,$2::uuid,$3::uuid,$4,$5,$6,$7,$8)`,
            [
              newItemId,
              cartId,
              it.product_id,
              Number(it.quantity),
              priceSnapshot,
              snap.name,
              snap.image,
              snap.size,
            ]
          );
        }
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async getCanonicalCart(cartId) {
    const items = await this.getCartByCartId(cartId);
    return { items };
  }

  async mergeCart(cartId, items = []) {
    if (!cartId) throw new Error("cartId required");
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { rows: existing } = await client.query(
        "SELECT product_id, quantity FROM cart_items WHERE cart_id::text = $1",
        [cartId]
      );

      const map = new Map();
      existing.forEach((row) => {
        map.set(row.product_id, Number(row.quantity));
      });

      if (items && items.length > 0) {
        items.forEach((item) => {
          if (item.product_id) {
            const currentQty = map.get(item.product_id) || 0;
            map.set(item.product_id, currentQty + Number(item.quantity));
          }
        });
      }

      if (map.size === 0) {
        await client.query("DELETE FROM cart_items WHERE cart_id::text = $1", [
          cartId,
        ]);
        await client.query("COMMIT");
        return { items: [] };
      }

      const productIds = Array.from(map.keys());

      const { rows: products } = await client.query(
        `SELECT product_id, name, price, image, size, quantity 
         FROM products WHERE product_id::text = ANY($1)`,
        [productIds]
      );

      const productMap = new Map();
      products.forEach((p) => productMap.set(p.product_id, p));

      await client.query("DELETE FROM cart_items WHERE cart_id::text = $1", [
        cartId,
      ]);

      for (const [product_id, quantityDesejada] of map) {
        const productData = productMap.get(product_id);
        if (!productData) continue;

        const finalPrice = Number(productData.price);
        const estoqueDisponivel = productData.quantity ?? 0;
        const finalQty = Math.min(quantityDesejada, estoqueDisponivel);
        const newItemId = uuidv4();

        if (finalQty > 0) {
          await client.query(
            `INSERT INTO cart_items (id, cart_id, product_id, quantity, price, name, image, size)
               VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6, $7, $8)`,
            [
              newItemId, // ou uuidv4() dependendo do seu import
              cartId,
              product_id,
              finalQty,
              finalPrice, // Quantidade segura
              productData.name,
              productData.image,
              productData.size,
            ]
          );
        }
      }

      await client.query("COMMIT");
      return await this.getCanonicalCart(cartId);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("CRITICAL ERROR in mergeCart:", err);
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new CartRepository();
