/**
 * Screenshot Analysis Functions
 * Extracts colors, mood, and generates backgrounds from uploaded screenshots
 */

/**
 * Extract dominant colors from an image using Canvas API
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
      const scaledWidth = 50
      const scaledHeight = Math.floor(img.height * (scaledWidth / img.width))
      canvas.width = scaledWidth
      canvas.height = scaledHeight

      // Draw image
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight)

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight)
      const pixels = imageData.data

      // Count color frequencies
      const colorMap: { [key: string]: number } = {}
      
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]

        // Skip transparent or near-white/black pixels
        if (a < 128) continue
        if (r > 240 && g > 240 && b > 240) continue
        if (r < 15 && g < 15 && b < 15) continue

        // Round to reduce color variations
        const roundedR = Math.round(r / 20) * 20
        const roundedG = Math.round(g / 20) * 20
        const roundedB = Math.round(b / 20) * 20

        const colorKey = `${roundedR},${roundedG},${roundedB}`
        colorMap[colorKey] = (colorMap[colorKey] || 0) + 1
      }

      // Sort by frequency
      const sortedColors = Object.entries(colorMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5) // Top 5 colors

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
 * Analyze multiple screenshots and get color palette
 */
export async function analyzeScreenshots(screenshots: string[]): Promise<{
  dominantColors: string[]
  suggestedBackgrounds: string[]
  mood: 'vibrant' | 'calm' | 'professional' | 'playful' | 'minimal'
}> {
  if (screenshots.length === 0) {
    return {
      dominantColors: ['#F0F4FF'],
      suggestedBackgrounds: ['#F0F4FF', '#FFF0F5', '#F0FFF4'],
      mood: 'minimal'
    }
  }

  // Extract colors from first screenshot (most representative)
  const colors = await extractColorsFromScreenshot(screenshots[0])
  
  // Determine mood based on colors
  const mood = determineMood(colors)
  
  // Generate suggested backgrounds based on extracted colors
  const backgrounds = generateBackgroundSuggestions(colors, mood)

  return {
    dominantColors: colors,
    suggestedBackgrounds: backgrounds,
    mood
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

