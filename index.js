const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const CompanyCollection = database.collection("Companies");

        // Jobs Posted by the Recruiter's Company
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

        //Jobs retrieved successfully for the recruiter's company.
        app.get("/api/jobs", async (req, res) => {
            const query = {}
            if (req.query.companyId) {
                query.companyId = req.query.companyId
            }
            // Apply additional status-based filtering :-

            // if (req.query.status) {
            //     query.status = req.query.status
            // }

            const cursor = JobCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // Company Registration by the Recruiter
        app.post("/api/register/company", async (req, res) => {

            try {
                const company = req.body
                const result = await CompanyCollection.insertOne(company);
                res.send(result)
            } catch (err) {
                console.error("Failed to insert company:", err)
                res.status(500).send({ error: err.message })
            }
        })

        // Company Registration Successfully Retrieved by the Recruiter
        app.get("/api/register/company/get", async (req, res) => {
            const query = {}
            // console.log(req.query)
            if (req.query.UserID) {
                query.UserID = req.query.UserID
            }
            const cursor = CompanyCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        // Delete Jobs From MongoDb
        app.delete("/api/jobs/delete/HowCreatethis", async (req, res) => {

            const { jobsId } = req.body;

            const result = await JobCollection.deleteOne({
                _id: new ObjectId(jobsId),
            });
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