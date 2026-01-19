/**
 * Prompt Analyzer - Analyzes user's prompt and generates screenshot titles/subtitles
 * This happens BEFORE screenshots are uploaded
 */

export interface PromptAnalysisResult {
  titles: string[]
  subtitles: string[]
  appCategory: string
  tone: 'clean' | 'bold' | 'professional' | 'playful' | 'minimal'
  targetAudience: string
  suggestedLayout: 'layout1' | 'layout2'
}

const SYSTEM_PROMPT = `You are an expert App Store marketing consultant with 10+ years of experience.

Your job is to analyze the user's app concept and create compelling screenshot titles and subtitles that will maximize App Store conversion.

CRITICAL RULES:
1. Generate EXACTLY 5 titles and 5 subtitles
2. Titles MUST be EXACTLY 2 words (e.g., "Smart Budgeting", "Instant Sync")
3. Extract features DIRECTLY from what the user describes - DO NOT invent features
4. Subtitles should be 8-12 words explaining the specific benefit
5. Each title/subtitle pair should represent a DIFFERENT feature
6. Use App Store keywords that users actually search for
7. Focus on BENEFITS, not technical features

Return ONLY valid JSON in this exact format:
{
  "titles": ["Title One", "Title Two", "Title Three", "Title Four", "Title Five"],
  "subtitles": ["Benefit of title one in 8-12 words", "Benefit of title two...", "Benefit of title three...", "Benefit of title four...", "Benefit of title five..."],
  "appCategory": "detected category (e.g., finance, fitness, social, productivity)",
  "tone": "professional",
  "targetAudience": "description of target users",
  "suggestedLayout": "layout1"
}

EXAMPLES:

User: "fitness app with AI workout plans and progress tracking"
CORRECT:
{
  "titles": ["AI Workouts", "Progress Tracking", "Custom Plans", "Form Coaching", "Smart Goals"],
  "subtitles": [
    "Get personalized workout routines powered by artificial intelligence",
    "Monitor your fitness journey with detailed charts and statistics",
    "Create custom workout plans tailored to your fitness level",
    "Receive real-time feedback on your exercise form and technique",
    "Set and achieve your fitness goals with intelligent tracking"
  ],
  "appCategory": "fitness",
  "tone": "bold",
  "targetAudience": "fitness enthusiasts and beginners",
  "suggestedLayout": "layout2"
}

User: "finance app to track expenses and split bills with friends"
CORRECT:
{
  "titles": ["Expense Tracking", "Bill Splitting", "Smart Budgets", "Instant Payments", "Group Balance"],
  "subtitles": [
    "Automatically categorize and track all your expenses in real time",
    "Split bills with friends and settle up instantly with one tap",
    "Create intelligent budgets that adapt to your spending patterns",
    "Send money to anyone instantly without fees or delays",
    "See who owes what in your groups with crystal clear balances"
  ],
  "appCategory": "finance",
  "tone": "professional",
  "targetAudience": "young professionals and students",
  "suggestedLayout": "layout1"
}

Now analyze the user's prompt and return valid JSON.`

/**
 * Analyze user prompt with AI and generate titles/subtitles
 */
export async function analyzeUserPrompt(userPrompt: string): Promise<PromptAnalysisResult> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY

    if (!apiKey) {
      console.log('No API key, using fallback')
      return generateFallbackPromptAnalysis(userPrompt)
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
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Analyze this app concept and generate screenshot titles/subtitles:\n\n"${userPrompt}"`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status)
      return generateFallbackPromptAnalysis(userPrompt)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return generateFallbackPromptAnalysis(userPrompt)
    }

    const result = JSON.parse(content)

    // Ensure we have exactly 5 items
    const titles = Array.isArray(result.titles) ? result.titles : []
    const subtitles = Array.isArray(result.subtitles) ? result.subtitles : []
    
    while (titles.length < 5) {
      titles.push(`Feature ${titles.length + 1}`)
    }
    while (subtitles.length < 5) {
      subtitles.push('Powerful features designed to help you succeed')
    }

    return {
      titles: titles.slice(0, 5),
      subtitles: subtitles.slice(0, 5),
      appCategory: result.appCategory || 'general',
      tone: result.tone || 'professional',
      targetAudience: result.targetAudience || 'users',
      suggestedLayout: result.suggestedLayout || 'layout1'
    }
  } catch (error) {
    console.error('Prompt analysis failed:', error)
    return generateFallbackPromptAnalysis(userPrompt)
  }
}

/**
 * Fallback when AI is not available - minimal logic
 */
function generateFallbackPromptAnalysis(userPrompt: string): PromptAnalysisResult {
  return {
    titles: [
      'Smart Features',
      'Quick Access',
      'Easy Setup',
      'Auto Sync',
      'Premium Tools'
    ],
    subtitles: [
      'Powerful tools designed to help you succeed every day',
      'Get to what you need instantly with intuitive navigation',
      'Start using the app in seconds with simple onboarding',
      'Everything stays in sync across all your devices seamlessly',
      'Advanced features that give you complete control and flexibility'
    ],
    appCategory: 'general',
    tone: 'professional',
    targetAudience: 'users',
    suggestedLayout: 'layout1'
  }
}

