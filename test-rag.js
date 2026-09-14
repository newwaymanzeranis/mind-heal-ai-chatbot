const { retrieveContext } = require("./rag/retrieve");
const { buildContext } = require("./rag/prompt");
const { generateAnswer } = require("./rag/answer");

async function main() {
  const question =
   // "Mujhe baar baar same thought aata hai aur main lock repeatedly check karta hoon.";
    "mera kutta bahot jyada bahunkta hai";

  console.log("\n===== USER QUESTION =====\n");
  console.log(question);

  // 1. Retrieve relevant documents from ChromaDB
  const results = await retrieveContext(question, 3);

  console.log("\n===== RETRIEVED PRODUCTS =====\n");

  results.forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.metadata?.name} | Mind Heal No: ${item.metadata?.mind_heal_no} | Distance: ${item.distance}`
    );
  });

  // 2. Build RAG context
  const context = buildContext(results);

  console.log("\n===== RAG CONTEXT CREATED =====\n");

  console.log(context.substring(0, 1000));
  console.log("\n[Context truncated for display]");

  // 3. Send question + context to OpenAI
  console.log("\n===== OPENAI ANSWER =====\n");

  //console.log(context);
//console.log(results );
const ragContext = results
  .map((product, index) => {
    const p = product.metadata;

    return `

SOURCE ${index + 1}
Mind Heal No: ${p.mind_heal_no}
Product Name: ${p.name}
Short Description:
${p.short_description || ""}
Short Description Hindi:
${p.short_description_hi || ""}
Emotional Tags:
${p.emotional_tags || ""}
`.trim();
  })
  .join("\n");

console.log(ragContext);
  console.log("\n===== end context OPENAI ANSWER =====\n");
 // const answer = await generateAnswer(question, ragContext);
 
  //console.log(answer);
}

main().catch((error) => {
  console.error("\n===== ERROR =====");
  console.error(error);
});