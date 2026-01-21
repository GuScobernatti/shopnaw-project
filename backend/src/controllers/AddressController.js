const AddressRepository = require("../repositories/addressRepository");

class AddressController {
  async saveAddress(req, res) {
    try {
      const { userId } = req.user;
      const { zipCode, street, number, complement, neighborhood, city, state } =
        req.body;

      if (!zipCode || !street || !number || !city || !state) {
        return res
          .status(400)
          .json({ error: "Preencha os campos obrigatórios." });
      }

      const newAddress = await AddressRepository.createAddress({
        userId,
        zipCode,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
      });

      return res.status(201).json(newAddress);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao salvar endereço." });
    }
  }

  async getAddress(req, res) {
    try {
      const { userId } = req.user;
      const address = await AddressRepository.getAddressByUserId(userId);
      return res.json(address || {});
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar endereço." });
    }
  }
}

module.exports = new AddressController();
