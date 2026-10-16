const OpenAI = require('openai')
const { isDemoMode, DemoModeError } = require('../lib/demoMode')

// In demo mode there is no key and no client: nothing can be billed.
const openai = isDemoMode ? null : new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
 
const MODEL = 'gpt-4o-mini' // cost-efficient, fast
 
/**
 * Single-turn completion
 */
async function complete(prompt, maxTokens = 1000) {
  // Demo: every route that calls this already has a pre-written fallback answer
  if (isDemoMode) throw new DemoModeError('Live AI')
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
  if (isDemoMode) return demoChatReply(messages)
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
 
// Pre-written AI manager answers for the demo, picked by keywords in the last message
function demoChatReply(messages) {
  const last = (messages[messages.length - 1]?.content || '').toLowerCase()
  const note = '\n\n(Demo: this is a pre-written answer. The live app uses GPT-4o-mini with your real data.)'
  if (/gig|show|book|venue/.test(last)) {
    return 'Your best match right now is R&B Night at Brooklyn Bowl (92% match, $400). Your superfans are concentrated in Brooklyn, so you can promise the venue a real crowd. I would apply this week and offer your top 3 superfans free guest-list spots.' + note
  }
  if (/money|revenue|monetiz|sell|merch|price/.test(last)) {
    return 'Start with your 3 superfans (Maya R., Andre K., Priya S.). They engage 3x more than everyone else. A $10 exclusive sample pack sent to your top 25 fans is a realistic $250 to $400 this month, with no ad spend.' + note
  }
  if (/fan|grow|follow|engag/.test(last)) {
    return 'Your engagement is strongest on Instagram on Sunday evenings. Post a 30-second studio clip then, reply to every comment in the first hour, and DM a thank-you to anyone who shares it. That routine turns engaged fans into loyal ones.' + note
  }
  return 'I am your AI manager. Ask me about gigs, growing your fans, or making money from your music, and I will answer using your stats.' + note
}

module.exports = { complete, chat, scoreFan }
 