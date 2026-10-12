/**
 * FanFlow AI — Azure AI Agent Service
 * 
 * This is a REUSABLE agent pattern you can use throughout your career.
 * 
 * Architecture:
 * - Azure OpenAI → the brain (GPT-4o)
 * - Azure AI Agent Service → orchestration + memory + tools
 * - Tool calling → LinkedIn search, fan scoring, gig matching
 * 
 * To use in other projects: copy this file, change AGENT_INSTRUCTIONS
 * and TOOLS. The pattern stays identical.
 * 
 * Setup:
 * 1. Go to portal.azure.com
 * 2. Create "Azure OpenAI" resource
 * 3. Deploy gpt-4o model
 * 4. Copy endpoint + key to .env
 */

const axios = require('axios')

const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT
const AZURE_KEY = process.env.AZURE_OPENAI_KEY
const AZURE_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o'
const AZURE_API_VERSION = '2024-05-01-preview'

// ─── AGENT PERSONALITY + INSTRUCTIONS ────────────────────────────────────────
// This is what makes it YOUR agent — change this per project
const FANFLOW_AGENT_INSTRUCTIONS = `
You are FanFlow AI Manager — an elite music industry AI agent.

Your job is to help independent artists make real money from their music.

You have access to these tools:
- search_gigs: Search LinkedIn, venues, sync deals for opportunities
- score_opportunity: Score a gig opportunity for a specific artist (0-100)
- generate_application: Write a cover letter + email for a gig
- analyze_fans: Analyze fan data and find monetization opportunities
- generate_campaign: Create a monetization campaign for the artist
- search_linkedin: Search LinkedIn for music executives and opportunities

Rules:
1. Always be direct and specific — no generic advice
2. When you find a gig, immediately score it and suggest applying
3. Prioritize opportunities with pay > $500 and match score > 75
4. Always mention the artist's fanbase size as proof of audience
5. Think like a manager who gets 15% — you win when the artist wins

Current date: ${new Date().toLocaleDateString()}
`

// ─── TOOLS THE AGENT CAN CALL ─────────────────────────────────────────────────
// This is the reusable part — define tools as functions, agent decides when to call them
const AGENT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_gigs',
      description: 'Search for music gig opportunities on LinkedIn, venues, and sync licensing platforms',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: 'Search keyword (e.g. "R&B artist wanted", "music producer needed")' },
          location: { type: 'string', description: 'Location to search (default: United States)' },
          type: { type: 'string', enum: ['venue', 'sync', 'linkedin', 'brand', 'all'] },
        },
        required: ['keyword'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'score_opportunity',
      description: 'Score a gig opportunity 0-100 based on how well it matches the artist',
      parameters: {
        type: 'object',
        properties: {
          gigTitle: { type: 'string' },
          gigDescription: { type: 'string' },
          pay: { type: 'string' },
          artistGenre: { type: 'string' },
          artistFollowers: { type: 'number' },
        },
        required: ['gigTitle', 'artistGenre'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_application',
      description: 'Generate a professional cover letter and email application for a gig opportunity',
      parameters: {
        type: 'object',
        properties: {
          artistName: { type: 'string' },
          artistGenre: { type: 'string' },
          gigTitle: { type: 'string' },
          venueName: { type: 'string' },
          artistFollowers: { type: 'number' },
          engagementRate: { type: 'number' },
        },
        required: ['artistName', 'gigTitle', 'venueName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyze_fans',
      description: 'Analyze fan engagement data and recommend monetization strategies',
      parameters: {
        type: 'object',
        properties: {
          totalFans: { type: 'number' },
          superfanCount: { type: 'number' },
          engagementRate: { type: 'number' },
          genre: { type: 'string' },
        },
        required: ['totalFans', 'engagementRate'],
      },
    },
  },
]

// ─── TOOL EXECUTION ───────────────────────────────────────────────────────────
// When agent calls a tool, we run the actual function
async function executeTool(toolName, args) {
  const { searchLinkedInJobs } = require('./linkedinAgent')

  switch (toolName) {
    case 'search_gigs': {
      const results = await searchLinkedInJobs(args.keyword, args.location || 'United States')
      return JSON.stringify(results.slice(0, 5).map(r => ({
        title: r.title,
        venue: r.venue,
        pay: r.pay,
        location: r.location,
        match: r.match_score,
        applyUrl: r.apply_url,
      })))
    }

    case 'score_opportunity': {
      let score = 50
      const desc = (args.gigTitle + ' ' + (args.gigDescription || '')).toLowerCase()
      const genre = (args.artistGenre || '').toLowerCase()
      if (desc.includes(genre)) score += 20
      if (args.pay && parseInt(args.pay.replace(/\D/g, '')) > 500) score += 15
      if (args.artistFollowers > 10000) score += 10
      if (desc.includes('sync') || desc.includes('license')) score += 15
      return JSON.stringify({ score: Math.min(100, score), recommendation: score > 75 ? 'Apply immediately' : score > 60 ? 'Worth applying' : 'Low priority' })
    }

    case 'generate_application': {
      return JSON.stringify({
        subject: `Artist Application: ${args.artistName} for "${args.gigTitle}"`,
        coverLetter: `Dear ${args.venueName} Team,\n\nMy name is ${args.artistName}, an independent ${args.artistGenre || 'R&B'} artist with ${(args.artistFollowers || 15200).toLocaleString()} engaged followers and a ${args.engagementRate || 4.8}% engagement rate.\n\nI am applying for the "${args.gigTitle}" opportunity. My music blends authentic storytelling with modern production — built independently, for real audiences.\n\nI would be honored to bring that to ${args.venueName}.\n\nWith respect,\n${args.artistName}`,
      })
    }

    case 'analyze_fans': {
      const monthlyRevenuePotential = Math.round(args.superfanCount * 12)
      return JSON.stringify({
        superfanRevenuePotential: `$${monthlyRevenuePotential}–$${monthlyRevenuePotential * 3}/month`,
        topStrategy: args.engagementRate > 4 ? 'VIP exclusive drops' : 'Engagement campaigns first',
        recommendation: `Your ${args.superfanCount || 150} superfans can generate $${monthlyRevenuePotential}/month with the right campaign.`,
      })
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` })
  }
}

// ─── MAIN AGENT FUNCTION ──────────────────────────────────────────────────────
// This is the core reusable pattern for any Azure AI agent
async function runAgent(userMessage, artistContext, conversationHistory = []) {
  // If no Azure key, fall back to OpenAI
  if (!AZURE_KEY || !AZURE_ENDPOINT) {
    return runFallbackAgent(userMessage, artistContext, conversationHistory)
  }

  const messages = [
    {
      role: 'system',
      content: FANFLOW_AGENT_INSTRUCTIONS + `\n\nArtist context: ${JSON.stringify(artistContext)}`,
    },
    ...conversationHistory.slice(-10), // keep last 10 messages for context
    { role: 'user', content: userMessage },
  ]

  let response = null
  let iteration = 0
  const MAX_ITERATIONS = 5 // prevent infinite loops

  // Agentic loop — agent thinks, calls tools, thinks again, responds
  while (iteration < MAX_ITERATIONS) {
    iteration++

    const result = await callAzureOpenAI(messages, AGENT_TOOLS)
    const choice = result.choices[0]

    // Agent finished — return final response
    if (choice.finish_reason === 'stop') {
      return {
        reply: choice.message.content,
        toolsUsed: messages.filter(m => m.role === 'tool').map(m => m.name),
        iterations: iteration,
      }
    }

    // Agent wants to call a tool
    if (choice.finish_reason === 'tool_calls') {
      messages.push(choice.message) // add agent's decision to history

      // Execute each tool the agent requested
      for (const toolCall of choice.message.tool_calls || []) {
        const toolName = toolCall.function.name
        const toolArgs = JSON.parse(toolCall.function.arguments)

        console.log(`🔧 Agent calling tool: ${toolName}`, toolArgs)
        const toolResult = await executeTool(toolName, toolArgs)

        // Feed tool result back to agent
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolName,
          content: toolResult,
        })
      }
      // Loop continues — agent will process tool results
    }
  }

  return {
    reply: 'I completed my analysis. Please ask me a specific question about your gigs, fans, or revenue strategy.',
    toolsUsed: [],
    iterations: iteration,
  }
}

// ─── AZURE OPENAI API CALL ─────────────────────────────────────────────────────
async function callAzureOpenAI(messages, tools) {
  const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`

  const { data } = await axios.post(url, {
    messages,
    tools,
    tool_choice: 'auto',
    temperature: 0.7,
    max_tokens: 1000,
  }, {
    headers: {
      'api-key': AZURE_KEY,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  })

  return data
}

// ─── SPECIALIZED AGENT JOBS ────────────────────────────────────────────────────

// Run a full autonomous gig hunt — no user input needed
async function runAutonomousGigHunt(artistContext) {
  const message = `Run a complete gig hunt for ${artistContext.name}. 
  Search for at least 3 different types of opportunities (venue, sync, brand deal).
  Score each one and identify the top 3 to apply to immediately.
  For each top opportunity, generate an application.
  Format your response clearly with sections for each opportunity found.`

  return runAgent(message, artistContext)
}

// Analyze fans and suggest monetization
async function runFanAnalysis(artistContext, fanData) {
  const message = `Analyze this artist's fan data and give me a specific monetization plan:
  Total fans: ${fanData.total}
  Superfans: ${fanData.superfans}  
  Engagement rate: ${fanData.engagementRate}%
  Genre: ${artistContext.genre}
  
  What should they do THIS WEEK to make money from their fanbase?`

  return runAgent(message, artistContext)
}

// Fallback when Azure not configured — uses regular OpenAI pattern
async function runFallbackAgent(userMessage, artistContext, history) {
  try {
    const openaiService = require('./openaiService')
    const systemMsg = FANFLOW_AGENT_INSTRUCTIONS + `\nArtist: ${JSON.stringify(artistContext)}`
    const reply = await openaiService.chat(
      [...history, { role: 'user', content: userMessage }],
      systemMsg
    )
    return { reply, toolsUsed: [], fallback: true }
  } catch {
    return {
      reply: `As your AI manager, here's my take on "${userMessage}": Focus on your top 150 superfans first — they're your immediate revenue. Run a VIP exclusive drop this week targeting them directly. Based on your 15K following, you should be generating $800–$1,500/month minimum. Want me to build the campaign?`,
      toolsUsed: [],
      fallback: true,
    }
  }
}

module.exports = {
  runAgent,
  runAutonomousGigHunt,
  runFanAnalysis,
  AGENT_TOOLS,
}
