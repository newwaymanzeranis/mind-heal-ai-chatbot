 require("dotenv").config();
const { CloudClient } = require("chromadb");

async function test() {

  const chroma = new CloudClient({
    apiKey: process.env.CHROMA_API_KEY,
  tenant: process.env.CHROMA_TENANT,
  database: process.env.CHROMA_DATABASE,
  });

  console.log("Testing Chroma Cloud...");

  const collections = await chroma.listCollections();

  console.log("Collections:");
  console.dir(collections, { depth: null });
}

test().catch(error => {
  console.error("CHROMA CLOUD ERROR:");
  console.error(error);
});