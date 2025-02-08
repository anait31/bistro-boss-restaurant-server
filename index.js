const express = require('express');
require('dotenv').config()
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rsynxg9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const menuCollections = client.db("bistroBossDB").collection("menus");
    const reviewsCollections = client.db("bistroBossDB").collection("reviews");
    const cartsCollections = client.db("bistroBossDB").collection("carts");


    app.get('/menu', async(req, res) => {
        const result = await menuCollections.find().toArray();
        res.send(result);
    })

    app.get('/reviews', async(req, res) => {
        const result = await reviewsCollections.find().toArray();
        res.send(result);
    })

    // Cart Collections
    app.get('/carts', async(req, res) => {
        const result = await cartsCollections.find().toArray();
        res.send(result)
    })

    app.post('/carts', async(req, res) => {
        const cart = req.body;
        const result = await cartsCollections.insertOne(cart);
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Bistro boss is running')
})

app.listen(port, () => {
    console.log(`Bistro Boss Is Running On Port ${port}`)
})