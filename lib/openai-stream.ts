/**
 * OpenAI Service for Lume AI
 * Chat responses (markdown) + Structure generation (JSON)
 */

import { AIResponseSchema, type AIResponse, type ScreenLayout } from './ai-helpers'

// Chat system prompt (clean markdown, no emojis)
const CHAT_SYSTEM_PROMPT = `You are an expert App Store marketing consultant.

Analyze user's app concepts and provide actionable recommendations in clean Markdown.

Structure your response:

## Analysis
Brief analysis of app type and target audience.

## Visual Recommendations
Style, colors, and tone recommendations.

## Screenshot Strategy
Recommend 3-5 screenshots showing key features.

## Next Steps
Ask user to upload their app screenshots.

Rules:
- Clean markdown only (no emojis)
- 300-500 words
- Focus on benefits not features
- Professional tone`

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
  
  let appType = 'mobile application'
  let features = ['Intuitive interface', 'Seamless experience', 'User engagement']
  let colors = 'modern gradients with clean aesthetics'
  let audience = 'tech-savvy users aged 25-40'
  
  if (input.includes('finance') || input.includes('budget')) {
    appType = 'finance application'
    features = ['Real-time expense tracking', 'Budget insights', 'Savings goals']
    colors = 'professional blues and greens'
    audience = 'young professionals managing finances'
  } else if (input.includes('fitness') || input.includes('health')) {
    appType = 'fitness application'
    features = ['Personalized workouts', 'Progress tracking', 'Community motivation']
    colors = 'energetic oranges and blues'
    audience = 'health-conscious individuals'
  } else if (input.includes('meditation') || input.includes('mindfulness')) {
    appType = 'wellness application'
    features = ['Guided meditation', 'Stress reduction', 'Progress tracking']
    colors = 'soft gradients with calming tones'
    audience = 'stressed professionals'
  }

  return `## Analysis

Your app is a **${appType}** targeting ${audience}.

This type of application serves users looking for modern, intuitive solutions to improve their daily lives.

### Key Features
- ${features[0]}
- ${features[1]}
- ${features[2]}

### Target Audience
${audience.charAt(0).toUpperCase() + audience.slice(1)} who value clean, efficient design.

---

## Visual Recommendations

**Layout Style:** iPhone-centered with bold headlines and clear visual hierarchy

**Color Scheme:** ${colors}

**Typography:** SF Pro or Helvetica for maximum readability

**Tone:** Clean and professional with emphasis on user benefits

---

## Screenshot Strategy

For App Store success, create **3-5 screenshots** that showcase:

1. **Main Interface** - Core functionality and clean design
2. **Key Features** - What differentiates you from competitors
3. **User Benefits** - Clear value proposition
4. **Results** - Social proof or statistics (if applicable)
5. **Call to Action** - Encourage downloads

---

## Next Steps

To create professional App Store screenshots, please upload images of your app's main screens.

I'll generate multiple layout variations optimized for:
- iPhone 6.7" and 6.5" displays
- iPad (if needed)
- App Store best practices
- Maximum conversion

**Ready to upload your screenshots?**`
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
