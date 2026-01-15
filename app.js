const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const salesRoutes = require("./routes/salesRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// Connect Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/product", productRoutes);
app.use("/cart", cartRoutes);
app.use("/review", reviewRoutes);
app.use("/payment", paymentRoutes);
app.use("/sales", salesRoutes);
app.use("/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Gadget Builder API is running");
});

module.exports = app;
