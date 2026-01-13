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
const STRUCTURE_SYSTEM_PROMPT = `You are an App Store marketing expert.
Transform app descriptions into structured screenshot instructions.

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

RULES:
- Generate 3-5 screens that tell a story
- Headlines: Max 8 words, benefit-focused
- Subheadlines: Optional, max 15 words
- Use ONLY the exact enum values listed above
- No markdown, no explanations, ONLY JSON`

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
  
  // Detect app category
  let response = ''
  
  if (input.includes('finance') || input.includes('budget') || input.includes('money')) {
    response = `## Quick Take

You're building a finance app. The bar is high—people trust these apps with their money, so every pixel matters.

**Core Challenge:** Getting someone to link their bank account to a new app requires massive trust. Your screenshots need to scream "secure" and "simple" simultaneously.

## Screenshot Must-Haves

1. **Dashboard view** - Show financial clarity, not complexity
2. **One key insight** - A graph or stat that makes them go "oh, I need that"
3. **Security badges** - Bank-level encryption, biometric login
4. **Social proof** - User count or rating if you have it

**Common Mistake:** Too many numbers and charts. Pick ONE powerful visual per screen.

## Design Direction

**Colors:** Blues/greens for trust. Avoid anything that feels unstable (reds, blacks).
**Tone:** Professional but not corporate. Approachable but not cute.
**Layout:** Clean, lots of white space. Let the data breathe.

---

**Next:** Upload your app screenshots. I'll design multiple layout options that actually convert.`
  } else if (input.includes('fitness') || input.includes('health') || input.includes('workout')) {
    response = `## Quick Take

Fitness apps live or die on motivation. Your screenshots need to make people feel capable, not guilty.

**Core Challenge:** Everyone's downloaded a fitness app that collected dust. You need to show why THIS time is different.

## Screenshot Must-Haves

1. **Transformation story** - Before/after or progress visualization
2. **The workout interface** - Prove it's not complicated
3. **Social/community element** - Nobody wants to suffer alone
4. **Quick wins** - Show what they'll achieve in week 1

**Common Mistake:** Too intense. Sixpack abs scare away more people than they attract. Show progress, not perfection.

## Design Direction

**Colors:** Energetic but not aggressive. Orange/blue combo works well.
**Tone:** Motivational but realistic. Coach, not drill sergeant.
**Layout:** Dynamic angles, movement, energy. Avoid static poses.

---

**Next:** Send me your app screens. I'll create layouts that inspire action, not guilt.`
  } else if (input.includes('social') || input.includes('dating') || input.includes('chat')) {
    response = `## Quick Take

Social apps are about belonging. Your screenshots need to show connection, not features.

**Core Challenge:** Empty social apps feel dead. You need to show a thriving community without looking fake.

## Screenshot Must-Haves

1. **Active conversations** - Real-looking chats (blur the content if needed)
2. **Discovery mechanism** - How do I find my people?
3. **Privacy controls** - Gen Z cares about this more than you think
4. **The vibe** - What makes this community special?

**Common Mistake:** Stock photos of models. Use real (or real-looking) diverse people.

## Design Direction

**Colors:** Vibrant but not childish. Think Discord, not Facebook 2010.
**Tone:** Inclusive and welcoming. No FOMO tactics.
**Layout:** Show the product in use, not empty screens.

---

**Next:** Upload your screens. I'll design layouts that make people want to join the conversation.`
  } else {
    response = `## Quick Take

I'm picking up: "${userInput.slice(0, 60)}${userInput.length > 60 ? '...' : ''}"

Here's what matters for App Store screenshots:

## The Three-Second Rule

Users decide in 3 seconds. Your first screenshot needs to answer:
1. What does this app do?
2. Why should I care?
3. Is it for me?

## Screenshot Blueprint

**Screen 1:** Hero shot - Your main interface with ONE clear benefit headline
**Screen 2:** The "aha" moment - The feature that makes you different
**Screen 3:** Social proof - Reviews, user count, or press mentions
**Screen 4:** CTA - "Start free trial" or similar

**Common Mistake:** Trying to show everything. Pick your 3-4 strongest selling points and hammer them home.

## Next Move

Upload your app screenshots and I'll create professional layouts with:
- Multiple design templates to choose from
- Benefit-focused headlines
- App Store-optimized sizing
- Fully editable in the canvas

**Ready? Drop those screenshots.**`
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
  
  if (input.includes('finance') || input.includes('budget')) {
    theme = 'finance'
    tone = 'professional'
    screens = [
      {
        id: 'screen_1',
        headline: 'Track Every Expense',
        subheadline: 'Stay on top of your spending',
        layout: 'iphone_centered',
        background: 'soft_gradient',
        emphasis: 'dashboard'
      },
      {
        id: 'screen_2',
        headline: 'Visualize Your Budget',
        subheadline: 'See where your money goes',
        layout: 'iphone_offset',
        background: 'solid_light',
        emphasis: 'charts'
      },
      {
        id: 'screen_3',
        headline: 'Reach Your Goals',
        subheadline: 'Save more, stress less',
        layout: 'iphone_centered',
        background: 'soft_gradient',
        emphasis: 'feature'
      }
    ]
  } else if (input.includes('fitness') || input.includes('health')) {
    theme = 'fitness'
    tone = 'bold'
    screens = [
      {
        id: 'screen_1',
        headline: 'Achieve Your Goals',
        subheadline: 'Personalized workout plans',
        layout: 'iphone_centered',
        background: 'soft_gradient',
        emphasis: 'dashboard'
      },
      {
        id: 'screen_2',
        headline: 'Track Your Progress',
        subheadline: 'See your improvements',
        layout: 'iphone_offset',
        background: 'solid_light',
        emphasis: 'charts'
      },
      {
        id: 'screen_3',
        headline: 'Stay Motivated',
        subheadline: 'Join a community',
        layout: 'iphone_hero',
        background: 'minimal',
        emphasis: 'social'
      }
    ]
  } else if (input.includes('meditation') || input.includes('mindfulness')) {
    theme = 'wellness'
    tone = 'minimal'
    screens = [
      {
        id: 'screen_1',
        headline: 'Find Your Peace',
        subheadline: 'Guided meditation',
        layout: 'iphone_centered',
        background: 'soft_gradient',
        emphasis: 'dashboard'
      },
      {
        id: 'screen_2',
        headline: 'Breathe & Relax',
        subheadline: 'Reduce stress',
        layout: 'iphone_hero',
        background: 'minimal',
        emphasis: 'feature'
      },
      {
        id: 'screen_3',
        headline: 'Track Your Journey',
        layout: 'iphone_offset',
        background: 'solid_light',
        emphasis: 'charts'
      }
    ]
  } else {
    screens = [
      {
        id: 'screen_1',
        headline: 'Transform Your Experience',
        subheadline: 'Everything you need',
        layout: 'iphone_centered',
        background: 'soft_gradient',
        emphasis: 'dashboard'
      },
      {
        id: 'screen_2',
        headline: 'Built For You',
        subheadline: 'Personalized features',
        layout: 'iphone_offset',
        background: 'solid_light',
        emphasis: 'feature'
      },
      {
        id: 'screen_3',
        headline: 'Start Today',
        subheadline: 'Join thousands of users',
        layout: 'iphone_centered',
        background: 'soft_gradient',
        emphasis: 'social'
      }
    ]
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
