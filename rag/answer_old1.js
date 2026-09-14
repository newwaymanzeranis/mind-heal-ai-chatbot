const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});


async function generateAnswer(userQuestion, products) {

  // ==========================================
  // RAG CONTEXT
  // ==========================================

  const context = products
    .map((product, index) => {

      const p = product.metadata || {};

      return `
SOURCE ${index + 1}

Mind Heal No: ${p.mind_heal_no || ""}
Product Name: ${p.name || ""}
Hindi Name: ${p.name_hi || ""}

Short Description:
${p.short_description || ""}

Hindi Short Description:
${p.short_description_hi || ""}

Emotional Tags:
${p.emotional_tags || ""}
`.trim();

    })
    .join("\n\n-------------------------\n\n");


  // ==========================================
  // PROMPT
  // ==========================================

  const prompt = `
You are the AI assistant for Mind Heal.

User question:
${userQuestion}

Relevant products retrieved from the Mind Heal database:

${context}


IMPORTANT RULES:

1. Answer the user's question naturally and clearly.

2. Use ONLY the retrieved product information when
   discussing Mind Heal products.

3. Do NOT invent product information.

4. Do NOT diagnose the user.

5. Do NOT claim that a product can cure a disease
   or medical condition.

6. Do NOT prescribe medicines or tell the user to
   take a specific medicine.

7. If the retrieved products are not relevant to
   the user's question, clearly say that the
   available products do not appear to match.

8. If a product is relevant, mention its:
   - Product Name
   - Mind Heal No.

9. Keep the answer concise and helpful.

10. For animal/pet questions, do not give veterinary
    diagnosis or treatment instructions. If the issue
    could require medical attention, recommend
    consulting a veterinarian.

Answer in the same language/style as the user.
`;


  // ==========================================
  // MAIN LLM
  // ==========================================

  const response = await client.chat.completions.create({

    // Your main/final model
    model:
      process.env.OPENROUTER_MAIN_MODEL ||
      "openai/gpt-4o-mini",

    messages: [

      {
        role: "system",
        content:
          "You are a helpful, safe Mind Heal product assistant."
      },

      {
        role: "user",
        content: prompt
      }

    ],

    temperature: 0.2,

    // IMPORTANT:
    // Don't leave this at 65536.
    max_tokens: 700

  });


  return response.choices[0].message.content;
}


module.exports = {
  generateAnswer
};