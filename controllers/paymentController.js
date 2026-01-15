const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  const { carts } = req.body;
  const line_items = carts.map(item => ({
    price_data: {
      currency: "bdt",
      product_data: { name: item.product_title || "Item" },
      unit_amount: parseInt(item.price) * 100, // Assuming price is per unit
    },
    quantity: item.quantity // Now uses cart.quantity
  }));
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel", // Changed to /cancel for better UX
    });
    res.send({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create Stripe session" });
  }
};
