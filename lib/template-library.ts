/**
 * Template Library - Pre-designed App Store Screenshot Layouts
 * 
 * Each template:
 * - Canvas: 375x812 (iPhone 12/13/14 size)
 * - iPhone mockup already positioned
 * - User screenshot gets inserted INTO the mockup
 * - Different mockup positions for variety
 */

export interface TemplateLayer {
  id: string
  type: "background" | "mockup" | "text" | "image" | "decoration"
  content: string
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
  fontFamily?: string
  color?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  align?: "left" | "center" | "right"
  // Mockup specific
  mockupFrame?: {
    x: number // Position where screenshot goes inside mockup
    y: number
    width: number
    height: number
    borderRadius?: number
  }
  // Background specific
  backgroundColor?: string
  backgroundGradient?: {
    type: "linear" | "radial"
    colors: string[]
    angle?: number
  }
}

export interface Template {
  id: string
  name: string
  description: string
  canvasWidth: number
  canvasHeight: number
  layers: TemplateLayer[]
}

/**
 * Template 1: CENTERED - iPhone mockup centered with headline above
 * (Based on frames 1261, 1267)
 */
export function template_centered_bold(
  screenshot: string,
  headline: string,
  subtitle: string,
  bgColor: string = "#F0F4FF",
  logo?: string
): TemplateLayer[] {
  const layers: TemplateLayer[] = [
    // Background
    {
      id: "bg",
      type: "background",
      content: "",
      x: 0,
      y: 0,
      width: 375,
      height: 812,
      backgroundColor: bgColor,
    },
    // Headline at top
    {
      id: "headline",
      type: "text",
      content: headline,
      x: 20,
      y: 60,
      width: 335,
      height: 80,
      fontSize: 32,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#000000",
      bold: true,
      align: "center",
    },
    // iPhone Mockup - CENTERED
    // The mockup frame itself (black border, rounded corners)
    {
      id: "mockup_frame",
      type: "mockup",
      content: screenshot,
      x: 50, // Centered horizontally: (375 - 275) / 2 = 50
      y: 180,
      width: 275,
      height: 550,
      mockupFrame: {
        x: 10, // Padding inside mockup for screenshot
        y: 10,
        width: 255,
        height: 530,
        borderRadius: 30,
      },
    },
    // Subtitle at bottom
    {
      id: "subtitle",
      type: "text",
      content: subtitle,
      x: 30,
      y: 745,
      width: 315,
      height: 50,
      fontSize: 14,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#666666",
      align: "center",
    },
  ]

  // Add logo if provided (top-left corner)
  if (logo) {
    layers.splice(1, 0, {
      id: "logo",
      type: "image",
      content: logo,
      x: 20,
      y: 20,
      width: 50,
      height: 50,
    })
  }

  return layers
}

/**
 * Template 2: OFFSET LEFT - iPhone mockup on left side with text on right
 * (Based on frames 1268, 1269)
 */
export function template_offset_left(
  screenshot: string,
  headline: string,
  subtitle: string,
  bgColor: string = "#FF8C42",
  logo?: string
): TemplateLayer[] {
  return [
    // Background - Solid color
    {
      id: "bg",
      type: "background",
      content: "",
      x: 0,
      y: 0,
      width: 375,
      height: 812,
      backgroundColor: bgColor,
    },
    // Text box at top right
    {
      id: "text_box",
      type: "decoration",
      content: "",
      x: 200,
      y: 80,
      width: 155,
      height: 150,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
    // Headline in text box
    {
      id: "headline",
      type: "text",
      content: headline,
      x: 210,
      y: 100,
      width: 145,
      height: 120,
      fontSize: 18,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#FFFFFF",
      bold: true,
      align: "center",
    },
    // iPhone Mockup - LEFT SIDE
    {
      id: "mockup_frame",
      type: "mockup",
      content: screenshot,
      x: 20, // Offset to left
      y: 220,
      width: 250,
      height: 500,
      mockupFrame: {
        x: 8,
        y: 8,
        width: 234,
        height: 484,
        borderRadius: 28,
      },
    },
    // Subtitle at bottom
    {
      id: "subtitle",
      type: "text",
      content: subtitle,
      x: 20,
      y: 735,
      width: 335,
      height: 60,
      fontSize: 13,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#FFFFFF",
      align: "left",
    },
  ]
}

/**
 * Template 3: OFFSET RIGHT - iPhone mockup on right with text on left
 * (Based on frames 1265, 1270)
 */
export function template_offset_right(
  screenshot: string,
  headline: string,
  subtitle: string,
  bgColor: string = "#10B981",
  logo?: string
): TemplateLayer[] {
  return [
    // Background
    {
      id: "bg",
      type: "background",
      content: "",
      x: 0,
      y: 0,
      width: 375,
      height: 812,
      backgroundColor: bgColor,
    },
    // Text box at top left
    {
      id: "text_box",
      type: "decoration",
      content: "",
      x: 20,
      y: 80,
      width: 155,
      height: 150,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
    // Headline in text box
    {
      id: "headline",
      type: "text",
      content: headline,
      x: 30,
      y: 100,
      width: 135,
      height: 120,
      fontSize: 18,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#FFFFFF",
      bold: true,
      align: "center",
    },
    // iPhone Mockup - RIGHT SIDE
    {
      id: "mockup_frame",
      type: "mockup",
      content: screenshot,
      x: 105, // Offset to right: 375 - 250 - 20 = 105
      y: 220,
      width: 250,
      height: 500,
      mockupFrame: {
        x: 8,
        y: 8,
        width: 234,
        height: 484,
        borderRadius: 28,
      },
    },
    // Subtitle at bottom
    {
      id: "subtitle",
      type: "text",
      content: subtitle,
      x: 20,
      y: 735,
      width: 335,
      height: 60,
      fontSize: 13,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#FFFFFF",
      align: "right",
    },
  ]
}

/**
 * Template 4: GRADIENT - iPhone centered with gradient background
 */
export function template_gradient(
  screenshot: string,
  headline: string,
  subtitle: string,
  bgColor?: string,
  logo?: string
): TemplateLayer[] {
  return [
    // Gradient Background
    {
      id: "bg",
      type: "background",
      content: "",
      x: 0,
      y: 0,
      width: 375,
      height: 812,
      backgroundGradient: {
        type: "linear",
        colors: ["#667eea", "#764ba2"],
        angle: 135,
      },
    },
    // Headline
    {
      id: "headline",
      type: "text",
      content: headline,
      x: 20,
      y: 60,
      width: 335,
      height: 80,
      fontSize: 28,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#FFFFFF",
      bold: true,
      align: "center",
    },
    // iPhone Mockup - CENTERED
    {
      id: "mockup_frame",
      type: "mockup",
      content: screenshot,
      x: 50,
      y: 180,
      width: 275,
      height: 550,
      mockupFrame: {
        x: 10,
        y: 10,
        width: 255,
        height: 530,
        borderRadius: 30,
      },
    },
    // Subtitle
    {
      id: "subtitle",
      type: "text",
      content: subtitle,
      x: 30,
      y: 745,
      width: 315,
      height: 50,
      fontSize: 14,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#FFFFFF",
      align: "center",
    },
  ]
}

/**
 * Template 5: MINIMAL - Clean white background with centered phone
 */
export function template_minimal(
  screenshot: string,
  headline: string,
  subtitle: string,
  bgColor?: string,
  logo?: string
): TemplateLayer[] {
  return [
    // White Background
    {
      id: "bg",
      type: "background",
      content: "",
      x: 0,
      y: 0,
      width: 375,
      height: 812,
      backgroundColor: "#FFFFFF",
    },
    // Headline
    {
      id: "headline",
      type: "text",
      content: headline,
      x: 20,
      y: 70,
      width: 335,
      height: 70,
      fontSize: 26,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#1a1a1a",
      bold: true,
      align: "center",
    },
    // iPhone Mockup - CENTERED
    {
      id: "mockup_frame",
      type: "mockup",
      content: screenshot,
      x: 62.5, // Perfectly centered: (375 - 250) / 2
      y: 180,
      width: 250,
      height: 500,
      mockupFrame: {
        x: 8,
        y: 8,
        width: 234,
        height: 484,
        borderRadius: 28,
      },
    },
    // Subtitle
    {
      id: "subtitle",
      type: "text",
      content: subtitle,
      x: 30,
      y: 700,
      width: 315,
      height: 90,
      fontSize: 14,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#666666",
      align: "center",
    },
  ]
}

/**
 * Template 6: TILTED - iPhone mockup with slight angle (dynamic look)
 */
export function template_tilted(
  screenshot: string,
  headline: string,
  subtitle: string,
  bgColor: string = "#3B82F6",
  logo?: string
): TemplateLayer[] {
  return [
    // Background
    {
      id: "bg",
      type: "background",
      content: "",
      x: 0,
      y: 0,
      width: 375,
      height: 812,
      backgroundColor: bgColor,
    },
    // Headline
    {
      id: "headline",
      type: "text",
      content: headline,
      x: 20,
      y: 80,
      width: 250,
      height: 100,
      fontSize: 28,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#FFFFFF",
      bold: true,
      align: "left",
    },
    // iPhone Mockup - TILTED (slightly rotated)
    // Note: Rotation would need CSS transform, positioned off-center
    {
      id: "mockup_frame",
      type: "mockup",
      content: screenshot,
      x: 80,
      y: 220,
      width: 260,
      height: 520,
      mockupFrame: {
        x: 8,
        y: 8,
        width: 244,
        height: 504,
        borderRadius: 30,
      },
    },
    // Subtitle
    {
      id: "subtitle",
      type: "text",
      content: subtitle,
      x: 20,
      y: 745,
      width: 335,
      height: 50,
      fontSize: 13,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: "#FFFFFF",
      align: "left",
    },
  ]
}

/**
 * Get all available templates
 */
export const AVAILABLE_TEMPLATES = [
  {
    id: "centered_bold",
    name: "Centered Bold",
    description: "Phone centered with bold headline above",
    generator: template_centered_bold,
  },
  {
    id: "offset_left",
    name: "Offset Left",
    description: "Phone on left, text on right",
    generator: template_offset_left,
  },
  {
    id: "offset_right",
    name: "Offset Right",
    description: "Phone on right, text on left",
    generator: template_offset_right,
  },
  {
    id: "gradient",
    name: "Gradient",
    description: "Centered with gradient background",
    generator: template_gradient,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean white background",
    generator: template_minimal,
  },
  {
    id: "tilted",
    name: "Tilted",
    description: "Phone at an angle for dynamic look",
    generator: template_tilted,
  },
]

/**
 * Get template by ID
 */
export function getTemplate(templateId: string) {
  return AVAILABLE_TEMPLATES.find((t) => t.id === templateId)
}

/**
 * Apply template to screenshot with AI-generated content
 */
export function applyTemplate(
  templateId: string,
  screenshot: string,
  headline: string,
  subtitle: string,
  bgColor?: string,
  logo?: string
): TemplateLayer[] {
  const template = getTemplate(templateId)
  if (!template) {
    throw new Error(`Template ${templateId} not found`)
  }

  if (bgColor && logo) {
    return template.generator(screenshot, headline, subtitle, bgColor, logo)
  } else if (bgColor) {
    return template.generator(screenshot, headline, subtitle, bgColor)
  } else if (logo) {
    return template.generator(screenshot, headline, subtitle, undefined, logo)
  }
  return template.generator(screenshot, headline, subtitle)
}

