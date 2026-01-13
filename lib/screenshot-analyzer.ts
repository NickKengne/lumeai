/**
 * Screenshot Analyzer
 * Analyzes uploaded screenshots to extract colors and suggest layouts
 */

// Extract dominant colors from screenshot
export async function extractColorsFromScreenshot(screenshotBase64: string): Promise<string[]> {
  try {
    // Create a canvas to analyze the image
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = screenshotBase64
    })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
    if (!ctx) return ['#F5F5F5']

    // Scale down for faster analysis
    const scale = 0.1
    canvas.width = img.width * scale
    canvas.height = img.height * scale
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Count colors
    const colorCounts: { [key: string]: number } = {}
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      // Skip transparent pixels and very light/dark pixels
        if (a < 128) continue
      if (r > 245 && g > 245 && b > 245) continue // Skip white
      if (r < 10 && g < 10 && b < 10) continue // Skip black

      // Quantize to reduce color variations
      const quantized = `${Math.floor(r / 32) * 32},${Math.floor(g / 32) * 32},${Math.floor(b / 32) * 32}`
      colorCounts[quantized] = (colorCounts[quantized] || 0) + 1
    }

    // Get top colors
    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => {
        const [r, g, b] = color.split(',').map(Number)
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      })

    return sortedColors.length > 0 ? sortedColors : ['#F5F5F5']
  } catch (error) {
    console.error('Color extraction failed:', error)
    return ['#F5F5F5']
  }
}

// Generate complementary background colors
export function generateComplementaryColors(dominantColors: string[]): string[] {
  const backgrounds: string[] = []

  for (const color of dominantColors.slice(0, 3)) {
    try {
      // Parse hex color
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)

      // Generate lighter version for background
      const lighter = (val: number) => Math.min(255, Math.floor(val + (255 - val) * 0.85))
      const bgR = lighter(r)
      const bgG = lighter(g)
      const bgB = lighter(b)

      const bgColor = `#${bgR.toString(16).padStart(2, '0')}${bgG.toString(16).padStart(2, '0')}${bgB.toString(16).padStart(2, '0')}`
      backgrounds.push(bgColor)

      // Also add a darker complementary version
      const darker = (val: number) => Math.max(0, Math.floor(val * 0.4))
      const darkR = darker(r)
      const darkG = darker(g)
      const darkB = darker(b)
      const darkColor = `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`
      backgrounds.push(darkColor)
    } catch (e) {
      console.error('Failed to generate complementary color:', e)
    }
  }

  return backgrounds.length > 0 ? backgrounds : ['#F5F5F5', '#1A1A1A']
}

// Use AI to suggest template and generate headlines
export async function analyzeScreenshotsWithAI(
  screenshots: string[],
  userPrompt: string
): Promise<{
  suggestedTemplateId: string
  templateReasoning: string
  screenHeadlines: string[]
  screenSubtitles: string[]
  suggestedBackgrounds: string[]
}> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY

    if (!apiKey) {
      console.log('No API key, using fallback analysis')
      return generateFallbackAnalysis(screenshots.length, userPrompt)
    }

    const prompt = `Analyze this app concept and suggest the best screenshot layout:

User's app description: "${userPrompt}"
Number of screenshots: ${screenshots.length}

Available template: default
This template alternates between 2 screen configurations automatically

Based on the app description, provide:
1. Best template ID (just the ID from list above)
2. Why this template works for this app (one sentence)
3. Compelling headline for each screenshot (3-4 words, benefit-focused)
4. Optional subtitle for each (5-7 words)
5. Suggested background color scheme (3 hex colors)

Respond in JSON format:
{
  "templateId": "default",
  "reasoning": "Clean professional layout",
  "headlines": ["Track Expenses", "Budget Insights", "Reach Goals", "Smart Savings", "Financial Freedom"],
  "subtitles": ["Never miss a transaction", "See where money goes", "Save with AI tips", "Automated budgeting", "Reach your goals faster"],
  "backgrounds": ["#F5F5F5", "#FFFFFF", "#FAFAFA"],
  "textColor": "#1A1A1A",
  "fontFamily": "Lato"
}`

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
            content: 'You are an expert App Store marketing consultant. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status)
      return generateFallbackAnalysis(screenshots.length, userPrompt)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return generateFallbackAnalysis(screenshots.length, userPrompt)
    }

    const result = JSON.parse(content)

    return {
      suggestedTemplateId: result.templateId || 'dark_centered',
      templateReasoning: result.reasoning || 'Professional design choice',
      screenHeadlines: result.headlines || Array(screenshots.length).fill('Amazing Feature'),
      screenSubtitles: result.subtitles || [],
      suggestedBackgrounds: result.backgrounds || ['#F5F5F5', '#1A1A1A', '#3B82F6']
    }
  } catch (error) {
    console.error('AI analysis failed:', error)
    return generateFallbackAnalysis(screenshots.length, userPrompt)
  }
}

// Fallback analysis when AI is not available
function generateFallbackAnalysis(
  screenshotCount: number,
  userPrompt: string
): {
  suggestedTemplateId: string
  templateReasoning: string
  screenHeadlines: string[]
  screenSubtitles: string[]
  suggestedBackgrounds: string[]
} {
  const prompt = userPrompt.toLowerCase()

  let templateId = 'default'
  let reasoning = 'Clean and professional'
  let backgrounds = ['#F5F5F5', '#FFFFFF', '#FAFAFA', '#F8F8F8', '#FCFCFC']

  if (prompt.includes('finance') || prompt.includes('money')) {
    backgrounds = ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA']
  } else if (prompt.includes('fitness') || prompt.includes('health')) {
    backgrounds = ['#FFEDD5', '#FED7AA', '#FDBA74', '#FB923C', '#F97316']
  } else if (prompt.includes('social') || prompt.includes('dating')) {
    backgrounds = ['#FCE7F3', '#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899']
  } else if (prompt.includes('meditation') || prompt.includes('wellness')) {
    backgrounds = ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA']
  }

  // Always generate 5 headlines
  const headlines = Array(5)
    .fill(null)
    .map((_, i) => `Feature ${i + 1}`)
  
  const subtitles = Array(5)
    .fill(null)
    .map((_, i) => `This feature makes your app better`)

  return {
    suggestedTemplateId: templateId,
    templateReasoning: reasoning,
    screenHeadlines: headlines,
    screenSubtitles: subtitles,
    suggestedBackgrounds: backgrounds
  }
}

// Combined analysis: extract colors + AI suggestions + font detection
export async function analyzeScreenshots(
  screenshots: string[],
  userPrompt: string
): Promise<{
  suggestedTemplateId: string
  templateReasoning: string
  screenHeadlines: string[]
  screenSubtitles: string[]
  dominantColors: string[]
  suggestedBackgrounds: string[]
  detectedFonts: string[]
  textColor: string
}> {
  // Get AI suggestions
  const aiAnalysis = await analyzeScreenshotsWithAI(screenshots, userPrompt)

  // Extract colors from first screenshot
  let dominantColors: string[] = []
  let complementaryBg: string[] = []

  if (screenshots.length > 0) {
    try {
      dominantColors = await extractColorsFromScreenshot(screenshots[0])
      complementaryBg = generateComplementaryColors(dominantColors)
    } catch (e) {
      console.error('Color extraction failed:', e)
    }
  }

  // Determine best text color based on screenshot brightness
  let textColor = '#FFFFFF' // Default to white
  if (dominantColors.length > 0) {
    const avgBrightness = dominantColors.reduce((sum, color) => {
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      return sum + (r + g + b) / 3
    }, 0) / dominantColors.length
    
    textColor = avgBrightness > 128 ? '#1A1A1A' : '#FFFFFF'
  }

  // Merge AI backgrounds with extracted colors
  const allBackgrounds = [
    ...complementaryBg,
    ...aiAnalysis.suggestedBackgrounds
  ].slice(0, 6)
  
  // Detect fonts from AI analysis or use defaults
  const detectedFonts = ['SF Pro Display', 'Inter', 'Helvetica Neue']
  
  return {
    ...aiAnalysis,
    dominantColors,
    suggestedBackgrounds: allBackgrounds.length > 0 ? allBackgrounds : aiAnalysis.suggestedBackgrounds,
    detectedFonts,
    textColor
  }
}
