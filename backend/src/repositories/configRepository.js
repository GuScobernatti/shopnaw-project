const pool = require("../pgPool");

class ConfigRepository {
  async getConfig() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM store_config LIMIT 1");
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateConfig(req, res) {
    const { site_title, whatsapp_number, announcement_bar } = req.body;

    const bannerDesktop = req.files?.banner_desktop
      ? req.files.banner_desktop[0].path
      : undefined;

    const bannerMobile = req.files?.banner_mobile
      ? req.files.banner_mobile[0].path
      : undefined;

    const client = await pool.connect();
    try {
      let query = `
        UPDATE store_config 
        SET site_title = $1, 
            whatsapp_number = $2, 
            announcement_bar = $3,
            updated_at = NOW()
      `;
      const values = [site_title, whatsapp_number, announcement_bar];

      let i = 4;
      if (bannerDesktop) {
        query += `, banner_desktop = $${i}`;
        values.push(bannerDesktop);
        i++;
      }

      if (bannerMobile) {
        query += `, banner_mobile = $${i}`;
        values.push(bannerMobile);
        i++;
      }

      query += ` WHERE id = (SELECT id FROM store_config LIMIT 1)`;

      await client.query(query, values);

      res.json({ message: "Configurações atualizadas!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao atualizar configs" });
    } finally {
      client.release();
    }
  }
}

module.exports = new ConfigRepository();
