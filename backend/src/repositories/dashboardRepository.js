const pool = require("../pgPool");
const { v4 } = require("uuid");

class DashboardRepository {
  async createProduct(request, response) {
    const {
      name,
      size,
      category,
      price,
      quantity,
      description,
      weight,
      width,
      height,
      length,
    } = request.body;
    const image = request.file ? request.file.path : null;
    const dateTime = new Date();
    const formatedDateTime = dateTime.toISOString();

    const client = await pool.connect();

    try {
      const valWeight = weight ? Number(weight) : 0.3;
      const valWidth = width ? Number(width) : 20;
      const valHeight = height ? Number(height) : 5;
      const valLength = length ? Number(length) : 20;

      await client.query(
        `INSERT INTO products (product_id, name, size, category, price, image, timestamp, quantity, 
        description, weight, width, height, length) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          v4(),
          name,
          size,
          category,
          price,
          image,
          formatedDateTime,
          quantity,
          description,
          valWeight,
          valWidth,
          valHeight,
          valLength,
        ],
      );

      response.status(201).json({ message: "Produto criado com sucesso!" });
    } catch (err) {
      response.status(500).json({ error: err, details: err.message });
    } finally {
      client.release();
    }
  }

  async getProducts(request, response) {
    const client = await pool.connect();
    const { category, size, onlyOld } = request.query;
    let page = parseInt(request.query.page) || 1;
    let limit = parseInt(request.query.limit) || 10;

    try {
      const filters = [];
      const values = [];

      if (category) {
        filters.push(`category = $${values.length + 1}`);
        values.push(category);
      }

      if (size) {
        filters.push(`size = $${values.length + 1}`);
        values.push(size);
      }

      if (onlyOld === "true") {
        filters.push(`timestamp < NOW() - INTERVAL '5 days'`);
      }

      if (request.query.onlyNew === "true") {
        filters.push(`timestamp >= NOW() - INTERVAL '5 days'`);
      }

      const qRaw = (request.query.q || "").trim();
      let rankSelect = null;
      if (qRaw) {
        const terms = qRaw
          .split(/\s+/)
          .map((t) => t.replace(/[^\p{L}\p{N}_-]/gu, "").trim())
          .filter(Boolean);

        if (terms.length > 0) {
          const tsQuery = terms.map((t) => `${t}:*`).join(" & ");

          const qIdx = values.length + 1;
          const ilikeIdx = qIdx + 1;

          filters.push(
            `(tsv @@ to_tsquery('portuguese', $${qIdx}) OR name ILIKE $${ilikeIdx})`,
          );

          rankSelect = `ts_rank_cd(tsv, to_tsquery('portuguese', $${qIdx})) AS rank`;

          values.push(tsQuery, `%${qRaw}%`);
        } else {
          const qIdx = values.length + 1;
          filters.push(`name ILIKE $${qIdx}`);
          values.push(`%${qRaw}%`);
        }
      }

      const whereClause = filters.length
        ? `WHERE ${filters.join(" AND ")}`
        : "";

      const countQuery = `SELECT COUNT(*) FROM products ${whereClause}`;
      const countResult = await client.query(countQuery, values);
      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / limit);

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages || 1;
      const offset = (page - 1) * limit;

      const selectFields = [
        "product_id",
        "name",
        "size",
        "category",
        "price",
        "image",
        "timestamp",
        "quantity",
        "description",
        "weight",
        "width",
        "height",
        "length",
      ];
      if (rankSelect) selectFields.push(rankSelect);

      const dataQuery = `
      SELECT ${selectFields.join(", ")}
      FROM products
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
      values.push(limit, offset);

      const result = await client.query(dataQuery, values);

      return response.status(200).json({
        products: result.rows,
        total,
        totalPages,
        page,
      });
    } catch (err) {
      return response
        .status(500)
        .json({ error: err, message: "Erro ao buscar produtos!" });
    } finally {
      client.release();
    }
  }

  async deleteProduct(request, response) {
    const client = await pool.connect();
    const { id } = request.params;

    try {
      await client.query("DELETE FROM products WHERE product_id=$1", [id]);

      response.status(204).send();
    } catch (err) {
      response
        .status(500)
        .json({ err: err, message: "Erro ao deletar produto." });
    } finally {
      client.release();
    }
  }

  async editProduct(request, response) {
    const {
      name,
      size,
      category,
      price,
      quantity,
      description,
      weight,
      width,
      height,
      length,
    } = request.body;
    const { id } = request.params;

    const client = await pool.connect();

    try {
      const existing = await client.query(
        "SELECT * FROM products WHERE product_id = $1",
        [id],
      );
      if (!existing.rows.length) {
        return response.status(404).json({ error: "Produto não encontrado." });
      }

      const oldImage = existing.rows[0].image;
      let newImage = oldImage;

      if (request.file) {
        newImage = request.file.path;
      }

      const valWeight = weight ? Number(weight) : 0.3;
      const valWidth = width ? Number(width) : 20;
      const valHeight = height ? Number(height) : 5;
      const valLength = length ? Number(length) : 20;

      await client.query(
        `UPDATE products SET name=$1, size=$2, category=$3, price=$4, image=$5, quantity=$6, 
        description=$7, weight=$9, width=$10, height=$11, length=$12 WHERE product_id=$8`,
        [
          name,
          size,
          category,
          price,
          newImage,
          quantity,
          description,
          id,
          valWeight,
          valWidth,
          valHeight,
          valLength,
        ],
      );

      response.status(200).json({ message: "Produto editado com sucesso!" });
    } catch (err) {
      response
        .status(500)
        .json({ err: err, message: "Erro ao atualizar produto!" });
    } finally {
      client.release();
    }
  }

  async getProductById(request, response) {
    const client = await pool.connect();
    const { id } = request.params;
    try {
      const { rows } = await client.query(
        `SELECT product_id, name, size, category, price, image, timestamp, quantity, description, 
         weight, width, height, length
         FROM products
         WHERE product_id = $1`,
        [id],
      );

      if (!rows.length) {
        return response.status(404).json({ error: "Produto não encontrado." });
      }

      return response.status(200).json(rows[0]);
    } catch (err) {
      return response
        .status(500)
        .json({ error: err, message: "Erro ao buscar produto." });
    } finally {
      client.release();
    }
  }

  async getDashboardSummary() {
    const client = await pool.connect();
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        client.query("SELECT COUNT(*) FROM products"),
        client.query("SELECT COUNT(*) FROM orders"),
        client.query("SELECT COUNT(*) FROM users"),
      ]);

      const counts = {
        products: Number(productsRes.rows[0].count),
        orders: Number(ordersRes.rows[0].count),
        users: Number(usersRes.rows[0].count),
      };

      // 2. Gráfico de Vendas (Últimos 7 dias)
      const salesQuery = `
        SELECT 
          TO_CHAR(created_at, 'DD/MM') as day, 
          SUM(total_amount) as total
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '7 days'
        AND status IN ('approved', 'delivered', 'sent', 'in_process') -- Filtra apenas vendas reais
        GROUP BY day
        ORDER BY MIN(created_at) ASC
      `;
      const salesRes = await client.query(salesQuery);

      // 3. Gráfico de Status (Pizza)
      const statusQuery = `
        SELECT status, COUNT(*) as count
        FROM orders
        GROUP BY status
      `;
      const statusRes = await client.query(statusQuery);

      return {
        counts,
        salesChart: salesRes.rows,
        statusChart: statusRes.rows,
      };
    } catch (err) {
      console.error("Erro ao buscar resumo do dashboard:", err);
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = DashboardRepository;
