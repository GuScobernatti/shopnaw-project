const CartRepository = require("../repositories/cartRepository");
const authenticateToken = require("../middleware/isAuthenticated");
const optionalAuthenticate = require("../middleware/optionalAuthenticate");

const { Router } = require("express");
const router = Router();

router.get("/", optionalAuthenticate, async (req, res, next) => {
  try {
    const userId = req.user?.userId || null;
    if (!userId) {
      return res.json({ items: [] });
    }

    const cart = await CartRepository.findOrCreateCart({ userId });
    const items = await CartRepository.getCartByCartId(cart.cart_id);

    res.json({ cart_id: cart.cart_id, items });
  } catch (err) {
    next(err);
  }
});

router.post("/replace", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cart = await CartRepository.findOrCreateCart({ userId });
    await CartRepository.replaceCartItems(cart.cart_id, req.body.items || []);
    const updated = await CartRepository.getCanonicalCart(cart.cart_id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.post("/merge", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cart = await CartRepository.findOrCreateCart({ userId });
    const merged = await CartRepository.mergeCart(
      cart.cart_id,
      req.body.items || []
    );
    res.json(merged);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
