const { MongoClient, ServerApiVersion } = require("mongodb");

let db;

const connectDB = async () => {
  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nyu5b.mongodb.net/?retryWrites=true&w=majority`;

  const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
  });

  try {
    await client.connect();
    db = client.db("productHolderDB");

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("DB Connection Failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.getDB = () => db;
