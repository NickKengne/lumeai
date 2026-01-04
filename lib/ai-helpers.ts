/**
 * AI Helper Functions for Lume AI
 * Based on Claude.md specifications for structured screenshot generation
 */

import { z } from "zod"

// ===========================
// ZOD SCHEMAS FOR VALIDATION
// ===========================

export const ScreenLayoutSchema = z.object({
  id: z.string(),
  headline: z.string().max(50, "Headline must be under 50 characters"),
  subheadline: z.string().max(100).optional(),
  layout: z.enum([
    "iphone_centered",
    "iphone_offset",
    "iphone_feature_list",
    "iphone_comparison",
    "iphone_hero"
  ]),
  background: z.enum([
    "soft_gradient",
    "solid_light",
    "solid_dark",
    "branded",
    "minimal"
  ]),
  emphasis: z.enum([
    "dashboard",
    "charts",
    "social",
    "onboarding",
    "feature"
  ]).optional(),
})

export const AIResponseSchema = z.object({
  theme: z.string(),
  tone: z.enum(["clean", "bold", "professional", "playful", "minimal"]),
  targetAudience: z.string().optional(),
  screens: z.array(ScreenLayoutSchema).min(1).max(5),
})

export type ScreenLayout = z.infer<typeof ScreenLayoutSchema>
export type AIResponse = z.infer<typeof AIResponseSchema>

// ===========================
// OPENAI SYSTEM PROMPT
// ===========================

export const SYSTEM_PROMPT = `You are an App Store marketing expert specializing in screenshot design.
Your job is to transform an app description into structured App Store screenshot instructions.

CRITICAL RULES:
- Output ONLY valid JSON matching the required schema
- No markdown, no code blocks, no explanations
- No pixel values or exact measurements
- Use only known layout types and background styles
- Keep headlines under 8 words (50 characters max)
- Generate 3-5 screenshots that tell a story
- Focus on user benefits, not technical features

LAYOUT TYPES:
- iphone_centered: Main app screen centered with headline above
- iphone_offset: Screen offset to one side, text on the other
- iphone_feature_list: Small screen preview with bullet points
- iphone_comparison: Before/after or side-by-side comparison
- iphone_hero: Large, impactful hero screen with minimal text

BACKGROUND STYLES:
- soft_gradient: Subtle gradient background
- solid_light: Clean white or light gray
- solid_dark: Dark background for contrast
- branded: Use brand colors (if mentioned)
- minimal: No background distractions

EMPHASIS OPTIONS:
- dashboard: Highlight main interface
- charts: Focus on data visualization
- social: Show community/sharing features
- onboarding: Welcome/tutorial screens
- feature: Specific feature deep-dive

OUTPUT FORMAT (example):
{
  "theme": "finance",
  "tone": "professional",
  "targetAudience": "young professionals managing budgets",
  "screens": [
    {
      "id": "screen_1",
      "headline": "Track Every Expense",
      "subheadline": "Stay on top of your spending",
      "layout": "iphone_centered",
      "background": "soft_gradient",
      "emphasis": "dashboard"
    },
    {
      "id": "screen_2",
      "headline": "Visualize Your Budget",
      "layout": "iphone_offset",
      "background": "solid_light",
      "emphasis": "charts"
    }
  ]
}

Now analyze the user's app description and generate the JSON structure.`

// ===========================
// OPENAI API CALL (READY TO USE)
// ===========================

export async function generateScreenshotStructure(
  userPrompt: string,
  apiKey?: string
): Promise<AIResponse> {
  const key = apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY

  if (!key) {
    throw new Error("OpenAI API key not found")
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }, // Force JSON output
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No response from OpenAI")
    }

    // Parse and validate with Zod
    const parsed = JSON.parse(content)
    const validated = AIResponseSchema.parse(parsed)

    return validated
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues)
      throw new Error("AI response did not match expected format. Retrying...")
    }
    throw error
  }
}

// ===========================
// RETRY MECHANISM
// ===========================

export async function generateWithRetry(
  userPrompt: string,
  maxRetries = 3
): Promise<AIResponse> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateScreenshotStructure(userPrompt)
    } catch (error) {
      lastError = error as Error
      console.warn(`Attempt ${i + 1} failed:`, error)
      
      // Wait before retry (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)))
      }
    }
  }

  throw lastError || new Error("Failed after max retries")
}

// ===========================
// TEMPLATE RESOLUTION
// ===========================

export interface CanvasLayer {
  id: string
  type: "text" | "image" | "gradient"
  content: string
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
  color?: string
  bold?: boolean
  align?: "left" | "center" | "right"
}

export interface CanvasState {
  width: number
  height: number
  backgroundColor: string
  layers: CanvasLayer[]
}

export function resolveTemplate(
  screen: ScreenLayout,
  screenshotUrl: string,
  index: number
): CanvasState {
  const baseWidth = 375
  const baseHeight = 667

  switch (screen.layout) {
    case "iphone_centered":
      return {
        width: baseWidth,
        height: baseHeight,
        backgroundColor: getBackgroundColor(screen.background),
        layers: [
          {
            id: `headline_${index}`,
            type: "text",
            content: screen.headline,
            x: 20,
            y: 30,
            width: 335,
            height: 60,
            fontSize: 32,
            color: "#000000",
            bold: true,
            align: "center",
          },
          {
            id: `screenshot_${index}`,
            type: "image",
            content: screenshotUrl,
            x: 37.5,
            y: 120,
            width: 300,
            height: 450,
          },
          {
            id: `subheadline_${index}`,
            type: "text",
            content: screen.subheadline || "",
            x: 20,
            y: 590,
            width: 335,
            height: 40,
            fontSize: 14,
            color: "#666666",
            align: "center",
          },
        ],
      }

    case "iphone_offset":
      return {
        width: baseWidth,
        height: baseHeight,
        backgroundColor: getBackgroundColor(screen.background),
        layers: [
          {
            id: `screenshot_${index}`,
            type: "image",
            content: screenshotUrl,
            x: 200,
            y: 100,
            width: 150,
            height: 300,
          },
          {
            id: `headline_${index}`,
            type: "text",
            content: screen.headline,
            x: 20,
            y: 150,
            width: 160,
            height: 80,
            fontSize: 24,
            color: "#000000",
            bold: true,
            align: "left",
          },
          {
            id: `subheadline_${index}`,
            type: "text",
            content: screen.subheadline || "",
            x: 20,
            y: 250,
            width: 160,
            height: 100,
            fontSize: 14,
            color: "#666666",
            align: "left",
          },
        ],
      }

    case "iphone_feature_list":
      return {
        width: baseWidth,
        height: baseHeight,
        backgroundColor: getBackgroundColor(screen.background),
        layers: [
          {
            id: `headline_${index}`,
            type: "text",
            content: screen.headline,
            x: 20,
            y: 40,
            width: 335,
            height: 50,
            fontSize: 28,
            color: "#000000",
            bold: true,
            align: "center",
          },
          {
            id: `screenshot_${index}`,
            type: "image",
            content: screenshotUrl,
            x: 112.5,
            y: 120,
            width: 150,
            height: 300,
          },
          {
            id: `features_${index}`,
            type: "text",
            content: "• Feature 1\n• Feature 2\n• Feature 3",
            x: 40,
            y: 450,
            width: 295,
            height: 150,
            fontSize: 16,
            color: "#333333",
            align: "left",
          },
        ],
      }

    default:
      // Default to centered layout
      return resolveTemplate(
        { ...screen, layout: "iphone_centered" },
        screenshotUrl,
        index
      )
  }
}

function getBackgroundColor(style: string): string {
  const backgrounds: Record<string, string> = {
    soft_gradient: "#F0F4FF",
    solid_light: "#FFFFFF",
    solid_dark: "#1A1A1A",
    branded: "#3B82F6",
    minimal: "#F5F5F5",
  }
  return backgrounds[style] || backgrounds.solid_light
}

// ===========================
// MOCK GENERATOR (FOR TESTING)
// ===========================

export function generateMockAIResponse(userPrompt: string): AIResponse {
  const promptLower = userPrompt.toLowerCase()
  
  let theme = "general"
  if (promptLower.includes("finance")) theme = "finance"
  if (promptLower.includes("fitness")) theme = "fitness"
  if (promptLower.includes("social")) theme = "social"
  
  return {
    theme,
    tone: "professional",
    targetAudience: "young professionals aged 25-40",
    screens: [
      {
        id: "screen_1",
        headline: "Transform Your Experience",
        subheadline: "Everything you need in one place",
        layout: "iphone_centered",
        background: "soft_gradient",
        emphasis: "dashboard",
      },
      {
        id: "screen_2",
        headline: "Built For You",
        subheadline: "Personalized to your needs",
        layout: "iphone_offset",
        background: "solid_light",
        emphasis: "feature",
      },
      {
        id: "screen_3",
        headline: "Stay Connected",
        layout: "iphone_centered",
        background: "soft_gradient",
        emphasis: "social",
      },
    ],
  }
}

// ===========================
// EXPORT UTILITIES
// ===========================

export interface ExportOptions {
  format: "png" | "jpg"
  quality: number // 0-100
  sizes: Array<{
    name: string
    width: number
    height: number
  }>
}

export const APP_STORE_SIZES = [
  { name: "iPhone 6.7", width: 1290, height: 2796 },
  { name: "iPhone 6.5", width: 1242, height: 2688 },
  { name: "iPhone 5.5", width: 1242, height: 2208 },
  { name: "iPad Pro 12.9", width: 2048, height: 2732 },
  { name: "iPad Pro 11", width: 1668, height: 2388 },
]

/**
 * Calculate scale factor to fit canvas into target size
 */
export function calculateScale(
  canvasWidth: number,
  canvasHeight: number,
  targetWidth: number,
  targetHeight: number
): number {
  const scaleX = targetWidth / canvasWidth
  const scaleY = targetHeight / canvasHeight
  return Math.min(scaleX, scaleY)
}

/**
 * Generate filename for export
 */
export function generateExportFilename(
  projectName: string,
  screenIndex: number,
  sizeName: string,
  format: "png" | "jpg"
): string {
  const sanitized = projectName.replace(/[^a-z0-9]/gi, "_").toLowerCase()
  return `${sanitized}_screen${screenIndex + 1}_${sizeName.replace(/\s+/g, "_")}.${format}`
}

