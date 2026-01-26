const axios = require("axios");

class ShippingController {
  async calculate(req, res) {
    try {
      const { zipCode, items } = req.body;

      if (!zipCode) {
        return res.status(400).json({ error: "CEP é obrigatório" });
      }

      const totalQuantity = items.reduce((acc, item) => {
        return acc + Number(item.quantity);
      }, 0);

      const cleanZip = zipCode.replace(/\D/g, "");
      const LOCAL_PREFIXES = ["350"];
      const isLocal = LOCAL_PREFIXES.some((prefix) =>
        cleanZip.startsWith(prefix),
      );

      let shippingOptions = [];
      if (isLocal) {
        shippingOptions.push({
          id: 1,
          name: "Entrega Local",
          price: totalQuantity >= 3 ? 0 : 5,
          days: 1,
          company_picture:
            "https://cdn-icons-png.flaticon.com/512/7541/7541900.png",
        });
      }

      // Se quiser dar opção de "Retirar na Loja" também:
      /*
        shippingOptions.push({
          id: 2,
          name: "Retirar na Loja",
          price: 0,
          days: 0,
          company_picture: "https://cdn-icons-png.flaticon.com/512/609/609752.png" 
        });
        */

      const productsPayload = items.map((item) => {
        const width = item.width ? Number(item.width) : 20;
        const height = item.height ? Number(item.height) : 5;
        const length = item.length ? Number(item.length) : 20;
        const weight = item.weight ? Number(item.weight) : 0.3;

        return {
          id: item.product_id,
          width: width, // cm
          height: height, // cm (camiseta dobrada)
          length: length, // cm
          weight: weight, // kg (300g)
          insurance_value: Number(item.price), // Valor segurado (Preço do produto)
          quantity: Number(item.quantity),
        };
      });

      const payload = {
        from: {
          postal_code: process.env.ZIPCODE_ORIGIN,
        },
        to: {
          postal_code: cleanZip, // CEP do Cliente
        },
        products: productsPayload,
        options: {
          receipt: false, // Aviso de recebimento (custo extra)
          own_hand: false, // Mãos próprias (custo extra)
        },
      };

      try {
        const response = await axios.post(
          `${process.env.MELHOR_ENVIO_URL}/api/v2/me/shipment/calculate`,
          payload,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
              "User-Agent": "Shopnaw/1.0 (shopnaw04@gmail.com)",
            },
          },
        );

        const apiOptions = response.data
          .filter((opt) => !opt.error) // Remove opções com erro (ex: transportadora indisponível pra região)
          .map((opt) => ({
            id: opt.id,
            name: opt.company.name + " " + opt.name, // Ex: "Correios SEDEX" ou "Jadlog .Package"
            price: Number(opt.price),
            days: opt.delivery_time,
            company_picture: opt.company.picture, // URL da logo da transportadora
          }));

        shippingOptions = [...shippingOptions, ...apiOptions];
      } catch (apiError) {
        console.error("Erro na API Melhor Envio:", apiError.message);
        if (shippingOptions.length === 0) {
          return res
            .status(500)
            .json({ error: "Erro ao calcular frete externo." });
        }
      }

      return res.json(shippingOptions);
    } catch (error) {
      console.error("Erro geral no frete:", error);
      return res.status(500).json({ error: "Falha ao calcular frete" });
    }
  }
}

module.exports = new ShippingController();
