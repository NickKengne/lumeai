/**
 * Screenshot Analysis Functions
 * Extracts colors, fonts, typography, and design characteristics from uploaded screenshots
 * Uses AI vision for accurate analysis
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Enhanced screenshot analysis result with fonts and typography
 */
export interface ScreenshotAnalysisResult {
  dominantColors: string[]
  suggestedBackgrounds: string[]
  mood: 'vibrant' | 'calm' | 'professional' | 'playful' | 'minimal'
  suggestedTemplates: string[]
  // Enhanced font and typography analysis
  typography?: {
    primaryFont?: string
    secondaryFont?: string
    fontStyle?: 'modern' | 'classic' | 'playful' | 'minimal' | 'bold'
    headlineSize?: 'large' | 'medium' | 'small'
    textHierarchy?: string
  }
  // Enhanced design characteristics
  designStyle?: {
    layout?: 'centered' | 'left-aligned' | 'asymmetric' | 'grid'
    spacing?: 'tight' | 'comfortable' | 'spacious'
    cornerRadius?: 'sharp' | 'rounded' | 'very-rounded'
    shadows?: 'none' | 'subtle' | 'prominent'
  }
}

/**
 * Extract dominant colors from an image using Canvas API (fallback method)
 */
export async function extractColorsFromScreenshot(imageDataUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(['#F0F4FF', '#E0EAFF', '#D0E0FF']) // fallback
        return
      }

      // Scale down for faster processing
      const scaledWidth = 100
      const scaledHeight = Math.floor(img.height * (scaledWidth / img.width))
      canvas.width = scaledWidth
      canvas.height = scaledHeight

      // Draw image
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight)

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight)
      const pixels = imageData.data

      // Count color frequencies (exclude backgrounds)
      const colorMap: { [key: string]: number } = {}
      
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]

        // Skip transparent pixels
        if (a < 128) continue
        
        // Skip very light colors (likely background)
        if (r > 245 && g > 245 && b > 245) continue
        
        // Skip very dark colors (likely text)
        if (r < 20 && g < 20 && b < 20) continue

        // Round to reduce color variations
        const roundedR = Math.round(r / 15) * 15
        const roundedG = Math.round(g / 15) * 15
        const roundedB = Math.round(b / 15) * 15

        const colorKey = `${roundedR},${roundedG},${roundedB}`
        colorMap[colorKey] = (colorMap[colorKey] || 0) + 1
      }

      // Sort by frequency
      const sortedColors = Object.entries(colorMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8) // Top 8 colors

      // Convert to hex
      const hexColors = sortedColors.map(([rgb]) => {
        const [r, g, b] = rgb.split(',').map(Number)
        return rgbToHex(r, g, b)
      })

      resolve(hexColors.length > 0 ? hexColors : ['#F0F4FF', '#E0EAFF', '#D0E0FF'])
    }

    img.onerror = () => {
      resolve(['#F0F4FF', '#E0EAFF', '#D0E0FF']) // fallback
    }

    img.src = imageDataUrl
  })
}

/**
 * Convert RGB to Hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Analyze screenshots using AI Vision for comprehensive analysis
 */
export async function analyzeScreenshots(screenshots: string[]): Promise<ScreenshotAnalysisResult> {
  if (screenshots.length === 0) {
    return {
      dominantColors: ['#F0F4FF'],
      suggestedBackgrounds: ['#F0F4FF', '#FFF0F5', '#F0FFF4'],
      mood: 'minimal',
      suggestedTemplates: ['minimal', 'centered_bold', 'gradient']
    }
  }

  try {
    // Try AI-powered analysis first
    const aiAnalysis = await analyzeScreenshotWithAI(screenshots[0])
    if (aiAnalysis) {
      return aiAnalysis
    }
  } catch (error) {
    console.error('AI analysis failed, falling back to basic analysis:', error)
  }

  // Fallback to basic color extraction
  const colors = await extractColorsFromScreenshot(screenshots[0])
  const mood = determineMood(colors)
  const backgrounds = generateBackgroundSuggestions(colors, mood)
  const templates = suggestTemplatesForMood(mood)

  return {
    dominantColors: colors,
    suggestedBackgrounds: backgrounds,
    mood,
    suggestedTemplates: templates
  }
}

/**
 * Rate limiter to prevent hitting API limits
 */
let lastAPICall = 0
const MIN_API_INTERVAL = 2000 // 2 seconds between calls

async function waitForRateLimit() {
  const now = Date.now()
  const timeSinceLastCall = now - lastAPICall
  if (timeSinceLastCall < MIN_API_INTERVAL) {
    const waitTime = MIN_API_INTERVAL - timeSinceLastCall
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  lastAPICall = Date.now()
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      const isRateLimitError = error?.message?.includes('429') || error?.status === 429
      const isLastAttempt = i === maxRetries - 1
      
      if (isRateLimitError && !isLastAttempt) {
        const delay = initialDelay * Math.pow(2, i)
        console.log(`Rate limit hit, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}

/**
 * Convert AI-detected font names to CSS font-family strings
 */
function convertFontNameToCSSFontFamily(fontName: string): string {
  const fontMap: { [key: string]: string } = {
    // iOS/Apple fonts
    'san francisco': '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif',
    'sf pro': '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif',
    'sf': '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif',
    'helvetica': '"Helvetica Neue", Helvetica, Arial, sans-serif',
    'helvetica neue': '"Helvetica Neue", Helvetica, Arial, sans-serif',
    
    // Android fonts
    'roboto': '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
    'google sans': '"Google Sans", "Roboto", sans-serif',
    'product sans': '"Product Sans", "Roboto", sans-serif',
    
    // Popular web fonts
    'inter': '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    'poppins': '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
    'montserrat': '"Montserrat", -apple-system, BlinkMacSystemFont, sans-serif',
    'open sans': '"Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    'lato': '"Lato", -apple-system, BlinkMacSystemFont, sans-serif',
    'raleway': '"Raleway", -apple-system, BlinkMacSystemFont, sans-serif',
    'nunito': '"Nunito", -apple-system, BlinkMacSystemFont, sans-serif',
    'work sans': '"Work Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    'dm sans': '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    'plus jakarta sans': '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    'space grotesk': '"Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif',
    'manrope': '"Manrope", -apple-system, BlinkMacSystemFont, sans-serif',
    
    // Style-based fonts
    'rounded': '"Nunito", "Quicksand", -apple-system, BlinkMacSystemFont, sans-serif',
    'geometric': '"Montserrat", "Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
    'modern': '"Inter", "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    'elegant': '"Playfair Display", "Merriweather", Georgia, serif',
    'classic': '"Georgia", "Times New Roman", serif',
    'playful': '"Quicksand", "Nunito", -apple-system, BlinkMacSystemFont, sans-serif',
    'minimal': '"Inter", "Helvetica Neue", -apple-system, BlinkMacSystemFont, sans-serif',
    'bold': '"Montserrat", "Oswald", -apple-system, BlinkMacSystemFont, sans-serif',
    
    // Generic fallbacks
    'sans-serif': '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    'serif': 'Georgia, "Times New Roman", Times, serif',
    'monospace': '"Courier New", Courier, monospace',
  }
  
  const lowerFont = fontName.toLowerCase().trim()
  
  // Check for exact matches
  if (fontMap[lowerFont]) {
    return fontMap[lowerFont]
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(fontMap)) {
    if (lowerFont.includes(key) || key.includes(lowerFont)) {
      return value
    }
  }
  
  // If no match found, return the original with fallbacks
  return `"${fontName}", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
}

/**
 * Analyze screenshot using Google Gemini Vision API
 * Detects fonts, colors, typography, and design characteristics
 * Includes rate limiting and retry logic
 */
async function analyzeScreenshotWithAI(screenshotDataUrl: string): Promise<ScreenshotAnalysisResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) {
    console.warn('Gemini API key not found, falling back to basic analysis')
    return null
  }

  try {
    // Wait for rate limit
    await waitForRateLimit()

    // Wrap API call with retry logic
    return await retryWithBackoff(async () => {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })

      // Remove data URL prefix to get base64
      const base64Data = screenshotDataUrl.replace(/^data:image\/\w+;base64,/, '')

      const prompt = `Analyze this mobile app screenshot in detail and provide a comprehensive design analysis.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanations.

Extract and identify:
1. **Typography & Fonts**:
   - What font family/style does this app use? Be SPECIFIC. Examples: "San Francisco", "SF Pro", "Roboto", "Inter", "Poppins", "Montserrat", "Rounded", "Geometric"
   - If you can't identify the exact font, describe its characteristics: "Modern Sans-serif", "Rounded Sans-serif", "Geometric Sans-serif", "Classic Serif"
   - Font characteristics: modern, classic, playful, minimal, bold, elegant
   - Headline/title sizes: large, medium, small
   - Text hierarchy: clear, subtle, minimal

2. **Color Palette** (CRITICAL - Be precise):
   - Dominant UI colors (buttons, accents, important elements) - provide HEX codes
   - Background colors used in the app - provide HEX codes
   - Text colors - provide HEX codes
   - Accent/highlight colors - provide HEX codes
   - List 5-8 most prominent colors as HEX codes (e.g., #FF6B6B)

3. **Design Style**:
   - Layout: centered, left-aligned, asymmetric, grid
   - Spacing: tight, comfortable, spacious
   - Corner radius: sharp, rounded, very-rounded
   - Shadows: none, subtle, prominent
   - Overall mood: vibrant, calm, professional, playful, minimal

4. **Background Suggestions**:
   - Based on the app's color palette, suggest 4-5 background colors (HEX) that would complement this app for App Store screenshots
   - These should be lighter, softer versions of the dominant colors or complementary colors

Return as JSON:
{
  "dominantColors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "suggestedBackgrounds": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "mood": "vibrant|calm|professional|playful|minimal",
  "typography": {
    "primaryFont": "Specific font name (e.g. 'SF Pro', 'Roboto', 'Inter')",
    "secondaryFont": "Font name or style",
    "fontStyle": "modern|classic|playful|minimal|bold",
    "headlineSize": "large|medium|small",
    "textHierarchy": "description"
  },
  "designStyle": {
    "layout": "centered|left-aligned|asymmetric|grid",
    "spacing": "tight|comfortable|spacious",
    "cornerRadius": "sharp|rounded|very-rounded",
    "shadows": "none|subtle|prominent"
  }
}`

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/png'
        }
      },
      prompt
    ])

    const response = await result.response
    const text = response.text()
    
    // Parse JSON response
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const analysis = JSON.parse(cleanText)

    // Convert detected font to CSS font-family
    let convertedFont: string | undefined = undefined
    if (analysis.typography?.primaryFont) {
      convertedFont = convertFontNameToCSSFontFamily(analysis.typography.primaryFont)
      console.log(`🔤 Detected font: "${analysis.typography.primaryFont}" → CSS: "${convertedFont}"`)
    }

    // Validate and normalize the response
    const normalized: ScreenshotAnalysisResult = {
      dominantColors: Array.isArray(analysis.dominantColors) 
        ? analysis.dominantColors.filter((c: string) => c.startsWith('#'))
        : ['#F0F4FF', '#E0EAFF', '#D0E0FF'],
      suggestedBackgrounds: Array.isArray(analysis.suggestedBackgrounds)
        ? analysis.suggestedBackgrounds.filter((c: string) => c.startsWith('#'))
        : ['#F0F4FF', '#FFF0F5', '#F0FFF4'],
      mood: ['vibrant', 'calm', 'professional', 'playful', 'minimal'].includes(analysis.mood)
        ? analysis.mood
        : 'minimal',
      suggestedTemplates: suggestTemplatesForMood(analysis.mood || 'minimal'),
      typography: {
        ...analysis.typography,
        primaryFont: convertedFont || analysis.typography?.primaryFont
      },
      designStyle: analysis.designStyle
    }

    // Fallback to color extraction if AI didn't provide enough colors
    if (normalized.dominantColors.length < 3) {
      const fallbackColors = await extractColorsFromScreenshot(screenshotDataUrl)
      normalized.dominantColors = [...normalized.dominantColors, ...fallbackColors].slice(0, 8)
    }

    if (normalized.suggestedBackgrounds.length < 3) {
      const fallbackBgs = generateBackgroundSuggestions(normalized.dominantColors, normalized.mood)
      normalized.suggestedBackgrounds = [...normalized.suggestedBackgrounds, ...fallbackBgs].slice(0, 5)
    }

      return normalized
    }, 3, 2000) // 3 retries, starting with 2 second delay
  } catch (error: any) {
    // Log specific error types
    if (error?.message?.includes('429') || error?.status === 429) {
      console.error('⚠️ Rate limit exceeded for Gemini API. Using fallback analysis.')
      console.error('💡 Tip: Wait a few minutes before analyzing more screenshots, or upgrade your API plan.')
    } else {
      console.error('AI screenshot analysis error:', error)
    }
    return null
  }
}

/**
 * Determine mood from color palette
 */
function determineMood(colors: string[]): 'vibrant' | 'calm' | 'professional' | 'playful' | 'minimal' {
  if (colors.length === 0) return 'minimal'

  const firstColor = hexToRgb(colors[0])
  if (!firstColor) return 'minimal'

  const { r, g, b } = firstColor
  const brightness = (r + g + b) / 3
  const saturation = Math.max(r, g, b) - Math.min(r, g, b)

  // High saturation = vibrant or playful
  if (saturation > 100) {
    return brightness > 150 ? 'playful' : 'vibrant'
  }

  // Low saturation
  if (saturation < 30) {
    return brightness > 200 ? 'minimal' : 'professional'
  }

  // Medium saturation
  return brightness > 180 ? 'calm' : 'professional'
}

/**
 * Convert Hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Generate background suggestions based on extracted colors
 */
function generateBackgroundSuggestions(colors: string[], mood: string): string[] {
  if (colors.length === 0) {
    return ['#F0F4FF', '#FFF0F5', '#F0FFF4']
  }

  const suggestions: string[] = []

  // Lighten the dominant color for background
  const dominantColor = colors[0]
  const lightened = lightenColor(dominantColor, 80)
  suggestions.push(lightened)

  // Complementary light colors based on mood
  switch (mood) {
    case 'vibrant':
      suggestions.push('#FFF5F7', '#FFF9E6', '#F0F9FF')
      break
    case 'calm':
      suggestions.push('#F0F4FF', '#F0FFF4', '#FFF9F0')
      break
    case 'professional':
      suggestions.push('#F5F7FA', '#F8F9FA', '#E8EAF6')
      break
    case 'playful':
      suggestions.push('#FFF0F5', '#FFF9E6', '#F0FDFA')
      break
    case 'minimal':
      suggestions.push('#FFFFFF', '#FAFAFA', '#F5F5F5')
      break
    default:
      suggestions.push('#F0F4FF', '#FFF0F5', '#F0FFF4')
  }

  return suggestions.slice(0, 4) // Return top 4
}

/**
 * Lighten a hex color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const increase = percent / 100
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * increase))
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * increase))
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * increase))

  return rgbToHex(r, g, b)
}

/**
 * Get suggested template based on screenshot analysis
 */
export function suggestTemplatesForMood(mood: string): string[] {
  switch (mood) {
    case 'vibrant':
      return ['offset_left', 'offset_right', 'tilted']
    case 'calm':
      return ['minimal', 'centered_bold', 'gradient']
    case 'professional':
      return ['centered_bold', 'minimal', 'gradient']
    case 'playful':
      return ['tilted', 'offset_left', 'offset_right']
    case 'minimal':
      return ['minimal', 'centered_bold', 'gradient']
    default:
      return ['centered_bold', 'offset_left', 'minimal']
  }
}

