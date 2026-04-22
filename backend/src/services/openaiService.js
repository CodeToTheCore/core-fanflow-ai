const OpenAI = require('openai')
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
 
const MODEL = 'gpt-4o-mini' // cost-efficient, fast
 
/**
 * Single-turn completion
 */
async function complete(prompt, maxTokens = 1000) {
  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.75,
  })
  return response.choices[0].message.content
}
 
/**
 * Multi-turn conversation
 */
async function chat(messages, systemPrompt, maxTokens = 800) {
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]
 
  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: formattedMessages,
    temperature: 0.7,
  })
  return response.choices[0].message.content
}
 
/**
 * Score a fan based on their engagement metrics
 */
async function scoreFan(fanData) {
  const prompt = `Score this social media fan on a scale of 0-100 for superfan potential.
Fan data: ${JSON.stringify(fanData)}
Factors: frequency of interaction, quality of engagement, follower count, recency.
Return ONLY a JSON object: { "score": 75, "tier": "loyal", "reason": "..." }`
 
  const result = await complete(prompt, 150)
  return JSON.parse(result.replace(/```json|```/g, '').trim())
}
 
module.exports = { complete, chat, scoreFan }
 