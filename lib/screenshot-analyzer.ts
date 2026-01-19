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

// Analyze screenshots for VISUAL data only (colors, backgrounds)
// NO titles/subtitles - those come from prompt analysis
export async function analyzeScreenshotsVisuals(
  screenshots: string[]
): Promise<{
  suggestedBackgrounds: string[]
  textColor: string
  fontFamily: string
}> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY

    if (!apiKey) {
      console.log('No API key, using fallback')
      return generateFallbackVisuals()
    }

    const prompt = `You are a visual design expert analyzing app screenshots to extract styling information.

Analyze the VISUAL characteristics and suggest:
1. Background color scheme (5 colors that complement the screenshot's visual style)
2. Text color with good contrast
3. Font family that matches the visual aesthetic

Consider:
- Color saturation and brightness
- Whether the design is minimal, bold, playful, or professional
- Dark vs light themes
- Modern vs traditional aesthetics
- Energy level (calm vs energetic)

Available fonts to choose from:
- Modern & Clean: Inter, SF Pro Display, Roboto, Lato
- Bold & Energetic: Poppins, Montserrat, Nunito, Work Sans
- Tech & Professional: IBM Plex Sans, Manrope, Space Grotesk, Plus Jakarta Sans
- Elegant & Refined: DM Sans, Rubik, Outfit, Lexend

Return ONLY valid JSON:
{
  "backgrounds": ["#F5F5F5", "#FFFFFF", "#FAFAFA", "#F8F8F8", "#FCFCFC"],
  "textColor": "#1A1A1A",
  "fontFamily": "Inter"
}

Analyze based purely on visual characteristics - ignore any text content in the screenshots.`

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
            content: 'You are a visual design expert. Return only JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status)
      return generateFallbackVisuals()
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return generateFallbackVisuals()
    }

    const result = JSON.parse(content)

    return {
      suggestedBackgrounds: result.backgrounds || ['#F5F5F5', '#FFFFFF', '#FAFAFA', '#F8F8F8', '#FCFCFC'],
      textColor: result.textColor || '#1A1A1A',
      fontFamily: result.fontFamily || 'Inter'
    }
  } catch (error) {
    console.error('Visual analysis failed:', error)
    return generateFallbackVisuals()
  }
}

// Simple fallback for visual data when AI is not available
function generateFallbackVisuals(): {
  suggestedBackgrounds: string[]
  textColor: string
  fontFamily: string
} {
  return {
    suggestedBackgrounds: ['#F5F5F5', '#FFFFFF', '#FAFAFA', '#F8F8F8', '#FCFCFC'],
    textColor: '#1A1A1A',
    fontFamily: 'Inter'
  }
}

/**
 * Main function: Analyze screenshots for VISUAL data only
 * NO titles/subtitles - those come from prompt analysis
 */
export async function analyzeScreenshots(
  screenshots: string[]
): Promise<{
  dominantColors: string[]
  suggestedBackgrounds: string[]
  detectedFonts: string[]
  textColor: string
  mockupVariants: Array<'white' | 'black'>
}> {
  // Get visual styling suggestions from AI
  const visualData = await analyzeScreenshotsVisuals(screenshots)

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
    detectedBackground,
    ...visualData.suggestedBackgrounds,
    ...generateComplementaryColors(dominantColors)
  ].slice(0, 6)
  
  // Detect fonts based purely on visual characteristics
  const detectedFonts = [visualData.fontFamily, ...detectFontsFromVisuals(dominantColors, bgBrightness)].slice(0, 3)
  
  return {
    dominantColors,
    suggestedBackgrounds: backgroundVariations,
    detectedFonts,
    textColor: visualData.textColor,
    mockupVariants
  }
}

/**
 * Simple fallback fonts when AI analysis is complete
 * AI now decides fonts in analyzeScreenshotsVisuals()
 */
function detectFontsFromVisuals(colors: string[], backgroundBrightness: number): string[] {
  // This is now just a fallback - AI decides fonts in the main function
  return ['Inter', 'SF Pro Display', 'Roboto']
}
