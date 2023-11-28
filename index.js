const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000;

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

var cookieParser = require('cookie-parser')

app.use(express.json());
app.use(cors());

app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World!')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jp082z4.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.db("admin").command({ ping: 1 });

        const featuredCollection = client.db("techDB").collection("featuredProduct");
        const trandingCollection = client.db("techDB").collection("trandingProducts");
        const usersCollection = client.db("techDB").collection("usersProducts");
        const allCollection = client.db("techDB").collection("AllProducts");
        const reviewCollection = client.db("techDB").collection("review");

        app.get("/featuredProduct", async (req, res) => {
            const result = await featuredCollection.find().toArray();
            res.send(result)
        })

        app.get("/featuredProduct/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await featuredCollection.findOne(query);
            res.send(result);
        });

        app.get("/trandingProduct", async (req, res) => {
            const result = await trandingCollection.find().toArray();
            res.send(result)
        })

        app.get("/trandingProduct/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await trandingCollection.findOne(query);
            res.send(result);
        });

        app.post("/users", async (req, res) => {
            const data = req.body
            const result = await usersCollection.insertOne(data)
            res.send(result);
        });

        app.get("/users", async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await usersCollection.find(query).toArray();
            res.send(result)
        })

        app.put("/users", async (req, res) => {
            const email = req.query.email
            const query = { email: email }

            const updatedData = {
                $set: {
                    subscribe: true
                }
            }
            const result = await usersCollection.updateOne(query, updatedData)
            res.send(result)
        });

        app.post("/allProduct", async (req, res) => {
            const data = req.body
            const result = await allCollection.insertOne(data)
            res.send(result)
        })

        app.get("/allProduct", async (req, res) => {
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            const tag = req.query.tag;
            const query = {tag:{$regex: tag , $options:"i"}}; 
            const result = await allCollection.find(query).skip(page * size).limit(size).toArray();
            res.send(result)
        })

        app.get("/allProductCount", async (req, res) => {
            const count = await allCollection.estimatedDocumentCount();
            res.send({ count });
        });

        app.get("/AllProduct/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await allCollection.findOne(query);
            res.send(result);
        });



        app.post("/review", async (req, res) => {
            const data = req.body
            const result = await reviewCollection.insertOne(data)
            res.send(result)
        });

        app.get("/review", async (req, res) => {
            const id = req.query.id;
            let query = {}
            if (id) {
                query = { productId: id }
            }
            const result = await reviewCollection.find(query).toArray();
            res.send(result)
        })


        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = parseInt(price * 100);
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });

            res.send({
                clientSecret: paymentIntent.client_secret
            })
        });

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})