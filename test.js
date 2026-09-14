 
const { ChromaClient } = require("chromadb");

async function main() {
  const client = new ChromaClient({
    path: "http://localhost:8000",
  });

  const heartbeat = await client.heartbeat();

  console.log("ChromaDB connected:", heartbeat);
}

main().catch((error) => {
  console.error("ChromaDB error:", error);
});