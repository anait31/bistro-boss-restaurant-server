const express = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        const usersCollections = client.db("bistroBossDB").collection("users");
        const menuCollections = client.db("bistroBossDB").collection("menus");
        const reviewsCollections = client.db("bistroBossDB").collection("reviews");
        const cartsCollections = client.db("bistroBossDB").collection("carts");


        // JWT Related API
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1h'
            })
            res.send({ token });
            
        })

        const verifyToken = (req, res, next) => {
            // console.log('Inside Verify Token', req.headers.authorization);
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'Unauthorized Access' });
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
                if (error) {
                    return res.status(401).send({ message: 'Unauthorized Access' });
                }
                req.decoded = decoded;
                next()
            })
        }

        // User Collections
        app.post('/users', async (req, res) => {
            const user = req.body
            const query = { email: user?.email };
            const isExistUser = await usersCollections.findOne(query);
            if (isExistUser) {
                return res.send({ message: "User Already Exist", insertedId: null })
            }
            const result = await usersCollections.insertOne(user);
            res.send(result)
        })

        app.get('/users', verifyToken, async (req, res) => {
            // console.log(req.headers)
            const result = await usersCollections.find().toArray();
            res.send(result);
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollections.updateOne(filter, updatedDoc);
            res.send(result)
        })

        app.get('/user/admin/:email', verifyToken, async(req, res) => {
            const email = req.params?.email;
            if(email !== req?.decoded?.email) {
                return res.status(403).send({message: 'unauthorizes Access'})
            }

            const query = {email: email};
            const user = await usersCollections.findOne(query);
            let admin = false;
            if(user) {
                admin = user?.role === 'admin'
            }
            res.send({admin})
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await usersCollections.deleteOne(query);
            res.send(result);
        })


        app.get('/menu', async (req, res) => {
            const result = await menuCollections.find().toArray();
            res.send(result);
        })

        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollections.find().toArray();
            res.send(result);
        })

        // Cart Collections
        app.get('/carts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await cartsCollections.find(query).toArray();
            res.send(result)
        })

        app.post('/carts', async (req, res) => {
            const cart = req.body;
            const result = await cartsCollections.insertOne(cart);
            res.send(result);
        })

        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartsCollections.deleteOne(query);
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