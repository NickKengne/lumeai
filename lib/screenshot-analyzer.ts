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

Available templates:
- layout1: Left-aligned text with alternating mockup positions (top/bottom) - creates dynamic variety
- layout2: Center-aligned text with centered mockup (consistent across all screens) - creates elegant consistency

LAYOUT SELECTION: Choose randomly between layout1 and layout2. Both work for any type of app. Don't overthink it.

Based on the app description, provide:
1. Template ID (either "layout1" or "layout2") - CHOOSE RANDOMLY, don't base it on app category
2. Why this template works (one sentence)
3. SEO-optimized headline for each screenshot (EXACTLY 2 WORDS - extract directly from user's app features)
4. Subtitle for each (8-12 words explaining the specific benefit)
5. Suggested background color scheme (5 hex colors)

CRITICAL - SEO & APP STORE OPTIMIZATION:
- Headlines MUST be EXACTLY 2 words (e.g., "Smart Budgeting", "Instant Sync", "Auto Savings")
- Extract features DIRECTLY from the user's description - don't invent features
- Use App Store search keywords that users actually search for
- Each headline should represent a DIFFERENT feature they described
- Subtitles must explain the specific value of that feature

Respond in JSON format (2-WORD HEADLINES ONLY):
{
  "templateId": "layout1",
  "reasoning": "Alternating layout creates visual interest",
  "headlines": ["Instant Transfers", "Smart Budgeting", "Auto Savings", "Bill Splitting", "Zero Fees"],
  "subtitles": ["Send money to friends in seconds with no delays", "AI categorizes every expense and reveals spending patterns", "Automated transfers help you reach your financial goals faster", "Share expenses with your group and settle up instantly", "Never pay hidden charges or monthly subscription fees"],
  "backgrounds": ["#F5F5F5", "#FFFFFF", "#FAFAFA", "#F8F8F8", "#FCFCFC"],
  "textColor": "#1A1A1A",
  "fontFamily": "Inter"
}

EXAMPLE - User says: "fitness app with AI workout plans and progress tracking"
CORRECT: {"headlines": ["AI Workouts", "Progress Tracking", "Custom Plans", "Form Coaching", "Smart Goals"], ...}
WRONG: {"headlines": ["Get fit with AI", "Track your progress easily"], ...} ← TOO MANY WORDS`

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
      suggestedTemplateId: result.templateId || 'layout1',
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

/**
 * Extract 2-word SEO-optimized titles from user input
 */
function extract2WordTitlesFromUserInput(userInput: string): string[] {
  const input = userInput.toLowerCase()
  const titles: string[] = []
  
  // Common feature keywords to look for
  const featureKeywords = ['track', 'manage', 'monitor', 'budget', 'save', 'split', 'share', 'sync', 'transfer', 'send', 'workout', 'exercise', 'train', 'meditate', 'sleep', 'chat', 'message', 'connect', 'schedule', 'plan', 'organize', 'automate', 'analyze', 'compare', 'optimize']
  
  const nounKeywords = ['expense', 'transaction', 'bill', 'saving', 'payment', 'budget', 'account', 'balance', 'notification', 'alert', 'calendar', 'task', 'habit', 'goal', 'workout', 'meal', 'calorie', 'sleep', 'meditation', 'wellness', 'health', 'progress', 'friend', 'group', 'chat', 'message', 'profile']
  
  const modifiers = ['smart', 'instant', 'quick', 'fast', 'easy', 'auto', 'real-time', 'ai', 'advanced', 'premium', 'secure']
  
  // Extract words from user input
  const words = input.split(/\s+/).filter(w => w.length > 2)
  
  // Try to find feature + noun combinations
  for (let i = 0; i < words.length - 1 && titles.length < 5; i++) {
    const word1 = words[i]
    const word2 = words[i + 1]
    
    // Check for feature verb + noun
    if (featureKeywords.includes(word1) && word2.length > 3) {
      const title = `${word1.charAt(0).toUpperCase() + word1.slice(1)} ${word2.charAt(0).toUpperCase() + word2.slice(1)}`
      if (!titles.includes(title)) {
        titles.push(title)
      }
    }
    
    // Check for modifier + noun
    if (modifiers.includes(word1) && nounKeywords.includes(word2)) {
      const title = `${word1.charAt(0).toUpperCase() + word1.slice(1)} ${word2.charAt(0).toUpperCase() + word2.slice(1)}`
      if (!titles.includes(title)) {
        titles.push(title)
      }
    }
  }
  
  // Fill remaining with smart combinations
  const remainingNouns = nounKeywords.filter(n => input.includes(n))
  const remainingModifiers = ['Smart', 'Quick', 'Easy', 'Auto', 'Instant']
  
  for (const noun of remainingNouns) {
    if (titles.length >= 5) break
    const modifier = remainingModifiers[titles.length % remainingModifiers.length]
    const title = `${modifier} ${noun.charAt(0).toUpperCase() + noun.slice(1)}`
    if (!titles.includes(title)) {
      titles.push(title)
    }
  }
  
  // Ultimate fallback
  const fallbacks = ['Smart Features', 'Quick Access', 'Easy Setup', 'Auto Sync', 'Premium Tools']
  while (titles.length < 5) {
    const fallback = fallbacks[titles.length]
    if (!titles.includes(fallback)) {
      titles.push(fallback)
    }
  }
  
  return titles.slice(0, 5)
}

/**
 * Generate subtitle from title and context
 */
function generateSubtitleForTitle(title: string, userInput: string): string {
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('track') || titleLower.includes('monitor')) {
    return 'Stay on top of everything with automatic tracking and insights'
  } else if (titleLower.includes('smart') || titleLower.includes('ai')) {
    return 'AI-powered features that adapt to your specific needs'
  } else if (titleLower.includes('instant') || titleLower.includes('quick') || titleLower.includes('fast')) {
    return 'Get things done in seconds with lightning-fast performance'
  } else if (titleLower.includes('auto') || titleLower.includes('automat')) {
    return 'Automated processes save you time and reduce effort'
  } else if (titleLower.includes('save') || titleLower.includes('saving')) {
    return 'Reach your financial goals with intelligent saving features'
  } else if (titleLower.includes('sync')) {
    return 'Everything synced seamlessly across all your devices'
  } else if (titleLower.includes('split') || titleLower.includes('share')) {
    return 'Share and split expenses with friends instantly'
  } else if (titleLower.includes('workout') || titleLower.includes('exercise') || titleLower.includes('train')) {
    return 'Personalized training designed for your fitness level'
  } else if (titleLower.includes('budget') || titleLower.includes('expense')) {
    return 'Take control of your spending with smart insights'
  } else if (titleLower.includes('chat') || titleLower.includes('message') || titleLower.includes('connect')) {
    return 'Connect and communicate with your community easily'
  } else if (titleLower.includes('sleep') || titleLower.includes('meditat')) {
    return 'Guided sessions help you relax and unwind naturally'
  } else if (titleLower.includes('progress') || titleLower.includes('goal')) {
    return 'Track your achievements and celebrate every milestone'
  } else {
    return 'Powerful features designed to help you succeed'
  }
}

// Fallback analysis when AI is not available - DYNAMIC based on user input
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

  // RANDOM layout selection - not based on category
  const templateId = Math.random() > 0.5 ? 'layout1' : 'layout2'
  const reasoning = templateId === 'layout1' 
    ? 'Alternating layout creates dynamic visual variety'
    : 'Centered layout provides elegant consistency'
  
  // Determine background colors based on app category
  let backgrounds = ['#F5F5F5', '#FFFFFF', '#FAFAFA', '#F8F8F8', '#FCFCFC']
  
  if (prompt.includes('finance') || prompt.includes('money') || prompt.includes('bank') || prompt.includes('budget')) {
    backgrounds = ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA']
  } else if (prompt.includes('fitness') || prompt.includes('health') || prompt.includes('workout') || prompt.includes('exercise')) {
    backgrounds = ['#FFEDD5', '#FED7AA', '#FDBA74', '#FB923C', '#F97316']
  } else if (prompt.includes('meditation') || prompt.includes('wellness') || prompt.includes('mindful') || prompt.includes('calm') || prompt.includes('sleep')) {
    backgrounds = ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA']
  } else if (prompt.includes('social') || prompt.includes('dating') || prompt.includes('chat') || prompt.includes('connect')) {
    backgrounds = ['#FCE7F3', '#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899']
  } else if (prompt.includes('premium') || prompt.includes('luxury') || prompt.includes('elegant') || prompt.includes('exclusive')) {
    backgrounds = ['#1A1A1A', '#2D2D2D', '#3A3A3A', '#000000', '#252525']
  }
  
  // DYNAMIC: Extract 2-word titles from user input
  const headlines = extract2WordTitlesFromUserInput(userPrompt)
  
  // Generate subtitles for each title
  const subtitles = headlines.map(title => generateSubtitleForTitle(title, userPrompt))

  return {
    suggestedTemplateId: templateId,
    templateReasoning: reasoning,
    screenHeadlines: headlines,
    screenSubtitles: subtitles,
    suggestedBackgrounds: backgrounds
  }
}

/**
 * Combined analysis: extract colors + AI suggestions + font detection
 */
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
  mockupVariants: Array<'white' | 'black'> // One for each screenshot
}> {
  // Get AI suggestions
  const aiAnalysis = await analyzeScreenshotsWithAI(screenshots, userPrompt)

  // Extract colors and background from ALL screenshots
  let dominantColors: string[] = []
  let detectedBackground: string = '#F5F5F5'
  const mockupVariants: Array<'white' | 'black'> = []

  // Analyze each screenshot for mockup variant
  for (const screenshot of screenshots) {
    try {
      const extracted = await extractColorsFromScreenshot(screenshot)
      
      // For first screenshot, use for dominant colors
      if (mockupVariants.length === 0) {
      dominantColors = extracted.colors
      detectedBackground = extracted.backgroundColor
      }
      
      // Determine mockup variant based on background brightness
      const bgHex = extracted.backgroundColor.replace('#', '')
      const bgR = parseInt(bgHex.substr(0, 2), 16)
      const bgG = parseInt(bgHex.substr(2, 2), 16)
      const bgB = parseInt(bgHex.substr(4, 2), 16)
      const bgBrightness = (bgR + bgG + bgB) / 3
      
      // If screenshot background is dark (< 128), use WHITE border
      // If screenshot background is light (>= 128), use BLACK border
      const variant = bgBrightness < 128 ? 'white' : 'black'
      mockupVariants.push(variant)
    } catch (e) {
      console.error('Color extraction failed for screenshot:', e)
      // Default to black border if analysis fails
      mockupVariants.push('black')
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
    textColor,
    mockupVariants
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
