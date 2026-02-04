/**
 * OpenAI Service for Lume AI
 * Chat responses (markdown) + Structure generation (JSON)
 */

import { AIResponseSchema, type AIResponse, type ScreenLayout } from './ai-helpers'

// Chat system prompt (clean markdown, conversational)
const CHAT_SYSTEM_PROMPT = `You are a seasoned App Store marketing consultant who's helped hundreds of apps succeed.

Your conversation flow:

**STAGES:**

1. **First 3-5 messages**: Have a natural conversation about their app
   - Ask clarifying questions about their app concept
   - Understand their target audience and key features
   - Give strategic advice about App Store positioning
   - NO screenshot suggestions yet, just conversation
   - Keep responses under 150 words

2. **After 3-5 exchanges**: When you have a good understanding, naturally suggest:
   "I have a clear picture of what you're building. To create stunning App Store screenshots, I'll need to see your actual app screens. Can you upload 5 screenshots of your key features?"

3. **After screenshots uploaded**: You'll receive image analysis data
   - Acknowledge what you see in their design
   - Comment on fonts, colors, layout
   - Ask if they want to proceed with generation

**RULES:**
- Be conversational and natural, not template-driven
- Each response should be different based on context
- Ask follow-up questions to understand their app better
- Don't rush to screenshot generation
- No emojis unless they use them first
- Keep responses concise (under 200 words)

**CONTEXT AWARENESS:**
- Track conversation stage (early discussion vs. ready for upload)
- Vary your responses - don't sound repetitive
- Focus on their specific app, not generic advice`

// Structure system prompt (JSON only)
const STRUCTURE_SYSTEM_PROMPT = `You are an App Store marketing expert extracting screenshot copy from user descriptions.

CRITICAL: Read the user's ACTUAL app description and extract REAL features they mention.

OUTPUT SCHEMA:
{
  "theme": "string (app category)",
  "tone": "clean|bold|professional|playful|minimal",
  "targetAudience": "string (who uses this)",
  "screens": [
    {
      "id": "screen_X",
      "headline": "Two Words",
      "subheadline": "8-12 word benefit description",
      "layout": "iphone_centered|iphone_offset|iphone_feature_list|iphone_comparison|iphone_hero",
      "background": "soft_gradient|solid_light|solid_dark|branded|minimal",
      "emphasis": "dashboard|charts|social|onboarding|feature"
    }
  ]
}

YOUR RULES:
1. Headlines: EXACTLY 2 words from THEIR feature descriptions
2. Subheadlines: 8-12 words explaining the benefit THEY described
3. Generate 3-5 screens depending on how many features they mention
4. Each screen = DIFFERENT feature they ACTUALLY mentioned
5. DO NOT invent generic features ("Smart Features", "Quick Access")
6. Use THEIR vocabulary, not marketing templates
7. Vary the structure - don't always follow the same pattern

EXTRACTION EXAMPLES:

Input: "meditation app for sleep with nature sounds"
Good:
{
  "theme": "wellness",
  "tone": "minimal",
  "targetAudience": "stressed professionals",
  "screens": [
    {"id": "screen_1", "headline": "Sleep Meditations", "subheadline": "Fall asleep faster with guided meditation designed for rest", "layout": "iphone_centered", "background": "soft_gradient", "emphasis": "feature"},
    {"id": "screen_2", "headline": "Nature Soundscapes", "subheadline": "Relax with high quality recordings of rain and forests", "layout": "iphone_offset", "background": "minimal", "emphasis": "dashboard"},
    {"id": "screen_3", "headline": "Bedtime Stories", "subheadline": "Drift off to soothing narrated tales for adults", "layout": "iphone_hero", "background": "soft_gradient", "emphasis": "feature"}
  ]
}

Input: "recipe app with photo ingredient recognition"
Good:
{
  "theme": "food",
  "tone": "playful",
  "targetAudience": "home cooks",
  "screens": [
    {"id": "screen_1", "headline": "Photo Recognition", "subheadline": "Snap your fridge and see what meals you can make", "layout": "iphone_centered", "background": "branded", "emphasis": "feature"},
    {"id": "screen_2", "headline": "Ingredient Scanner", "subheadline": "AI identifies every item from your pantry photos automatically", "layout": "iphone_offset", "background": "solid_light", "emphasis": "dashboard"},
    {"id": "screen_3", "headline": "Recipe Suggestions", "subheadline": "Get personalized meal ideas based on what you have", "layout": "iphone_feature_list", "background": "soft_gradient", "emphasis": "feature"}
  ]
}

BAD - Generic template (DO NOT DO):
{
  "screens": [
    {"headline": "Smart Features", "subheadline": "Powerful tools designed to help you succeed"},
    {"headline": "Quick Access", "subheadline": "Get what you need instantly"}
  ]
}

Return ONLY valid JSON. Read their description carefully.`

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
        temperature: 0.85,
        max_tokens: 1200,
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
  callbacks: StreamCallbacks,
  messageCount?: number
): Promise<void> {
  const { onStart, onToken, onComplete } = callbacks

  onStart?.()

  const response = generateMockMarkdownResponse(userMessage, messageCount)
  const words = response.split(' ')
  
  let fullText = ''

  for (let i = 0; i < words.length; i++) {
    fullText += (i === 0 ? '' : ' ') + words[i]
    onToken?.(words[i], fullText)
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  onComplete?.(fullText)
}

// Helper: Generate 5 screenshot titles and subtitles from user input
function generate5Screenshots(userInput: string): string {
  const input = userInput.toLowerCase()
  let screenshots: Array<{ title: string; subtitle: string }> = []
  
  // Finance app
  if (input.includes('finance') || input.includes('budget') || input.includes('money') || input.includes('bank')) {
    screenshots = [
      { title: 'Expense Tracking', subtitle: 'Automatically categorize and track all your expenses in real time' },
      { title: 'Bill Splitting', subtitle: 'Split bills with friends and settle up instantly with one tap' },
      { title: 'Smart Budgets', subtitle: 'Create intelligent budgets that adapt to your spending patterns' },
      { title: 'Instant Payments', subtitle: 'Send money to anyone instantly without fees or delays' },
      { title: 'Group Balance', subtitle: 'See who owes what in your groups with crystal clear balances' }
    ]
  } 
  // Fitness app
  else if (input.includes('fitness') || input.includes('health') || input.includes('workout')) {
    screenshots = [
      { title: 'AI Workouts', subtitle: 'Get personalized workout routines powered by artificial intelligence' },
      { title: 'Progress Tracking', subtitle: 'Monitor your fitness journey with detailed charts and statistics' },
      { title: 'Custom Plans', subtitle: 'Create custom workout plans tailored to your fitness level' },
      { title: 'Form Coaching', subtitle: 'Receive real-time feedback on your exercise form and technique' },
      { title: 'Smart Goals', subtitle: 'Set and achieve your fitness goals with intelligent tracking' }
    ]
  }
  // Social/chat app
  else if (input.includes('social') || input.includes('chat') || input.includes('dating') || input.includes('connect')) {
    screenshots = [
      { title: 'Smart Matching', subtitle: 'Connect with people who share your interests and values' },
      { title: 'Real Conversations', subtitle: 'Start meaningful conversations without awkward icebreakers' },
      { title: 'Safe Community', subtitle: 'Verified profiles and built-in safety features protect you' },
      { title: 'Group Spaces', subtitle: 'Join communities based on your hobbies and passions' },
      { title: 'Instant Messaging', subtitle: 'Chat seamlessly with photos, videos, and voice messages' }
    ]
  }
  // Productivity app
  else if (input.includes('task') || input.includes('todo') || input.includes('productivity') || input.includes('organize')) {
    screenshots = [
      { title: 'Quick Capture', subtitle: 'Add tasks and notes in seconds without breaking your flow' },
      { title: 'Smart Organization', subtitle: 'AI automatically organizes your tasks by priority and deadline' },
      { title: 'Progress Tracking', subtitle: 'See your productivity trends and celebrate your wins' },
      { title: 'Team Sync', subtitle: 'Collaborate with your team and stay aligned on projects' },
      { title: 'Focus Mode', subtitle: 'Block distractions and get in the zone with guided focus sessions' }
    ]
  }
  // Default/generic
  else {
    screenshots = [
      { title: 'Smart Features', subtitle: 'Powerful tools designed to help you succeed every day' },
      { title: 'Quick Access', subtitle: 'Get to what you need instantly with intuitive navigation' },
      { title: 'Easy Setup', subtitle: 'Start using the app in seconds with simple onboarding' },
      { title: 'Auto Sync', subtitle: 'Everything stays in sync across all your devices seamlessly' },
      { title: 'Premium Tools', subtitle: 'Advanced features that give you complete control and flexibility' }
    ]
  }
  
  return `\n\n**Suggested Screenshots:**\n\n` +
    screenshots.map((s, i) => `${i + 1}. **${s.title}** - ${s.subtitle}`).join('\n')
}

function generateMockMarkdownResponse(userInput: string, messageCount?: number): string {
  const input = userInput.toLowerCase()
  
  // Check if this is an upload confirmation message
  if (input.includes('[uploaded') && input.includes('screenshots')) {
    return `Great! I can see you've uploaded your app screenshots. Let me take a look at what you've got.

From what I can observe, your app has a clean, modern design. The color scheme looks well thought out, and the interface appears intuitive.

**Next Steps:**

Would you like me to generate professional App Store screenshots using Template 1? I'll create compelling designs with:
- Eye-catching headlines based on your app's features
- Professional layout optimized for the App Store
- Proper sizing for all required iPhone dimensions

Ready to generate? Just let me know!`
  }
  
  // After 3-5 messages, suggest uploading screenshots
  const shouldSuggestUpload = messageCount && messageCount >= 5 && !input.includes('upload')
  const uploadSuggestion = shouldSuggestUpload 
    ? `\n\n---\n\n**Ready for the next step?**\n\nI have a clear picture of what you're building. To create stunning App Store screenshots, I'll need to see your actual app screens.\n\n📱 **Upload 5 screenshots** of your key features using the attachment button below, and I'll analyze your design to generate professional App Store visuals.`
    : ''
  
  // Generate varied response styles
  const responseStyles = ['direct', 'analytical', 'strategic', 'visual-first']
  const selectedStyle = responseStyles[Math.floor(Math.random() * responseStyles.length)]
  
  let response = ''
  const screenshotsSection = generate5Screenshots(userInput)
  
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

What specific features does your app have that you want to highlight?${uploadSuggestion}`
    } else if (selectedStyle === 'analytical') {
      response = `Finance app. Interesting space—high trust barrier, high switching cost.

**The Psychology:** Users won't switch unless the pain of staying > pain of changing. Your screenshots need to demonstrate immediate value, not promise future benefits.

**Screenshot Strategy:**

Screen 1 should answer "What's different?" in 2 seconds. Not "easy money transfer"—everyone says that. Show the transfer happening. Show the notification. Show the confirmation.

Screen 2: The dashboard. But make it a dashboard someone would actually check daily. What's the hook? Real-time spending alerts? Automatic savings? Instant categorization?

Screen 3: Trust signals. Security isn't a feature anymore, it's table stakes. Show biometrics, encryption, whatever. But quickly.

**Critical:** ${input.includes('real-time') ? 'You mentioned real-time. That\'s your angle. Hammer it.' : input.includes('easy') ? 'Everyone says "easy." Show fast instead.' : 'Find your one differentiator and lead with it.'}

Tell me more about what makes your app different from competitors?${uploadSuggestion}`
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

What are the 2-3 core features you want people to know about immediately?${uploadSuggestion}`
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

Once you're ready, you can upload your app screenshots and we'll create something that looks as good as it functions.${uploadSuggestion}`
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
${screenshotsSection}

What type of workouts or fitness features does your app focus on?${uploadSuggestion}`,

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

What's your actual hook? What makes people want to come back day after day?${uploadSuggestion}`
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

What makes your community different from existing platforms?${uploadSuggestion}`,

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

What's your actual differentiator?${uploadSuggestion}`
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

Tell me more about the main problem your app solves?${uploadSuggestion}`,

      `"${userInput.slice(0, 60)}${userInput.length > 60 ? '...' : ''}"

Interesting. Before we dive into designs, quick question: What makes someone choose YOUR app over the dozen similar ones?

That answer should be visible in your first screenshot. Not written, not explained—*shown*.

Most apps fail here. They show features (buttons, menus, lists) instead of outcomes (what you get, why it matters, how it feels).

**The Setup:**
- Screen 1: The hook (why look at screen 2?)
- Screen 2: The proof (okay, this actually works)
- Screen 3+: Details (if they're still interested)

Let's dig deeper - what's the main benefit users get from your app?${uploadSuggestion}`,

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

What's the one thing that makes your app stand out?${uploadSuggestion}`
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
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: STRUCTURE_SYSTEM_PROMPT },
        { role: 'user', content: `App description: "${userMessage}"\n\nExtract REAL features they mention and create 3-5 compelling screenshot structures. Use THEIR words, not generic templates.` }
      ],
      temperature: 0.9,
      max_tokens: 1500,
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
