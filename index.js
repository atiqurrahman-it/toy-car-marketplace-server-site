const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// ------------mongoDB start-----------------------

const uri = `mongodb+srv://${process.env.ENV_DB_User}:${process.env.ENV_DB_PASS}@cluster0.4aqqhbm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    client.connect();

    const database = client.db("toy-cars-marketplace");
    const toyCollection = database.collection("toy-cars");
    const categoryCollection = database.collection("categorys");

    // -------------other routes ----------------start ------------------

    app.get("/category", async (req, res) => {
      const cursor = categoryCollection.find().limit(8);
      const result = await cursor.toArray();
      res.send(result);
    });
    // picture route for Gallery section
    app.get("/gallery", async (req, res) => {
      const query = {};
      const options = {
        projection: {
          photo: 1,
        },
      };
      const cursor = toyCollection.find(query, options).limit(8);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/toys-by-category", async (req, res) => {
      let query = {};
      if (req.query?.category_name) {
        query= {category :req.query.category_name}
      }

      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    // search by toy name 
    app.get("/search-by-toy-name", async (req, res) => {
      let query = {};
      if (req.query?.toy_name) {
        console.log(req.query.toy_name)
        query = { name: req.query.toy_name };
      }

      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    // -----------------other routes ----------------end ------------------

    // ---------------- my toys --------------
    //http://localhost:5000/my-toys?email=atik@gmail.com
    // hitting the url then access req.query = { email: 'atik@gmail.com' }
    // req.query.email == atik@gmil.com

    app.get("/my-toys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { seller_email: req.query.email };
      }
      // console.log(query);
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

   

   




    app.get("/my-toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: { name: 1, price: 1, quantity: 1, description: 1 },
      };
      const result = await toyCollection.findOne(query, options);
      res.send(result);
    });

    app.patch("/my-toys/:id", async (req, res) => {
      const id = req.params.id;
      const updateMyToy = req.body;
      // const options = { upsert: true };
      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          name: updateMyToy.name,
          price: updateMyToy.price,
          quantity: updateMyToy.quantity,
          description: updateMyToy.description,
        },
      };

      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/my-toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    // --------------------toy routes -----------------
    // user add toy
    app.get("/toy-cars", async (req, res) => {
      // optional
      const query = {};
      const options = {
        projection: {
          photo: 1,
          _id:1,
          name: 1,
          category: 1,
          seller_name: 1,
          price: 1,
          quantity: 1,
        },
      };

      // const cursor =  toyCollection.find();
      const cursor = toyCollection.find(query, options).sort({ _id: -1 }).limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/toy-cars/:id", async (req, res) => {
      const Id = req.params.id;
      const query = { _id: new ObjectId(Id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.post("/add-a-toy", async (req, res) => {
      const toyCar = req.body;
      console.log(toyCar);
      result = await toyCollection.insertOne(toyCar);
      res.send(result);
    });
    //--------------------- toy routes------------

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// mongoDB  end

app.get("/", (req, res) => {
  res.send("toy cars marketplace server is running ");
});

app.listen(port, () => {
  console.log(`toy cars marketplace server is running on port ${port}`);
});
