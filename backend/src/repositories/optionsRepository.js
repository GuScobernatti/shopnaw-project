const pool = require("../pgPool");
const { v4 } = require("uuid");

class OptionsRepository {
  async getOptions(req, res) {
    const { type } = req.query;
    const client = await pool.connect();

    try {
      const query = type
        ? "SELECT * FROM product_options WHERE type = $1 ORDER BY value ASC"
        : "SELECT * FROM product_options ORDER BY type, value ASC";

      const values = type ? [type] : [];

      const result = await client.query(query, values);
      res.status(200).json(result.rows);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Erro ao buscar opções", details: err.message });
    } finally {
      client.release();
    }
  }

  async addOption(req, res) {
    const { type, value } = req.body;
    const client = await pool.connect();

    try {
      await client.query(
        "INSERT INTO product_options (id, type, value) VALUES ($1, $2, $3)",
        [v4(), type, value]
      );

      res.status(201).json({ message: "Opção adicionada com sucesso!" });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Erro ao adicionar opção", details: err.message });
    } finally {
      client.release();
    }
  }

  async deleteOption(req, res) {
    const { id } = req.params;
    const client = await pool.connect();

    try {
      const optionRes = await client.query(
        "SELECT * FROM product_options WHERE id = $1",
        [id]
      );

      if (optionRes.rows.length === 0) {
        return res.status(404).json({ error: "Opção não encontrada." });
      }

      const option = optionRes.rows[0];
      const { type, value } = option;

      let conflictQuery = "";
      if (type === "category") {
        conflictQuery = "SELECT 1 FROM products WHERE category = $1 LIMIT 1";
      } else if (type === "size") {
        conflictQuery = "SELECT 1 FROM products WHERE size = $1 LIMIT 1";
      }

      if (conflictQuery) {
        const conflictRes = await client.query(conflictQuery, [value]);

        if (conflictRes.rows.length > 0) {
          return res.status(409).json({
            error: "Não é possível excluir.",
            message: `Existem produtos cadastrados com ${
              type === "category" ? "a categoria" : "o tamanho"
            } "${value}". Remova ou edite os produtos antes de excluir esta opção.`,
          });
        }
      }

      await client.query("DELETE FROM product_options WHERE id = $1", [id]);
      res.status(204).send();
    } catch (err) {
      res
        .status(500)
        .json({ error: "Erro ao deletar opção", details: err.message });
    } finally {
      client.release();
    }
  }
}

module.exports = OptionsRepository;
