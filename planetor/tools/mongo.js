


const Moralis = require("moralis-v1/node");

const { MongoClient } = require('mongodb');

const MONGO_HOST = '137.184.69.83';
const MONGO_PORT = '56728';

// Create a new MongoClient
const client = new MongoClient(`mongodb://${MONGO_HOST}:${MONGO_PORT}`);

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db('admin').command({ ping: 1 });
    console.log('Connected successfully to server');
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
