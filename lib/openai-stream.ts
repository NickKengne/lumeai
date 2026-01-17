/**
 * OpenAI Service for Lume AI
 * Chat responses (markdown) + Structure generation (JSON)
 */

import { AIResponseSchema, type AIResponse, type ScreenLayout } from './ai-helpers'

// Chat system prompt (clean markdown, conversational)
const CHAT_SYSTEM_PROMPT = `You are a seasoned App Store marketing consultant who's helped hundreds of apps succeed.

Your responses should be:
- **Conversational** - Talk like a real person, not a template
- **Specific** - Give actionable advice, not generic platitudes
- **Strategic** - Think about what actually converts in the App Store
- **Brief** - Get to the point quickly (200-400 words max)

When analyzing an app concept:
1. Identify the core value prop in one sentence
2. Name the primary competitor mindset you're fighting
3. Suggest 3-4 screenshot must-haves
4. Point out one common mistake to avoid
5. Ask user to upload their app screenshots so you can design them

Tone: Professional but human. Strategic but accessible. Confident but not arrogant.
Format: Use markdown headers (##) and bullet points. No emojis.`

// Structure system prompt (JSON only)
const STRUCTURE_SYSTEM_PROMPT = `You are an App Store marketing expert who creates compelling, unique screenshot copy.

CRITICAL: Output ONLY valid JSON matching this exact schema.

VALID VALUES (use EXACTLY as shown):
- tone: MUST be one of: "clean", "bold", "professional", "playful", "minimal"
- layout: MUST be one of: "iphone_centered", "iphone_offset", "iphone_feature_list", "iphone_comparison", "iphone_hero"
- background: MUST be one of: "soft_gradient", "solid_light", "solid_dark", "branded", "minimal"
- emphasis: MUST be one of: "dashboard", "charts", "social", "onboarding", "feature"

OUTPUT FORMAT:
{
  "theme": "finance",
  "tone": "professional",
  "targetAudience": "young professionals",
  "screens": [
    {
      "id": "screen_1",
      "headline": "Track Every Expense",
      "subheadline": "Stay on top of your spending",
      "layout": "iphone_centered",
      "background": "soft_gradient",
      "emphasis": "dashboard"
    }
  ]
}

CRITICAL - READ USER INPUT CAREFULLY:
1. Headlines MUST be EXACTLY 2 WORDS extracted from their description
2. Subheadlines: 8-12 words explaining the benefit THEY described  
3. Extract REAL features - DO NOT INVENT features they didn't mention
4. Use their vocabulary, not generic marketing speak
5. Each screen = different feature they ACTUALLY described

EXAMPLES:
- User: "AI workout plans" → "AI Workouts" + "Personalized training adapts to your level"
- User: "split bills instantly" → "Bill Splitting" + "Share expenses with friends in seconds"  
- User: "track calories" → "Calorie Tracking" + "Log meals instantly with photos"

STORYTELLING STRUCTURE:
- Screen 1: Lead with their strongest differentiator (what makes THIS app different?)
- Screen 2: Show the core experience or main feature in action
- Screen 3: Secondary benefit or complementary feature
- Screen 4+: Social proof, additional features, or outcome

AVOID at all costs:
- Generic templates ("Stay on top of...", "Reach your goals", "Built for you")
- Repeating the same benefit multiple times
- Vague promises without specific context
- Copy that could work for any competitor

Use ONLY the exact enum values listed above. No markdown, no explanations, ONLY JSON.`

export interface StreamCallbacks {
  onStart?: () => void
  onToken?: (token: string, fullText: string) => void
  onComplete?: (fullText: string) => void
  onError?: (error: Error) => void
}

/**
 * Stream chat response from OpenAI (markdown)
 */
export async function streamAIResponse(
  userMessage: string,
  callbacks: StreamCallbacks
): Promise<void> {
  const { onStart, onToken, onComplete, onError } = callbacks

  try {
    onStart?.()

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: CHAT_SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error('OpenAI API error')
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          
          if (data === '[DONE]') continue

          try {
            const json = JSON.parse(data)
            const content = json.choices?.[0]?.delta?.content

            if (content) {
              fullText += content
              onToken?.(content, fullText)
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    onComplete?.(fullText)
  } catch (error) {
    onError?.(error as Error)
  }
}

/**
 * Mock streaming response (fallback)
 */
export async function mockStreamAIResponse(
  userMessage: string,
  callbacks: StreamCallbacks
): Promise<void> {
  const { onStart, onToken, onComplete } = callbacks

  onStart?.()

  const response = generateMockMarkdownResponse(userMessage)
  const words = response.split(' ')
  
  let fullText = ''

  for (let i = 0; i < words.length; i++) {
    fullText += (i === 0 ? '' : ' ') + words[i]
    onToken?.(words[i], fullText)
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  onComplete?.(fullText)
}

function generateMockMarkdownResponse(userInput: string): string {
  const input = userInput.toLowerCase()
  
  // Generate varied response styles
  const responseStyles = ['direct', 'analytical', 'strategic', 'visual-first']
  const selectedStyle = responseStyles[Math.floor(Math.random() * responseStyles.length)]
  
  let response = ''
  
  if (input.includes('finance') || input.includes('budget') || input.includes('money') || input.includes('bank')) {
    if (selectedStyle === 'direct') {
      response = `Banking apps live or die on trust. Here's what matters:

Your biggest competitor isn't other apps—it's the friction of switching banks. People stick with what they know, even if it sucks.

**What needs to jump off the screen:**
- Real-time balance updates (show it's actually connected)
- One-tap transfers that feel instant
- Transaction history that doesn't look like a spreadsheet
- Whatever makes you different from ${input.includes('transfer') ? 'Venmo' : input.includes('budget') ? 'Mint' : 'your bank app'}

Skip the generic "manage your money" messaging. Show the moment someone realizes they just saved 3 minutes doing something that used to take 10.

Upload your screens and I'll help you highlight what actually converts.`
    } else if (selectedStyle === 'analytical') {
      response = `Finance app. Interesting space—high trust barrier, high switching cost.

**The Psychology:** Users won't switch unless the pain of staying > pain of changing. Your screenshots need to demonstrate immediate value, not promise future benefits.

**Screenshot Strategy:**

Screen 1 should answer "What's different?" in 2 seconds. Not "easy money transfer"—everyone says that. Show the transfer happening. Show the notification. Show the confirmation.

Screen 2: The dashboard. But make it a dashboard someone would actually check daily. What's the hook? Real-time spending alerts? Automatic savings? Instant categorization?

Screen 3: Trust signals. Security isn't a feature anymore, it's table stakes. Show biometrics, encryption, whatever. But quickly.

**Critical:** ${input.includes('real-time') ? 'You mentioned real-time. That\'s your angle. Hammer it.' : input.includes('easy') ? 'Everyone says "easy." Show fast instead.' : 'Find your one differentiator and lead with it.'}

Upload your actual screens so we can craft something that stands out.`
    } else if (selectedStyle === 'strategic') {
      response = `${input.includes('empower') || input.includes('manage') ? 'Empowerment messaging is everywhere in fintech.' : 'Finance app space is crowded.'} You need sharper positioning.

**Competitive Landscape:** You're fighting apps users already have installed, already trust, and already understand. That's brutal.

**Conversion Approach:**

Don't try to explain features. Show outcomes. Not "track transactions"—show someone catching a subscription they forgot about. Not "easy transfers"—show a split check getting settled in 10 seconds.

**Screenshot Flow I'd Recommend:**
1. The "aha" moment (whatever your app does that clicks instantly)
2. The interface (prove it's not complicated)
3. The payoff (saved money? saved time? less stress?)

${input.includes('security') || input.includes('safe') ? '\n**On Security:** Mention it, don\'t overexplain it. One line, one icon, done.\n' : ''}
Let's see what you've built and figure out the angle that'll make people stop scrolling.`
    } else {
      response = `Looking at ${input.includes('bank') ? 'banking' : 'finance'} app screenshots...

**Visual Strategy:** Financial apps have a visual trust problem. Too sterile = corporate and boring. Too casual = feels unsafe with money.

You need that sweet spot: modern but trustworthy. Clear but not cold.

**Color Psychology:**
- Blues: Trust (overused but works)
- Greens: Growth, money (good for positive actions)
- White space: Clarity (critical for finance)

**What to Show:**
${input.includes('transfer') ? '→ The transfer flow: 3 taps max\n→ Confirmation that feels instant\n→ Transaction appearing in real-time' : ''}
${input.includes('track') || input.includes('history') ? '→ Transaction list that\'s scannable\n→ Search/filter that actually works\n→ Insights that are useful, not generic' : ''}
${input.includes('dashboard') ? '→ Account balances front and center\n→ Recent activity (not buried)\n→ Quick actions within thumb reach' : ''}

Share your screenshots and I'll help you create something that looks as good as it functions.`
    }
  } else if (input.includes('fitness') || input.includes('health') || input.includes('workout')) {
    const variations = [
      `Fitness apps are emotional products disguised as utility apps.

The real competition? The voice in their head saying "I'll start Monday." Your screenshots need to shut that voice up.

**What Works:**
- Progress that feels attainable (not "get shredded in 30 days")
- Workouts that look doable right now
- Community that doesn't feel intimidating
- Results that are specific (not generic transformation pics)

**What Doesn't:**
- Stock photos of models
- Workouts that look complicated
- Nutrition plans that require meal prep skills
- Anything that triggers guilt instead of motivation

${input.includes('track') ? 'You mentioned tracking. Good. But show the insight, not the data entry.' : ''}
${input.includes('plan') ? 'Plans are great until they\'re too rigid. Show flexibility.' : ''}

Upload your screens. Let's make something that actually gets people to lace up their shoes.`,

      `Health/fitness space. Tough market because motivation is hard to capture in a screenshot.

**The Challenge:** By the time someone's looking at your App Store page, they're already motivated. The question is: will they still be motivated on day 4?

Your screenshots should answer: "Will I actually use this?"

**Show This:**
1. How fast they can start (nobody wants 20 setup questions)
2. What a real workout looks like in your app
3. Progress tracking that feels rewarding, not judgy
4. The thing that brings them back (community? streaks? something else?)

**Skip This:**
- Generic "achieve your goals" messaging
- Perfect bodies (they alienate more than inspire)
- Complicated workout plans
- "Revolutionary" claims

What's your actual hook? Upload your UI and let's figure out how to show it.`
    ]
    response = variations[Math.floor(Math.random() * variations.length)]
  } else if (input.includes('social') || input.includes('dating') || input.includes('chat')) {
    const socialVariations = [
      `Social apps. The graveyard is full of "connect with friends" promises.

What actually makes someone join a new social platform? FOMO. Curiosity. A friend dragging them in. Not your screenshots.

But screenshots can kill interest fast if they look:
- Empty (no one wants to be first)
- Overwhelming (too many features confuse)
- Generic (seen it all before)

**Show:**
- Real conversations (blur sensitive stuff)
- The discovery feed (how do I find interesting people?)
- Whatever makes your community different
- Activity indicators (this place is alive)

Upload your UI. Let's make sure it doesn't look like every other social app that failed.`,

      `The network effect problem: Social apps need users to be useful, but users won't join without users.

Your screenshots can't solve this, but they can avoid making it worse.

**What triggers download:**
- Seeing someone they know might be there
- A feature they can't get elsewhere
- A community they identify with
- Pure curiosity (if you nail the presentation)

**Screenshot Strategy:**
1. Show the vibe immediately (what kind of people use this?)
2. Demonstrate the core interaction (is this chat? feed? something new?)
3. Highlight what's different (please don't say "authentic connections")

What's your actual differentiator? Let's see your screens.`
    ]
    response = socialVariations[Math.floor(Math.random() * socialVariations.length)]
  } else {
    const genericVariations = [
      `Okay, so you're building: "${userInput.slice(0, 80)}${userInput.length > 80 ? '...' : ''}"

Let's be honest—most App Store screenshots are terrible. They either:
- Explain too much (walls of text nobody reads)
- Show too little (just the UI with no context)
- Look identical to competitors
- Miss the point entirely

The goal isn't to explain your app. It's to make someone curious enough to download.

**What your screenshots should do:**
1. Pass the "3-second test" (what is this?)
2. Show the core value (not features)
3. Look polished enough to trust
4. Stand out from similar apps

Upload your actual app screens and let's figure out what story they should tell.`,

      `"${userInput.slice(0, 60)}${userInput.length > 60 ? '...' : ''}"

Interesting. Before we dive into designs, quick question: What makes someone choose YOUR app over the dozen similar ones?

That answer should be visible in your first screenshot. Not written, not explained—*shown*.

Most apps fail here. They show features (buttons, menus, lists) instead of outcomes (what you get, why it matters, how it feels).

**The Setup:**
- Screen 1: The hook (why look at screen 2?)
- Screen 2: The proof (okay, this actually works)
- Screen 3+: Details (if they're still interested)

Let me see what you've built. We'll figure out the angle that makes people stop scrolling.`,

      `Got it: "${userInput.slice(0, 70)}${userInput.length > 70 ? '...' : ''}"

Here's the thing about App Store screenshots—people don't read them. They scan. They judge. They move on.

You've got maybe 4 seconds of attention. Your screenshots need to work at a glance.

**Questions your screens should answer instantly:**
- Is this for me?
- What problem does it solve?
- Will I actually use this?
- Does it look trustworthy?

**What usually kills interest:**
- Generic stock photos
- Feature lists (nobody cares yet)
- Cluttered interfaces
- No clear value prop

Upload your UI and I'll help you create something that converts browsers into downloads.`
    ]
    response = genericVariations[Math.floor(Math.random() * genericVariations.length)]
  }
  
  return response
}

/**
 * Sanitize and coerce AI response to match schema
 */
function sanitizeAIResponse(response: any): any {
  // Valid enum values
  const validTones = ["clean", "bold", "professional", "playful", "minimal"]
  const validEmphases = ["dashboard", "charts", "social", "onboarding", "feature"]
  const validLayouts = ["iphone_centered", "iphone_offset", "iphone_feature_list", "iphone_comparison", "iphone_hero"]
  const validBackgrounds = ["soft_gradient", "solid_light", "solid_dark", "branded", "minimal"]
  
  // Coerce tone to valid value
  if (response.tone && !validTones.includes(response.tone)) {
    console.warn(`Invalid tone "${response.tone}", defaulting to "professional"`)
    response.tone = "professional"
  }
  
  // Coerce screens
  if (Array.isArray(response.screens)) {
    response.screens = response.screens.map((screen: any) => {
      // Coerce emphasis
      if (screen.emphasis && !validEmphases.includes(screen.emphasis)) {
        console.warn(`Invalid emphasis "${screen.emphasis}", defaulting to "feature"`)
        screen.emphasis = "feature"
      }
      
      // Coerce layout
      if (screen.layout && !validLayouts.includes(screen.layout)) {
        console.warn(`Invalid layout "${screen.layout}", defaulting to "iphone_centered"`)
        screen.layout = "iphone_centered"
      }
      
      // Coerce background
      if (screen.background && !validBackgrounds.includes(screen.background)) {
        console.warn(`Invalid background "${screen.background}", defaulting to "soft_gradient"`)
        screen.background = "soft_gradient"
      }
      
      return screen
    })
  }
  
  return response
}

/**
 * Generate screenshot structure from OpenAI (JSON)
 */
export async function generateScreenshotStructure(
  userMessage: string,
  apiKey?: string
): Promise<AIResponse> {
  const key = apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY

  if (!key) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: STRUCTURE_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    throw new Error('OpenAI API error')
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No response from OpenAI')
  }

  try {
    const parsed = JSON.parse(content)
    console.log('Raw OpenAI response:', parsed)
    
    // Sanitize response before validation
    const sanitized = sanitizeAIResponse(parsed)
    console.log('Sanitized response:', sanitized)
    
    const validated = AIResponseSchema.parse(sanitized)
    
    return validated
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      console.error('Zod validation error:', (error as any).issues)
    }
    throw error
  }
}

/**
 * Generate mock structure (fallback)
 */
export function generateMockStructure(userInput: string): AIResponse {
  const input = userInput.toLowerCase()
  
  let theme = 'general'
  let tone: AIResponse['tone'] = 'professional'
  let screens: ScreenLayout[] = []
  
  // Extract key features and benefits from user input
  const extractKeywords = (text: string): string[] => {
    const words = text.split(/\s+/)
    return words.filter(w => w.length > 4).slice(0, 5)
  }
  
  const keywords = extractKeywords(userInput)
  
  if (input.includes('finance') || input.includes('budget') || input.includes('money') || input.includes('bank')) {
    theme = 'finance'
    tone = 'professional'
    
    const variations = [
      [
        { headline: 'Split Bills in Seconds', subheadline: 'No more awkward money conversations', emphasis: 'social' as const },
        { headline: 'Instant Transaction Sync', subheadline: 'Real-time balance updates across all accounts', emphasis: 'dashboard' as const },
        { headline: 'Catch Hidden Subscriptions', subheadline: 'Automatic alerts for recurring charges', emphasis: 'feature' as const }
      ],
      [
        { headline: 'Budget Without Thinking', subheadline: 'AI categorizes every transaction automatically', emphasis: 'dashboard' as const },
        { headline: 'Spending Patterns Revealed', subheadline: 'Visual insights that actually help you save', emphasis: 'charts' as const },
        { headline: 'Set It and Forget It', subheadline: 'Automatic transfers to your savings goals', emphasis: 'feature' as const }
      ],
      [
        { headline: 'Bank-Level Security', subheadline: '256-bit encryption + biometric authentication', emphasis: 'feature' as const },
        { headline: 'One-Tap Transfers', subheadline: 'Move money between accounts instantly', emphasis: 'dashboard' as const },
        { headline: 'Smart Financial Alerts', subheadline: 'Get notified before you overspend', emphasis: 'charts' as const }
      ]
    ]
    
    const selected = variations[Math.floor(Math.random() * variations.length)]
    screens = selected.map((s, i) => ({
      id: `screen_${i + 1}`,
      headline: s.headline,
      subheadline: s.subheadline,
      layout: ['iphone_centered', 'iphone_offset', 'iphone_hero'][i % 3] as any,
      background: ['soft_gradient', 'solid_light', 'minimal'][i % 3] as any,
      emphasis: s.emphasis
    }))
  } else if (input.includes('fitness') || input.includes('health') || input.includes('workout')) {
    theme = 'fitness'
    tone = 'bold'
    
    const variations = [
      [
        { headline: '5-Minute Home Workouts', subheadline: 'No equipment, no excuses, real results', emphasis: 'feature' as const },
        { headline: 'AI Form Correction', subheadline: 'Real-time feedback using your camera', emphasis: 'dashboard' as const },
        { headline: 'Progress That Motivates', subheadline: 'See strength gains week over week', emphasis: 'charts' as const }
      ],
      [
        { headline: 'Workout With Friends', subheadline: 'Compete on leaderboards and share achievements', emphasis: 'social' as const },
        { headline: 'Personalized Daily Plans', subheadline: 'AI adapts to your energy and schedule', emphasis: 'dashboard' as const },
        { headline: 'Recovery Tracking', subheadline: 'Know when to push and when to rest', emphasis: 'charts' as const }
      ],
      [
        { headline: 'Start From Anywhere', subheadline: 'Beginner-friendly programs that scale with you', emphasis: 'onboarding' as const },
        { headline: 'Video Coaching Library', subheadline: 'Certified trainers guide every movement', emphasis: 'feature' as const },
        { headline: 'Celebrate Every Win', subheadline: 'Earn badges and unlock new challenges', emphasis: 'dashboard' as const }
      ]
    ]
    
    const selected = variations[Math.floor(Math.random() * variations.length)]
    screens = selected.map((s, i) => ({
      id: `screen_${i + 1}`,
      headline: s.headline,
      subheadline: s.subheadline,
      layout: ['iphone_centered', 'iphone_offset', 'iphone_hero'][i % 3] as any,
      background: ['soft_gradient', 'solid_light', 'minimal'][i % 3] as any,
      emphasis: s.emphasis
    }))
  } else if (input.includes('meditation') || input.includes('mindfulness') || input.includes('sleep')) {
    theme = 'wellness'
    tone = 'minimal'
    
    const variations = [
      [
        { headline: 'Sleep in 10 Minutes', subheadline: 'Guided breathwork that actually works', emphasis: 'feature' as const },
        { headline: 'Calm in Your Pocket', subheadline: 'Quick exercises for stressful moments', emphasis: 'dashboard' as const },
        { headline: 'Build a Daily Habit', subheadline: 'Gentle reminders, no pressure', emphasis: 'charts' as const }
      ],
      [
        { headline: '3-Minute Resets', subheadline: 'Micro-meditations between meetings', emphasis: 'feature' as const },
        { headline: 'Personalized Soundscapes', subheadline: 'Nature sounds tailored to your mood', emphasis: 'dashboard' as const },
        { headline: 'Track Your Peace', subheadline: 'See how mindfulness impacts your wellbeing', emphasis: 'charts' as const }
      ]
    ]
    
    const selected = variations[Math.floor(Math.random() * variations.length)]
    screens = selected.map((s, i) => ({
      id: `screen_${i + 1}`,
      headline: s.headline,
      subheadline: s.subheadline,
      layout: ['iphone_centered', 'iphone_hero', 'iphone_offset'][i % 3] as any,
      background: ['soft_gradient', 'minimal', 'solid_light'][i % 3] as any,
      emphasis: s.emphasis
    }))
  } else if (input.includes('social') || input.includes('chat') || input.includes('dating') || input.includes('connect')) {
    theme = 'social'
    tone = 'playful'
    
    const variations = [
      [
        { headline: 'Real Conversations', subheadline: 'No likes, no follower counts, just talk', emphasis: 'social' as const },
        { headline: 'Find Your People', subheadline: 'Match with others who share your interests', emphasis: 'dashboard' as const },
        { headline: 'Voice-First Connect', subheadline: 'Break the ice with audio messages', emphasis: 'feature' as const }
      ],
      [
        { headline: 'Skip the Small Talk', subheadline: 'Deep questions spark better connections', emphasis: 'feature' as const },
        { headline: 'Safe Space Guaranteed', subheadline: 'AI moderation keeps conversations respectful', emphasis: 'dashboard' as const },
        { headline: 'Meet IRL Faster', subheadline: 'Built-in event planning and meetup tools', emphasis: 'social' as const }
      ]
    ]
    
    const selected = variations[Math.floor(Math.random() * variations.length)]
    screens = selected.map((s, i) => ({
      id: `screen_${i + 1}`,
      headline: s.headline,
      subheadline: s.subheadline,
      layout: ['iphone_centered', 'iphone_offset', 'iphone_hero'][i % 3] as any,
      background: ['soft_gradient', 'solid_light', 'branded'][i % 3] as any,
      emphasis: s.emphasis
    }))
  } else {
    // Generic but more creative fallback
    const genericVariations = [
      [
        { headline: `${keywords[0] ? keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1) : 'Smart'} Solutions`, subheadline: 'Designed for how you actually work', emphasis: 'dashboard' as const },
        { headline: 'Zero Learning Curve', subheadline: 'Start using it immediately, no tutorial needed', emphasis: 'onboarding' as const },
        { headline: 'Works Offline Too', subheadline: 'Full functionality without internet connection', emphasis: 'feature' as const }
      ],
      [
        { headline: 'Better by Design', subheadline: 'Every detail crafted for your workflow', emphasis: 'dashboard' as const },
        { headline: 'Collaborate Seamlessly', subheadline: 'Share and sync across your team', emphasis: 'social' as const },
        { headline: 'Privacy First', subheadline: 'Your data stays yours, always encrypted', emphasis: 'feature' as const }
      ],
      [
        { headline: 'Lightning Fast', subheadline: 'Optimized for speed on any device', emphasis: 'feature' as const },
        { headline: 'Customize Everything', subheadline: 'Adapt the experience to your preferences', emphasis: 'dashboard' as const },
        { headline: 'Smart Automation', subheadline: 'Let AI handle the repetitive tasks', emphasis: 'charts' as const }
      ]
    ]
    
    const selected = genericVariations[Math.floor(Math.random() * genericVariations.length)]
    screens = selected.map((s, i) => ({
      id: `screen_${i + 1}`,
      headline: s.headline,
      subheadline: s.subheadline,
      layout: ['iphone_centered', 'iphone_offset', 'iphone_feature_list'][i % 3] as any,
      background: ['soft_gradient', 'solid_light', 'minimal'][i % 3] as any,
      emphasis: s.emphasis
    }))
  }

  return {
    theme,
    tone,
    targetAudience: 'tech-savvy users aged 25-40',
    screens
  }
}

/**
 * Check if OpenAI API key is configured
 */
export function hasOpenAIKey(): boolean {
  return !!process.env.NEXT_PUBLIC_OPENAI_API_KEY
}
