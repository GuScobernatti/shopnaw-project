const { Router } = require("express");
const AddressController = require("../controllers/AddressController");
const isAuthenticated = require("../middleware/isAuthenticated");

const addressRoutes = Router();

addressRoutes.post("/address", isAuthenticated, AddressController.saveAddress);
addressRoutes.get("/address", isAuthenticated, AddressController.getAddress);

module.exports = addressRoutes;
