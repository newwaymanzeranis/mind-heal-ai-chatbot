 
const { ChromaClient } = require("chromadb");
const { DefaultEmbeddingFunction } = require("@chroma-core/default-embed");

const chroma = new ChromaClient({
  host: "localhost",
  port: 8000,
  ssl: false,
});

let collection = null;

async function getCollection() {
  if (!collection) {
    collection = await chroma.getCollection({
      name: "mind_heal_products",
      embeddingFunction: new DefaultEmbeddingFunction(),
    });
  }

  return collection;
}

async function retrieveContext(question, nResults = 3) {
  const collection = await getCollection();

  const results = await collection.query({
    queryTexts: [question],
    nResults,
    include: ["documents", "metadatas", "distances"],
  });

  const documents = results.documents?.[0] || [];
  const metadatas = results.metadatas?.[0] || [];
  const distances = results.distances?.[0] || [];

  return documents.map((document, index) => ({
    document,
    metadata: metadatas[index],
    distance: distances[index],
  }));
}

module.exports = {
  retrieveContext,
};