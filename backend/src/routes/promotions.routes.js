const { Router } = require("express");
const PromotionsRepository = require("../repositories/promotionsRepository");

const authenticateToken = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");

const promotionsRoutes = Router();
const promotionsRepository = new PromotionsRepository();

promotionsRoutes.post("/", authenticateToken, isAdmin, (req, res) =>
  promotionsRepository.createPromotion(req, res)
);
promotionsRoutes.get("/", (req, res) =>
  promotionsRepository.getPromotions(req, res)
);

promotionsRoutes.put("/:id", authenticateToken, isAdmin, (req, res) =>
  promotionsRepository.updatePromotion(req, res)
);

module.exports = promotionsRoutes;
