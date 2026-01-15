/**
 * Screenshot Analyzer
 * Analyzes uploaded screenshots to extract colors and suggest layouts
 */

// Extract dominant colors AND background from screenshot
export async function extractColorsFromScreenshot(screenshotBase64: string): Promise<{
  colors: string[]
  backgroundColor: string
}> {
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
    if (!ctx) return { colors: ['#F5F5F5'], backgroundColor: '#F5F5F5' }

    // Scale down for faster analysis
    const scale = 0.1
    canvas.width = img.width * scale
    canvas.height = img.height * scale
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Count colors and detect background
    const colorCounts: { [key: string]: number } = {}
    const edgeColors: string[] = []
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      
      const pixelIndex = i / 4
      const x = pixelIndex % canvas.width
      const y = Math.floor(pixelIndex / canvas.width)

      // Skip transparent pixels
      if (a < 128) continue

      // Collect edge pixels for background detection
      const isEdge = x < 5 || x > canvas.width - 5 || y < 5 || y > canvas.height - 5
      if (isEdge) {
        const edgeColor = `${Math.floor(r / 16) * 16},${Math.floor(g / 16) * 16},${Math.floor(b / 16) * 16}`
        edgeColors.push(edgeColor)
      }

      // Skip very light/dark for color extraction
      if (r > 245 && g > 245 && b > 245) continue
      if (r < 10 && g < 10 && b < 10) continue

      // Quantize to reduce color variations
      const quantized = `${Math.floor(r / 32) * 32},${Math.floor(g / 32) * 32},${Math.floor(b / 32) * 32}`
      colorCounts[quantized] = (colorCounts[quantized] || 0) + 1
    }

    // Detect background from edge colors
    const bgColorCounts: { [key: string]: number } = {}
    edgeColors.forEach(color => {
      bgColorCounts[color] = (bgColorCounts[color] || 0) + 1
    })
    
    const mostCommonBgColor = Object.entries(bgColorCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '240,240,240'
    
    const [bgR, bgG, bgB] = mostCommonBgColor.split(',').map(Number)
    const backgroundColor = `#${bgR.toString(16).padStart(2, '0')}${bgG.toString(16).padStart(2, '0')}${bgB.toString(16).padStart(2, '0')}`

    // Get top colors
    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => {
        const [r, g, b] = color.split(',').map(Number)
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      })

    return {
      colors: sortedColors.length > 0 ? sortedColors : ['#F5F5F5'],
      backgroundColor
    }
  } catch (error) {
    console.error('Color extraction failed:', error)
    return { colors: ['#F5F5F5'], backgroundColor: '#F5F5F5' }
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

  // Extract colors and background from first screenshot
  let dominantColors: string[] = []
  let detectedBackground: string = '#F5F5F5'

  if (screenshots.length > 0) {
    try {
      const extracted = await extractColorsFromScreenshot(screenshots[0])
      dominantColors = extracted.colors
      detectedBackground = extracted.backgroundColor
    } catch (e) {
      console.error('Color extraction failed:', e)
    }
  }

  // Use the detected background as primary
  const bgHex = detectedBackground.replace('#', '')
  const bgR = parseInt(bgHex.substr(0, 2), 16)
  const bgG = parseInt(bgHex.substr(2, 2), 16)
  const bgB = parseInt(bgHex.substr(4, 2), 16)
  const bgBrightness = (bgR + bgG + bgB) / 3
  
  // Determine text color based on background
  const textColor = bgBrightness > 128 ? '#1A1A1A' : '#FFFFFF'

  // Generate background variations from the detected background
  const backgroundVariations = [
    detectedBackground, // Use detected background first!
    ...generateComplementaryColors(dominantColors)
  ].slice(0, 6)
  
  // Detect fonts based purely on visual characteristics
  const detectedFonts = detectFontsFromVisuals(dominantColors, bgBrightness)
  
  return {
    ...aiAnalysis,
    dominantColors,
    suggestedBackgrounds: backgroundVariations,
    detectedFonts,
    textColor
  }
}

/**
 * Detect appropriate fonts based ONLY on visual characteristics of the screenshot
 * No keyword matching - just colors and style
 */
function detectFontsFromVisuals(colors: string[], backgroundBrightness: number): string[] {
  if (colors.length === 0) {
    return ['Inter', 'SF Pro Display', 'Roboto']
  }
  
  // Analyze color saturation and variety
  let totalSaturation = 0
  let colorVariety = 0
  
  colors.forEach(color => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    
    totalSaturation += saturation
    if (saturation > 0.3) colorVariety++
  })
  
  const avgSaturation = totalSaturation / colors.length
  const isColorful = avgSaturation > 0.3 && colorVariety >= 2
  const isDark = backgroundBrightness < 128
  const isVeryDark = backgroundBrightness < 80
  const isVeryLight = backgroundBrightness > 200
  
  // Modern, colorful, energetic apps
  if (isColorful && !isDark) {
    return ['Poppins', 'Montserrat', 'Nunito']
  }
  
  // Modern, colorful, dark apps
  if (isColorful && isDark) {
    return ['Space Grotesk', 'Outfit', 'Plus Jakarta Sans']
  }
  
  // Minimal, dark, professional apps
  if (isVeryDark && !isColorful) {
    return ['IBM Plex Sans', 'Inter', 'Roboto']
  }
  
  // Minimal, light, clean apps  
  if (isVeryLight && !isColorful) {
    return ['Inter', 'SF Pro Display', 'Lato']
  }
  
  // Moderate saturation - balanced, modern
  if (avgSaturation > 0.15 && avgSaturation < 0.35) {
    return ['Work Sans', 'DM Sans', 'Rubik']
  }
  
  // Default: Universal, readable fonts
  return ['Inter', 'SF Pro Display', 'Roboto']
}
