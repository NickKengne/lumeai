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
 * Screen asset layout for positioning elements
 */
export interface ScreenAssetLayout {
  backgroundColor: string
  screenshotPosition: {
    x: number
    y: number
    width: number
    height: number
  }
  headline: string
  headlinePosition: {
    x: number
    y: number
  }
  subtitle?: string
  subtitlePosition?: {
    x: number
    y: number
  }
  logoPosition?: {
    x: number
    y: number
    width: number
    height: number
  }
  textColor: string
  fontFamily?: string
  fontSize?: {
    headline: number
    subtitle: number
  }
  additionalAssets?: Array<{
    position: {
      x: number
      y: number
      width: number
      height: number
    }
  }>
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
   - What font family/style does this app use? (e.g., "San Francisco", "Roboto", "Inter", "Custom Sans-serif", "Rounded", "Geometric")
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
    "primaryFont": "Font name or style",
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
      typography: analysis.typography,
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

/**
 * Generate layout for a screenshot using AI
 */
export async function generateLayoutForScreenshot(
  screenshot: string,
  userPrompt: string,
  logo?: string,
  index: number = 0
): Promise<ScreenAssetLayout | null> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) {
    console.warn('Gemini API key not found, using fallback layout')
    return generateFallbackLayout(index)
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
          temperature: 0.7,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })

      // Remove data URL prefix to get base64
      const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '')

      const prompt = `Analyze this mobile app screenshot and create an App Store screenshot layout.

User's app description: "${userPrompt}"

Based on the screenshot and description, generate a layout for an App Store preview image (1242x2688px).

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanations.

Provide:
1. A compelling headline (3-6 words) that highlights the key feature shown in this screenshot
2. An optional subtitle (if needed for clarity)
3. Positioning for the screenshot mockup (should be centered or slightly offset)
4. Text positioning that doesn't overlap with the screenshot
5. A background color that complements the app's design
6. Text color with good contrast
7. Font sizes appropriate for App Store screenshots

Canvas size: 1242x2688px
Screenshot mockup should be: ~500px wide, ~1080px tall

Return as JSON:
{
  "backgroundColor": "#hexcolor",
  "screenshotPosition": {
    "x": number,
    "y": number,
    "width": 500,
    "height": 1080
  },
  "headline": "Feature Headline",
  "headlinePosition": {
    "x": number,
    "y": number
  },
  "subtitle": "Optional subtitle",
  "subtitlePosition": {
    "x": number,
    "y": number
  },
  "textColor": "#hexcolor",
  "fontFamily": "Inter",
  "fontSize": {
    "headline": 72,
    "subtitle": 36
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
      const layout = JSON.parse(cleanText)

      // Validate and normalize the response
      return {
        backgroundColor: layout.backgroundColor || '#F0F4FF',
        screenshotPosition: layout.screenshotPosition || {
          x: 371,
          y: 900,
          width: 500,
          height: 1080
        },
        headline: layout.headline || `Feature ${index + 1}`,
        headlinePosition: layout.headlinePosition || {
          x: 621,
          y: 400
        },
        subtitle: layout.subtitle,
        subtitlePosition: layout.subtitlePosition,
        logoPosition: logo ? (layout.logoPosition || {
          x: 80,
          y: 120,
          width: 100,
          height: 100
        }) : undefined,
        textColor: layout.textColor || '#1A1A1A',
        fontFamily: layout.fontFamily || 'Inter',
        fontSize: layout.fontSize || {
          headline: 72,
          subtitle: 36
        }
      }
    }, 3, 2000) // 3 retries, starting with 2 second delay
  } catch (error: any) {
    // Log specific error types
    if (error?.message?.includes('429') || error?.status === 429) {
      console.error('⚠️ Rate limit exceeded for Gemini API. Using fallback layout.')
    } else {
      console.error('AI layout generation error:', error)
    }
    return generateFallbackLayout(index)
  }
}

/**
 * Generate a fallback layout when AI is unavailable
 */
function generateFallbackLayout(index: number): ScreenAssetLayout {
  const backgrounds = ['#F0F4FF', '#FFF0F5', '#F0FFF4', '#FFFBEB', '#FEF2F2', '#F0FDFA']
  
  return {
    backgroundColor: backgrounds[index % backgrounds.length],
    screenshotPosition: {
      x: 371,
      y: 900,
      width: 500,
      height: 1080
    },
    headline: `Feature ${index + 1}`,
    headlinePosition: {
      x: 621,
      y: 400
    },
    subtitle: 'Discover amazing features',
    subtitlePosition: {
      x: 621,
      y: 500
    },
    textColor: '#1A1A1A',
    fontFamily: 'Inter',
    fontSize: {
      headline: 72,
      subtitle: 36
    }
  }
}

