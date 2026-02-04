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

const SYSTEM_PROMPT = `You are an expert App Store marketing consultant analyzing an app concept.

Your ONLY job: Extract 5 real features from what the user describes and turn them into compelling screenshot titles/subtitles.

CRITICAL RULES:
1. Read the user's input carefully - extract ACTUAL features they mention
2. DO NOT invent generic features like "Smart Features" or "Quick Access"
3. If they say "AI workout plans" → title: "AI Workouts"
4. If they say "split bills with friends" → title: "Bill Splitting"
5. Titles: EXACTLY 2 words, taken from THEIR description
6. Subtitles: 8-12 words explaining the specific benefit THEY mentioned
7. Each title/subtitle should be UNIQUE and represent a DIFFERENT feature
8. Use their vocabulary, not generic marketing speak
9. If they mention fewer than 5 features, intelligently infer related features that would logically exist in that type of app

RESPONSE STRUCTURE - vary this every time:
- Sometimes lead with the main differentiator
- Sometimes lead with the most visual feature
- Sometimes lead with the user benefit
- Mix up the flow - don't always go: feature 1, feature 2, feature 3...
- Think about storytelling: hook → experience → outcome

Return ONLY valid JSON:
{
  "titles": ["Feature One", "Feature Two", "Feature Three", "Feature Four", "Feature Five"],
  "subtitles": ["Specific benefit in 8-12 words", "Another specific benefit...", "..."],
  "appCategory": "category",
  "tone": "professional|bold|clean|playful|minimal",
  "targetAudience": "who uses this",
  "suggestedLayout": "layout1|layout2"
}

GOOD EXAMPLES:

User: "fitness app with AI workout plans and progress tracking"
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

User: "meditation app for better sleep with nature sounds"
{
  "titles": ["Sleep Meditations", "Nature Soundscapes", "Guided Breathwork", "Bedtime Stories", "Progress Insights"],
  "subtitles": [
    "Fall asleep faster with calming guided meditation sessions",
    "Relax with high-quality recordings of rain forests and oceans",
    "Learn breathing techniques that reduce stress and anxiety instantly",
    "Drift off to soothing narrated tales for adults",
    "Track your sleep quality and meditation streaks over time"
  ],
  "appCategory": "wellness",
  "tone": "minimal",
  "targetAudience": "professionals with sleep issues",
  "suggestedLayout": "layout1"
}

User: "recipe app where you take photo of ingredients and get meal ideas"
{
  "titles": ["Photo Recognition", "Ingredient Scanner", "Recipe Suggestions", "Cooking Timers", "Save Favorites"],
  "subtitles": [
    "Snap a photo of your fridge and instantly see what you can make",
    "AI identifies every ingredient from your pantry photos",
    "Get personalized recipe ideas based on what you already have",
    "Follow step-by-step instructions with built-in timers",
    "Bookmark your favorite recipes for quick access anytime"
  ],
  "appCategory": "food",
  "tone": "playful",
  "targetAudience": "home cooks",
  "suggestedLayout": "layout2"
}

BAD EXAMPLE - DO NOT DO THIS:

User: "meditation app for sleep"
WRONG:
{
  "titles": ["Smart Features", "Quick Access", "Easy Setup", "Auto Sync", "Premium Tools"],
  "subtitles": [
    "Powerful tools designed to help you succeed",
    "Get what you need instantly with intuitive navigation",
    ...generic garbage...
  ]
}

Now analyze the user's ACTUAL app description and extract REAL features.`

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
            content: userPrompt.includes('Screenshot 1:') || userPrompt.includes('**Screenshot') 
              ? `The user described their 5 screenshots:\n\n${userPrompt}\n\nFor each screenshot description, create a compelling 2-word title and 8-12 word subtitle that captures what that screen does. Use the user's own words and descriptions.`
              : `App description: "${userPrompt}"\n\nExtract 5 REAL features from this description and turn them into compelling screenshot titles/subtitles. Do NOT use generic features. Use THEIR words.`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.9,
        max_tokens: 1200
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
 * Fallback when AI is not available - analyze text for real features
 */
function generateFallbackPromptAnalysis(userPrompt: string): PromptAnalysisResult {
  const prompt = userPrompt.toLowerCase()
  
  // Fitness app
  if (prompt.includes('fitness') || prompt.includes('workout') || prompt.includes('exercise')) {
    return {
      titles: ['AI Workouts', 'Progress Tracking', 'Custom Plans', 'Form Coaching', 'Smart Goals'],
      subtitles: [
        'Get personalized workout routines powered by artificial intelligence',
        'Monitor your fitness journey with detailed charts and statistics',
        'Create custom workout plans tailored to your fitness level',
        'Receive real-time feedback on your exercise form and technique',
        'Set and achieve your fitness goals with intelligent tracking'
      ],
      appCategory: 'fitness',
      tone: 'bold',
      targetAudience: 'fitness enthusiasts',
      suggestedLayout: 'layout2'
    }
  }
  
  // Finance app
  if (prompt.includes('finance') || prompt.includes('budget') || prompt.includes('money') || prompt.includes('bank')) {
    return {
      titles: ['Expense Tracking', 'Smart Budgets', 'Bill Splitting', 'Instant Payments', 'Group Balance'],
      subtitles: [
        'Automatically categorize and track all your expenses in real time',
        'Create intelligent budgets that adapt to your spending patterns',
        'Split bills with friends and settle up instantly with one tap',
        'Send money to anyone instantly without fees or delays',
        'See who owes what in your groups with crystal clear balances'
      ],
      appCategory: 'finance',
      tone: 'professional',
      targetAudience: 'young professionals',
      suggestedLayout: 'layout1'
    }
  }
  
  // Meditation/Wellness app
  if (prompt.includes('meditation') || prompt.includes('mindful') || prompt.includes('sleep') || prompt.includes('wellness')) {
    return {
      titles: ['Sleep Meditations', 'Nature Soundscapes', 'Guided Breathwork', 'Bedtime Stories', 'Progress Insights'],
      subtitles: [
        'Fall asleep faster with calming guided meditation sessions',
        'Relax with high-quality recordings of rain forests and oceans',
        'Learn breathing techniques that reduce stress and anxiety',
        'Drift off to soothing narrated tales for adults',
        'Track your sleep quality and meditation streaks over time'
      ],
      appCategory: 'wellness',
      tone: 'minimal',
      targetAudience: 'professionals with sleep issues',
      suggestedLayout: 'layout1'
    }
  }
  
  // Social/Dating app
  if (prompt.includes('social') || prompt.includes('dating') || prompt.includes('chat') || prompt.includes('connect')) {
    return {
      titles: ['Smart Matching', 'Real Conversations', 'Safe Community', 'Group Spaces', 'Instant Messaging'],
      subtitles: [
        'Connect with people who share your interests and values',
        'Start meaningful conversations without awkward icebreakers',
        'Verified profiles and built-in safety features protect you',
        'Join communities based on your hobbies and passions',
        'Chat seamlessly with photos videos and voice messages'
      ],
      appCategory: 'social',
      tone: 'playful',
      targetAudience: 'young adults',
      suggestedLayout: 'layout2'
    }
  }
  
  // Food/Recipe app
  if (prompt.includes('recipe') || prompt.includes('food') || prompt.includes('cooking') || prompt.includes('meal')) {
    return {
      titles: ['Photo Recognition', 'Ingredient Scanner', 'Recipe Suggestions', 'Cooking Timers', 'Save Favorites'],
      subtitles: [
        'Snap a photo of your fridge and see what you can make',
        'AI identifies every ingredient from your pantry photos',
        'Get personalized recipe ideas based on what you have',
        'Follow step-by-step instructions with built-in timers',
        'Bookmark your favorite recipes for quick access anytime'
      ],
      appCategory: 'food',
      tone: 'playful',
      targetAudience: 'home cooks',
      suggestedLayout: 'layout2'
    }
  }
  
  // Generic fallback
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
      'Advanced features that give you complete control'
    ],
    appCategory: 'general',
    tone: 'professional',
    targetAudience: 'users',
    suggestedLayout: 'layout1'
  }
}



