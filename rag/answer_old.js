require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "Mind Heal AI Assistant",
  },
});

async function generateAnswer(question, context) {

  const response = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",

    messages: [
      {
        role: "system",
        content: `
You are the Mind Heal AI Assistant.

Use the provided RAG context to answer the user's question.

Rules:
- Answer clearly and naturally.
- Use the retrieved Mind Heal products as context.
- Do not invent product information.
- If the context does not contain enough information, say so.
- Do not claim to diagnose a medical condition.
- Do not claim that a product can cure a disease.
- Keep the answer concise.
        `.trim(),
      },
      {
        role: "user",
        content: `
USER QUESTION:
${question}

RAG CONTEXT:
${context}

Give the most relevant answer based on the RAG context.
        `.trim(),
      },
    ],

    // VERY IMPORTANT
    max_tokens: 1000,

    temperature: 0.3,
  });

  return response.choices[0].message.content;
}

module.exports = {
  generateAnswer,
};