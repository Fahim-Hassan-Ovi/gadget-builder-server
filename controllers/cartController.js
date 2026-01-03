const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

exports.addToCart = async (req, res) => {
  const result = await getDB().collection("cart").insertOne(req.body);
  res.send(result);
};

exports.getCart = async (req, res) => {
  const items = await getDB().collection("cart").find().toArray();
  res.send(items);
};

exports.getCartByEmail = async (req, res) => {
  const email = req.params.email;
  const items = await getDB().collection("cart").find({ email }).toArray();
  res.send(items);
};

exports.deleteCartItem = async (req, res) => {
  const id = req.params.id;
  const result = await getDB()
    .collection("cart")
    .deleteOne({ _id: new ObjectId(id) });

  res.send(result);
};
