const { getDB } = require("../config/db");

exports.addSale = async (req, res) => {
  const result = await getDB().collection("sales").insertOne(req.body);
  res.send(result);
};

exports.getSales = async (req, res) => {
  const sales = await getDB().collection("sales").find().toArray();
  res.send(sales);
};