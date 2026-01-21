const { Router } = require("express");

const { upload } = require("../middleware/multer");
const DashboardRepository = require("../repositories/dashboardRepository");
const DashboardController = require("../controllers/DashboardController");
const ConfigController = require("../controllers/ConfigController");

const authenticateToken = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");

const productsRoutes = Router();
const dashboardRepository = new DashboardRepository();
const dashboardController = new DashboardController();

productsRoutes.get(
  "/dashboard/summary",
  authenticateToken,
  isAdmin,
  async (request, response) => {
    await dashboardController.getSummary(request, response);
  }
);

productsRoutes.get("/dashboard", async (request, response) => {
  await dashboardRepository.getProducts(request, response);
});

productsRoutes.get("/dashboard/:id", async (request, response) => {
  await dashboardRepository.getProductById(request, response);
});

productsRoutes.get("/config", ConfigController.getConfig);

productsRoutes.post(
  "/dashboard",
  authenticateToken,
  isAdmin,
  upload.single("image"),
  async (request, response) => {
    await dashboardRepository.createProduct(request, response);
  }
);

productsRoutes.delete(
  "/dashboard/:id",
  authenticateToken,
  isAdmin,
  async (request, response) => {
    await dashboardRepository.deleteProduct(request, response);
  }
);

productsRoutes.put(
  "/dashboard/:id",
  authenticateToken,
  isAdmin,
  upload.single("image"),
  async (request, response) => {
    await dashboardRepository.editProduct(request, response);
  }
);

productsRoutes.put(
  "/config",
  authenticateToken,
  isAdmin,
  upload.fields([
    { name: "banner_desktop", maxCount: 1 },
    { name: "banner_mobile", maxCount: 1 },
  ]),
  ConfigController.updateConfig
);

module.exports = productsRoutes;
