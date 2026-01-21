const pool = require("../pgPool");
const { v4: uuidv4 } = require("uuid");

class AddressRepository {
  async createAddress({
    userId,
    zipCode,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
  }) {
    const client = await pool.connect();
    try {
      const updateQuery = `
        UPDATE addresses 
        SET 
          zip_code = $1, 
          street = $2, 
          number = $3, 
          complement = $4, 
          neighborhood = $5, 
          city = $6, 
          state = $7,
          updated_at = NOW()
        WHERE user_id = $8::uuid
        RETURNING *
      `;

      const updateValues = [
        zipCode,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        userId,
      ];

      const { rows: updatedRows } = await client.query(
        updateQuery,
        updateValues
      );

      if (updatedRows.length > 0) {
        return updatedRows[0];
      }

      const addressId = uuidv4();
      const insertQuery = `
        INSERT INTO addresses 
        (address_id, user_id, zip_code, street, number, complement, neighborhood, city, state)
        VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const insertValues = [
        addressId,
        userId,
        zipCode,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
      ];
      const { rows: insertedRows } = await client.query(
        insertQuery,
        insertValues
      );
      return insertedRows[0];
    } catch (err) {
      console.error("Erro ao salvar endereço (Upsert):", err);
      throw err;
    } finally {
      client.release();
    }
  }

  async getAddressByUserId(userId) {
    const client = await pool.connect();
    try {
      // Pega o último endereço adicionado
      const query = `
        SELECT * FROM addresses 
        WHERE user_id = $1::uuid 
        LIMIT 1
      `;
      const { rows } = await client.query(query, [userId]);
      return rows[0];
    } catch (err) {
      console.error("Erro ao buscar endereço:", err);
      return null;
    } finally {
      client.release();
    }
  }
}

module.exports = new AddressRepository();
