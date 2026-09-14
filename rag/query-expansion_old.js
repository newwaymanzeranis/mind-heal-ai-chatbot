const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function expandQuery(userQuestion) {
  const response = await client.chat.completions.create({
    model: "deepseek/deepseek-v4-flash", 

    messages: [
      {
        role: "system",
        content: `
You are a search query expansion engine.

Your job is ONLY to convert the user's question into useful
search phrases for a product database.

Return ONLY a JSON object in this format:

{
  "queries": [
    "query 1",
    "query 2",
    "query 3",
    "query 4",
    "query 5"
  ]
}

Rules:
- Keep the original meaning.
- Include English and Hindi/Hinglish variations when useful.
- Include synonyms and natural ways a user may describe the same problem.
- Do not answer the user's question.
- Do not recommend any product.
- Do not diagnose any disease.
- Never change the meaning of the user's query.
- Never invent a new symptom, disease, problem, product, treatment, medicine, or condition.
- Keep the same subject/entity.
- Keep the same action/problem.
- Generate English, Hindi and Hinglish variations.
- Include common spelling variations.
- Maximum 8 queries.
`
      },
      {
        role: "user",
        content: userQuestion
      }
    ],

    max_tokens: 250,
    temperature: 0.1,
  });

  const text = response.choices[0].message.content.trim();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Query expansion JSON error:", text);

    return {
      queries: [userQuestion]
    };
  }
}

module.exports = {
  expandQuery
};