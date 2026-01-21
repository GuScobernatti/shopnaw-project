const DashboardRepository = require("../repositories/dashboardRepository");

class DashboardController {
  async getSummary(req, res) {
    try {
      const dashboardRepo = new DashboardRepository();
      const summary = await dashboardRepo.getDashboardSummary();
      return res.json(summary);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao carregar dashboard" });
    }
  }
}

module.exports = DashboardController;
