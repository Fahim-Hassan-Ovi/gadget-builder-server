const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.post("/", cartController.addToCart);
router.get("/", cartController.getCart);
router.get("/:email", cartController.getCartByEmail);
router.delete("/:id", cartController.deleteCartItem);

module.exports = router;
