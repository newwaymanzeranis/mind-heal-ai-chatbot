 
const mysql = require("mysql2/promise");
const { ChromaClient } = require("chromadb");
const { DefaultEmbeddingFunction } = require("@chroma-core/default-embed");

async function main() {
  // MySQL connection
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "rootmysqlpass",
    database: "mind_heal",
  });

  // ChromaDB connection
  const chroma = new ChromaClient({
    host: "localhost",
    port: 8000,
    ssl: false,
  });

  // Collection
  const collection = await chroma.getOrCreateCollection({
    name: "mind_heal_products",
    embeddingFunction: new DefaultEmbeddingFunction(),
  });

  // Product fetch
  const [products] = await db.execute(`
    SELECT
      id,
      mind_heal_no,
      name,
      name_hi,
      slug,
      description,
      description_hi,
      short_description,
      short_description_hi,
      emotional_tags,
      emotional_tags_hi,
      published
    FROM product
    WHERE published = 1
  `);

  console.log(`MySQL products found: ${products.length}`);

  for (const product of products) {

    const document = `
Product: ${product.name}

Hindi Name: ${product.name_hi}

Short Description:
${product.short_description}

Hindi Short Description:
${product.short_description_hi}


Emotional Tags:
${product.emotional_tags}

Short Description:
${product.short_description} 

Hindi Short Description:
${product.short_description_hi} 
 

Hindi Emotional Tags:
${product.emotional_tags_hi}

Search Keywords:
${product.name}
${product.name_hi}
${product.emotional_tags || ""}
      
`.trim();

    await collection.upsert({
      ids: [`product_${product.id}`],

      documents: [document],

      metadatas: [
        {
          type: "product",
          mysql_id: product.id,
          mind_heal_no: product.mind_heal_no,
          name: product.name,
          name_hi: product.name_hi,
          slug: product.slug,
          short_description: product.short_description,
          short_description_hi: product.short_description_hi,
          emotional_tags: product.emotional_tags,
          published: Boolean(product.published),
        },
      ],
    });

    console.log(
      `Synced: Mind Heal No. ${product.mind_heal_no} - ${product.name}`
    );
  }

  await db.end();

  console.log("MySQL → ChromaDB sync completed.");
}

main().catch((error) => {
  console.error("SYNC ERROR:");
  console.error(error);
  process.exit(1);
});