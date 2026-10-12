const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getAIResponse = async (role, artistData, userPrompt) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemInstructions = `
    You are a high-level AI Agent for a music producer. Your role is: ${role}.
    You have real-time access to the producer's Media Studio: ${JSON.stringify(artistData)}.
    Don't give generic advice. Give LOGICAL, data-driven steps. 
    If a user asks about their music, look at the titles and types in the data provided.
  `;

  const result = await model.generateContent([systemInstructions, userPrompt]);
  return result.response.text();
};

module.exports = { getAIResponse };