require("dotenv").config();

const { env } = require("@huggingface/transformers");

env.cacheDir = "/tmp/transformers-cache";

const { CloudClient } = require("chromadb");
const { DefaultEmbeddingFunction } = require("@chroma-core/default-embed");

const { expandQuery } = require("./rag/query-expansion");
const { rerankResults } = require("./rag/hybrid-search");
const { generateAnswer } = require("./rag/answer");


async function searchProduct(query) {

  // ==========================================
  // CHROMA
  // ==========================================
  console.log("🔥 CHROMA CLOUD VERSION 2026");

  const chroma = new CloudClient({
    apiKey: process.env.CHROMA_API_KEY,
  tenant: process.env.CHROMA_TENANT,
  database: process.env.CHROMA_DATABASE,
  });

console.log("🔥 USING CHROMA CLOUD");

  const collection = await chroma.getOrCreateCollection({
    name: "mind_heal_products",
    embeddingFunction: new DefaultEmbeddingFunction(),
  }); 



  // ==========================================
  // USER QUERY
  // ==========================================

  console.log("\n===== USER QUESTION =====\n");
  console.log(query);


  // ==========================================
  // QUERY EXPANSION
  // ==========================================

  const expandedQueries =
    await expandQuery(query);


  console.log("\n===== EXPANDED QUERIES =====\n");

  console.dir(expandedQueries, {
    depth: null
  });


  // ==========================================
  // ALWAYS KEEP ORIGINAL QUERY
  // ==========================================

  const searchQueries = [
    query,
    ...expandedQueries
  ];


  // Remove duplicate queries

  const uniqueQueries = [
    ...new Set(
      searchQueries
        .map(q => q.trim())
        .filter(Boolean)
    )
  ];


  console.log("\n===== SEARCH QUERIES =====\n");

  console.dir(uniqueQueries, {
    depth: null
  });


  // ==========================================
  // CHROMA SEMANTIC SEARCH
  // ==========================================

  const candidateMap = new Map();


  for (const searchQuery of uniqueQueries) {

    console.log(
      `\nSearching Chroma for: ${searchQuery}`
    );


    const result = await collection.query({

      queryTexts: [searchQuery],

      nResults: 10,

      include: [
        "metadatas",
        "documents",
        "distances"
      ]

    });


    const ids =
      result.ids?.[0] || [];

    const distances =
      result.distances?.[0] || [];

    const metadatas =
      result.metadatas?.[0] || [];

    const documents =
      result.documents?.[0] || [];


    for (let i = 0; i < ids.length; i++) {

      const id = ids[i];


      if (!candidateMap.has(id)) {

        candidateMap.set(id, {

          id,

          metadata: metadatas[i],

          document: documents[i],

          distance: distances[i],

          semanticRanks: []

        });

      }


      const candidate =
        candidateMap.get(id);


      // Rank from this particular query

      candidate.semanticRanks.push(i);


      // Keep best distance

      if (
        distances[i] !== undefined &&
        (
          candidate.distance === undefined ||
          distances[i] < candidate.distance
        )
      ) {

        candidate.distance =
          distances[i];

      }

    }

  }


  // ==========================================
  // CANDIDATES
  // ==========================================

  const candidates =
    Array.from(candidateMap.values());


  console.log("\n===== UNIQUE CANDIDATES =====\n");

  console.log(
    `Total candidates: ${candidates.length}`
  );


  // ==========================================
  // HYBRID RERANKING
  // ==========================================

  const rankedResults =
    rerankResults(
      candidates,
      uniqueQueries
    );


  // ==========================================
  // FINAL RESULTS
  // ==========================================

  console.log("\n===== HYBRID RERANKED RESULTS =====\n");


  rankedResults
    .slice(0, 10)
    .forEach((product, index) => {

      const p =
        product.metadata || {};


      console.log(
        `${index + 1}. ${p.name}`
      );

      console.log(
        `   Mind Heal No: ${p.mind_heal_no}`
      );

      console.log(
        `   MySQL ID: ${p.mysql_id}`
      );

      console.log(
        `   Chroma Distance: ${product.distance}`
      );

      console.log(
        `   Semantic Score: ${product.semanticScoreNormalized.toFixed(3)}`
      );

      console.log(
        `   Keyword Score: ${product.keywordScoreNormalized.toFixed(3)}`
      );

      console.log(
        `   FINAL SCORE: ${product.finalScore.toFixed(3)}`
      );

      console.log(
        `   Matched Queries: ${product.semanticRanks.length}`
      );

      console.log(
        "---------------------------------------"
      );

    });


  // ==========================================
  // TOP 3 FOR RAG
  // ==========================================

  const topResults =
    rankedResults.slice(0, 3);


  console.log("\n===== FINAL RAG PRODUCTS =====\n");


  topResults.forEach((product, index) => {

    const p =
      product.metadata || {};

    console.log(
      `${index + 1}. ${p.name} | Mind Heal No: ${p.mind_heal_no}`
    );

  });


  // ==========================================
  // FINAL AI ANSWER
  // ==========================================

  console.log(
    "\n===== RAG CONTEXT CREATED =====\n"
  );


  const answer =
    await generateAnswer(
      query,
      topResults
    );


  console.log(
    "\n===== FINAL AI ANSWER =====\n"
  );

  console.log(answer);


  // ==========================================
  // API RESULT
  // ==========================================

  return {
    answer,

    products: topResults.map(product => {

      const p =
        product.metadata || {};

      return {

        mysql_id: p.mysql_id,

        mind_heal_no: p.mind_heal_no,

        name: p.name,

        name_hi: p.name_hi,

        slug: p.slug,

        emotional_tags: p.emotional_tags,

        score: product.finalScore

      };

    })

  };

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  searchProduct
};