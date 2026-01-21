const PaymentController = require("../controllers/PaymentController");
const { Router } = require("express");
const paymentRoutes = Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");
const OrderController = require("../controllers/OrderController");

paymentRoutes.post(
  "/checkout/process_payment",
  isAuthenticated,
  PaymentController.createPayment
);

paymentRoutes.get("/my-orders", isAuthenticated, OrderController.getUserOrders);

// Rotas ADMIN (Em produção, você criaria um middleware 'isAdmin', mas o isAuthenticated serve por enquanto)
paymentRoutes.get(
  "/admin/orders",
  isAuthenticated,
  isAdmin,
  OrderController.getAllOrdersAdmin
);
paymentRoutes.put(
  "/admin/orders/:id/status",
  isAuthenticated,
  isAdmin,
  OrderController.updateStatus
);

module.exports = paymentRoutes;
