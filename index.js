const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());


console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nyu5b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const productCollection = client.db("productHolderDB").collection("product");
        const cartCollection = client.db("productHolderDB").collection("cart");
        const reviewCollection = client.db("productHolderDB").collection("review");

        app.get('/product', async (req, res) => {
            const cursor = productCollection.find();
            const result = await cursor.toArray();
            res.send(result);

        })

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.send(result);

        })

        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedProduct = req.body;
            const product = {
                $set: {
                    product_title: updatedProduct.product_title,
                    product_image: updatedProduct.product_image, price: updatedProduct.price,
                    rating: updatedProduct.rating,
                    category: updatedProduct.category,
                    description: updatedProduct.description,
                }
            }
            const result = await productCollection.updateOne(filter, product, options);
            res.send(result);
        })

        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct);
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })

        // cart related api

        app.post('/cart', async (req, res) => {
            const newCart = req.body;
            console.log(newCart);
            const result = await cartCollection.insertOne(newCart);
            res.send(result);
        })

        app.get('/cart', async (req, res) => {
            const cursor = cartCollection.find();
            const result = await cursor.toArray();
            res.send(result);

        })

        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })

        // Review related api
        app.post('/review', async (req, res) => {
            const newReview = req.body;
            console.log(newReview);
            const result = await reviewCollection.insertOne(newReview);
            res.send(result);
        })

        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find();
            const result = await cursor.toArray();
            res.send(result);

        })

        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

        // Payment gateway api
        app.post('/create-checkout-session', async (req, res) => {
            const { carts } = req.body;

            const line_items = carts.map(item => ({
                price_data: {
                    currency: 'bdt',
                    product_data: {
                        name: item.product_title || item.name || 'Item',
                    },
                    unit_amount: parseInt(item.price) * 10000, // Convert dollars to cents
                },
                quantity: 1,
            }));

            try {
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items,
                    mode: 'payment',
                    success_url: 'https://gadget-builder.firebaseapp.com/success',
                    cancel_url: 'https://gadget-builder.firebaseapp.com/success/dashboard',
                });

                res.send({ id: session.id });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to create Stripe session' });
            }
        });

        // After payment, clear the cart

        app.get('/cart/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await cartCollection.find(query).toArray();
            res.send(result);
        });

        // app.delete('/cart/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const result = await cartCollection.deleteMany({ email });
        //     res.send(result);
        // });

        // app.delete('/cart/:email', async (req, res) => {
        //     const email = req.params.email;
        //     try {
        //         const result = await cartCollection.deleteMany({ email: email });
        //         res.send(result);
        //     } catch (error) {
        //         console.error('Error deleting cart items:', error);
        //         res.status(500).send({ error: 'Internal Server Error' });
        //     }
        // });

        // app.delete('/cart/:email', async (req, res) => {
        //     const encodedEmail = req.params.email;
        //     const email = decodeURIComponent(encodedEmail); // 👈 VERY IMPORTANT

        //     console.log("Decoded email to delete:", email);

        //     try {
        //         const result = await cartCollection.deleteMany({ email: email });
        //         res.send(result);
        //     } catch (error) {
        //         console.error("Failed to delete cart items:", error);
        //         res.status(500).send({ error: "Failed to delete cart items" });
        //     }
        // });

        // app.delete('/cart/:email', async (req, res) => {
        //     const encodedEmail = req.params.email;
        //     const email = decodeURIComponent(encodedEmail); // ✅ Good

        //     console.log("Decoded email to delete:", email);

        //     try {
        //         const result = await cartCollection.deleteMany({ email: email });
        //         res.send(result);
        //     } catch (error) {
        //         console.error("Failed to delete cart items:", error); // ⛔ Log actual error
        //         res.status(500).json({ error: "Failed to delete cart items" });
        //     }
        // });

        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Gadget holder server in running')
})

app.listen(port, () => {
    console.log(`Gadget holder is running on port: ${port}`)
})