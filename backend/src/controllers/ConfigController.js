const ConfigRepository = require("../repositories/configRepository");

class ConfigController {
  async getConfig(req, res) {
    try {
      const config = await ConfigRepository.getConfig();
      return res.json(config || {});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar configurações" });
    }
  }

  async updateConfig(req, res) {
    try {
      await ConfigRepository.updateConfig(req, res);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar configurações" });
    }
  }
}

module.exports = new ConfigController();
