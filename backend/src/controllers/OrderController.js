const OrderRepository = require("../repositories/ordersRepository");
const pool = require("../pgPool");
const sendStatusEmail = require("../utils/emailSender");

class OrderController {
  async getUserOrders(req, res) {
    try {
      const { userId } = req.user;
      const orders = await OrderRepository.getOrdersByUser(userId);
      return res.json(orders);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      return res
        .status(500)
        .json({ error: "Erro ao buscar histórico de pedidos." });
    }
  }

  async getAllOrdersAdmin(req, res) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const orders = await OrderRepository.getAllOrders(page, limit);
      return res.json(orders);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar pedidos do admin." });
    }
  }

  async updateStatus(req, res) {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const { status: newStatus, trackingCode } = req.body; // pending, approved, sent, delivered, cancelled

      const order = await OrderRepository.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado" });
      }

      const currentStatus = order.status;
      const cancelledGroup = ["cancelled", "rejected"];
      const activeGroup = ["pending", "approved", "sent", "delivered"];
      const isNowCancelled = cancelledGroup.includes(newStatus);
      const wasCancelled = cancelledGroup.includes(currentStatus);
      const isNowActive = activeGroup.includes(newStatus);
      const wasActive = activeGroup.includes(currentStatus);

      let items = order.items;
      if (typeof items === "string") {
        try {
          items = JSON.parse(items);
        } catch (e) {
          console.error("Erro ao parsear items do pedido:", e);
        }
      }

      if (wasActive && isNowCancelled) {
        if (Array.isArray(items)) {
          for (const item of items) {
            await client.query(
              `UPDATE products 
               SET quantity = quantity::integer + $1 
               WHERE product_id = $2`,
              [Number(item.quantity), item.product_id]
            );
          }
        }
      } else if (wasCancelled && isNowActive) {
        if (Array.isArray(items)) {
          for (const item of items) {
            await client.query(
              `UPDATE products 
               SET quantity = GREATEST(0, quantity::integer - $1) 
               WHERE product_id = $2`,
              [Number(item.quantity), item.product_id]
            );
          }
        }
      }

      const updated = await OrderRepository.updateOrderStatus(
        id,
        newStatus,
        trackingCode
      );

      await sendStatusEmail(order, newStatus, trackingCode);

      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar status." });
    } finally {
      client.release();
    }
  }
}

module.exports = new OrderController();
