const express = require("express");
const OptionsRepository = require("../repositories/optionsRepository");

const authenticateToken = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();
const controller = new OptionsRepository();

router.get("/", controller.getOptions);
router.post("/", authenticateToken, isAdmin, controller.addOption);
router.delete("/:id", authenticateToken, isAdmin, controller.deleteOption);

module.exports = router;
