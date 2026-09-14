const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function expandQuery(userQuery) {

  const response = await client.chat.completions.create({
    model: "deepseek/deepseek-v4-flash",

    messages: [
      {
        role: "system",
        content: `
You are a search query expansion engine.

Convert the user's question into 8 short search queries.

Generate:
- English variations
- Hindi/Hinglish variations
- synonyms
- natural user expressions
- important keywords

Return ONLY valid JSON:

{
  "queries": ["query1", "query2", "query3"]
}
`
      },
      {
        role: "user",
        content: userQuery
      }
    ],

    temperature: 0.2,
    max_tokens: 500
  });

  let content = response.choices[0].message.content.trim();

  // Markdown ```json ... ``` remove karo
  content = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed.queries)) {
      throw new Error("queries array missing");
    }

    return parsed.queries;

  } catch (error) {

    console.log("Query expansion JSON error:", content);

    // fallback
    return [userQuery];
  }
}

module.exports = { expandQuery };