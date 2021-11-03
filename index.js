const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pd5gx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db('deliverExServer');
        const serviceCollection = database.collection('service');
        const orderCollection = database.collection('order');

        // get API - all data(service) load 
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services)
        })

        // get API - all data(data) load 
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const services = await cursor.toArray();
            res.send(services)
        });

        // get API - single data of service load 
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.json(service);
        })

        //post API-add new service
        app.post('/addServices', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService)
            res.json(result);

        });

        //post API- add order
        app.post('/order', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            res.json(result);

        });

        // get API - single data of order load 
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await orderCollection.findOne(query);
            res.json(service);
        })

        //DELETE API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        });

        //UPDATE API
        app.put('/order/:id', async (req, res) => {

            const id = req.params.id;
            const updatedOrder = req.body;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    status: updatedOrder.status
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)

            console.log('Updating id = ', id)
            res.send(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('deliverEx Server is Running')
});

app.listen(port, () => {
    console.log("Listening from port = ", port);
});