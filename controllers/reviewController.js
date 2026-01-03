const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

exports.addReview = async (req, res) => {
  const result = await getDB().collection("review").insertOne(req.body);
  res.send(result);
};

exports.getReviews = async (req, res) => {
  const reviews = await getDB().collection("review").find().toArray();
  res.send(reviews);
};

exports.deleteReview = async (req, res) => {
  const id = req.params.id;
  const result = await getDB()
    .collection("review")
    .deleteOne({ _id: new ObjectId(id) });

  res.send(result);
};
