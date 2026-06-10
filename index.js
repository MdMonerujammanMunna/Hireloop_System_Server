const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require("dotenv").config()
const cors = require("cors")
const app = express()

app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
    res.send('I am fine GO=>')
})




const port = process.env.PORT || 3000
const uri = process.env.MOGOBD_URI;

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
        await client.connect();


        const database = client.db("Hireloop_System");
        const JobCollection = database.collection("Jobs");

        app.post("/api/jobs", async (req, res) => {
            try {
                const job = req.body
                const result = await JobCollection.insertOne(job);
                res.send(result)
            } catch (err) {
                console.error("Failed to insert job:", err)
                res.status(500).send({ error: err.message })
            }
        })
        app.get("/api/jobs", async (req, res) => {
            const query = {}
            if (req.query.companyId) {
                query.companyId = req.query.companyId
            }
            if (req.query.status) {
                query.status = req.query.status
            }

            const cursor = JobCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);






app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})