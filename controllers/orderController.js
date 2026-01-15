const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const PDFDocument = require("pdfkit");

exports.createOrder = async (req, res) => {
  try {
    const { email, carts, transactionId } = req.body;

    if (!email || !carts?.length) {
      return res.status(400).send({ error: "Invalid order data" });
    }

    const order = {
      email,
      items: carts.map(cart => ({
        product_id: cart.product_id,
        product_title: cart.product_title,
        price: parseInt(cart.price),
        quantity: cart.quantity,
        total: parseInt(cart.price) * cart.quantity
      })),
      totalAmount: carts.reduce(
        (sum, c) => sum + parseInt(c.price) * c.quantity,
        0
      ),
      paymentStatus: "paid",
      transactionId,
      date: new Date()
    };

    // 1️⃣ Save order
    const result = await getDB().collection("orders").insertOne(order);

    // 2️⃣ Clear cart + update product + add sales
    for (const cart of carts) {
      await getDB().collection("cart").deleteOne({ _id: new ObjectId(cart._id) });

      await getDB().collection("product").updateOne(
        { _id: new ObjectId(cart.product_id) },
        { $inc: { quantity: -cart.quantity } }
      );

      await getDB().collection("sales").insertOne({
        date: new Date(),
        product_id: cart.product_id,
        product_title: cart.product_title,
        quantity: cart.quantity,
        revenue: cart.quantity * parseInt(cart.price),
        email
      });
    }

    res.send({
      success: true,
      orderId: result.insertedId
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Order creation failed" });
  }
};

// 📄 DOWNLOAD RECEIPT (PDF)
exports.downloadReceipt = async (req, res) => {
  const order = await getDB()
    .collection("orders")
    .findOne({ _id: new ObjectId(req.params.id) });

  if (!order) return res.status(404).send("Order not found");

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${order._id}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text("Gadget Builder Receipt", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Order ID: ${order._id}`);
  doc.text(`Email: ${order.email}`);
  doc.text(`Date: ${order.date.toDateString()}`);
  doc.moveDown();

  order.items.forEach(item => {
    doc.text(
      `${item.product_title} | ${item.quantity} x ${item.price} = ${item.total}`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text(`Total Amount: ${order.totalAmount} BDT`, {
    align: "right"
  });

  doc.end();
};
