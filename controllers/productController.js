const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

exports.getProducts = async (req, res) => {
  const products = await getDB().collection("product").find().toArray();
  res.send(products);
};

exports.getProductById = async (req, res) => {
  const id = req.params.id;
  const product = await getDB()
    .collection("product")
    .findOne({ _id: new ObjectId(id) });

  res.send(product);
};

exports.addProduct = async (req, res) => {
  const result = await getDB().collection("product").insertOne(req.body);
  res.send(result);
};

exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  const result = await getDB()
    .collection("product")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: req.body },
      { upsert: true }
    );

  res.send(result);
};

exports.deleteProduct = async (req, res) => {
  const id = req.params.id;
  const result = await getDB()
    .collection("product")
    .deleteOne({ _id: new ObjectId(id) });

  res.send(result);
};
