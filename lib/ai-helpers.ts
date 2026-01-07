/**
 * AI Helper Functions for Lume AI
 * Based on Claude.md specifications for structured screenshot generation
 * Enhanced with Gemini Nano Banana (2.5 Flash Image) integration
 */

import { z } from "zod"

// ===========================
// GEMINI NANO BANANA CONFIG
// ===========================

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_NANO_KEY || ""

// Using REST API for client-side compatibility
// Model: gemini-2.0-flash-exp (text generation)
// For image generation, use gemini-2.5-flash-image when available
const GEMINI_TEXT_MODEL = "gemini-2.0-flash-exp"
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"

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

CRITICAL: Output ONLY valid JSON. Use EXACT enum values as specified below.

VALID VALUES (use EXACTLY as shown, case-sensitive):
- tone: MUST be one of: "clean", "bold", "professional", "playful", "minimal"
- layout: MUST be one of: "iphone_centered", "iphone_offset", "iphone_feature_list", "iphone_comparison", "iphone_hero"
- background: MUST be one of: "soft_gradient", "solid_light", "solid_dark", "branded", "minimal"
- emphasis: MUST be one of: "dashboard", "charts", "social", "onboarding", "feature"

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

RULES:
- Generate 3-5 screens that tell a story
- Headlines: Max 8 words (50 characters max)
- Focus on user benefits, not technical features
- Use ONLY the exact enum values listed above
- No markdown, no code blocks, ONLY JSON

Now analyze the user's app description and generate the JSON structure.`

// ===========================
// SANITIZATION HELPERS
// ===========================

/**
 * Sanitize and coerce AI response to match schema
 */
function sanitizeAIResponse(response: any): any {
  // Valid enum values
  const validTones = ["clean", "bold", "professional", "playful", "minimal"]
  const validEmphases = ["dashboard", "charts", "social", "onboarding", "feature"]
  const validLayouts = ["iphone_centered", "iphone_offset", "iphone_feature_list", "iphone_comparison", "iphone_hero"]
  const validBackgrounds = ["soft_gradient", "solid_light", "solid_dark", "branded", "minimal"]
  
  // Coerce tone to valid value
  if (response.tone && !validTones.includes(response.tone)) {
    console.warn(`Invalid tone "${response.tone}", defaulting to "professional"`)
    response.tone = "professional"
  }
  
  // Ensure tone is set
  if (!response.tone) {
    response.tone = "professional"
  }
  
  // Coerce screens
  if (Array.isArray(response.screens)) {
    response.screens = response.screens.map((screen: any) => {
      // Coerce emphasis
      if (screen.emphasis && !validEmphases.includes(screen.emphasis)) {
        console.warn(`Invalid emphasis "${screen.emphasis}", defaulting to "feature"`)
        screen.emphasis = "feature"
      }
      
      // Coerce layout
      if (screen.layout && !validLayouts.includes(screen.layout)) {
        console.warn(`Invalid layout "${screen.layout}", defaulting to "iphone_centered"`)
        screen.layout = "iphone_centered"
      }
      
      // Coerce background
      if (screen.background && !validBackgrounds.includes(screen.background)) {
        console.warn(`Invalid background "${screen.background}", defaulting to "soft_gradient"`)
        screen.background = "soft_gradient"
      }
      
      return screen
    })
  }
  
  return response
}

// ===========================
// OPENAI API CALL (READY TO USE)
// ===========================

export async function generateScreenshotStructure(
  userPrompt: string,
  apiKey?: string,
  promptAnalysis?: PromptAnalysis
): Promise<AIResponse> {
  const key = apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY

  if (!key) {
    throw new Error("OpenAI API key not found")
  }

  // Enhanced prompt with analysis context
  let enhancedPrompt = userPrompt
  if (promptAnalysis) {
    enhancedPrompt = `User Request: ${userPrompt}

Analysis Context:
- App Category: ${promptAnalysis.appCategory}
- Target Audience: ${promptAnalysis.targetAudience}
- Visual Style: ${promptAnalysis.visualStyle.mood}, ${promptAnalysis.visualStyle.designStyle}
- Key Features: ${promptAnalysis.keyFeatures.join(", ")}
- Recommended Screenshots: ${promptAnalysis.screenshotStrategy.recommendedCount}
- Story Arc: ${promptAnalysis.screenshotStrategy.storytellingArc.join(" → ")}

Please generate screenshot structures that align with this analysis.`
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: enhancedPrompt },
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
    console.log('Raw OpenAI response:', parsed)
    
    // Sanitize response before validation
    const sanitized = sanitizeAIResponse(parsed)
    console.log('Sanitized response:', sanitized)
    
    const validated = AIResponseSchema.parse(sanitized)

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
// PROMPT ANALYSIS WITH GEMINI
// ===========================

export interface PromptAnalysis {
  appCategory: string
  appName: string
  keyFeatures: string[]
  targetAudience: string
  visualStyle: {
    mood: string
    colorScheme: string[]
    designStyle: string
  }
  screenshotStrategy: {
    recommendedCount: number
    focusAreas: string[]
    storytellingArc: string[]
  }
  confidence: number
  suggestions: string[]
}

export async function analyzeUserPrompt(userPrompt: string, retryCount = 0): Promise<PromptAnalysis> {
  if (!GEMINI_API_KEY) {
    console.warn("⚠️ Gemini API key not found, using fallback analysis")
    return fallbackPromptAnalysis(userPrompt)
  }

  try {
    const analysisPrompt = `You are an expert App Store marketing analyst. Analyze the following user prompt for creating app screenshots and provide a detailed analysis.

User Prompt: "${userPrompt}"

Provide a comprehensive analysis in JSON format with the following structure:
{
  "appCategory": "primary category (e.g., fitness, finance, social, productivity, etc.)",
  "appName": "detected or inferred app name",
  "keyFeatures": ["list", "of", "main", "features", "to", "highlight"],
  "targetAudience": "description of target users",
  "visualStyle": {
    "mood": "overall mood (e.g., energetic, calm, professional, playful)",
    "colorScheme": ["primary", "colors", "suggested"],
    "designStyle": "design approach (e.g., minimal, bold, gradient, glassmorphic)"
  },
  "screenshotStrategy": {
    "recommendedCount": 3-5,
    "focusAreas": ["what", "to", "emphasize", "in", "each", "screenshot"],
    "storytellingArc": ["screen 1 purpose", "screen 2 purpose", "screen 3 purpose"]
  },
  "confidence": 0.0-1.0,
  "suggestions": ["actionable", "suggestions", "for", "better", "screenshots"]
}

Provide ONLY the JSON response, no markdown or explanations.`

    const apiUrl = `${GEMINI_API_BASE}/models/${GEMINI_TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: analysisPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: "application/json"
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Handle 429 rate limit with retry
      if (response.status === 429) {
        console.warn("⚠️ Gemini API rate limit (60 req/min)")
        if (retryCount === 0) {
          console.log("⏳ Retrying in 2 seconds...")
          await new Promise(resolve => setTimeout(resolve, 2000))
          return analyzeUserPrompt(userPrompt, retryCount + 1)
        }
        console.log("🔄 Using fallback analysis")
        return fallbackPromptAnalysis(userPrompt)
      }
      
      // Handle 400 - invalid request
      if (response.status === 400) {
        console.error("❌ Invalid API request:", errorData)
        return fallbackPromptAnalysis(userPrompt)
      }
      
      // Handle 403 - invalid API key
      if (response.status === 403) {
        console.error("❌ Invalid Gemini API key")
        return fallbackPromptAnalysis(userPrompt)
      }
      
      // Other errors
      console.error("❌ Gemini API error:", response.status, errorData)
      return fallbackPromptAnalysis(userPrompt)
    }

    const data = await response.json()
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!textContent) {
      console.warn("⚠️ No response from Gemini")
      return fallbackPromptAnalysis(userPrompt)
    }

    // Clean up potential markdown formatting
    const cleanedContent = textContent.replace(/```json\n?|\n?```/g, "").trim()
    const analysis = JSON.parse(cleanedContent)
    
    console.log("✅ Gemini analysis:", analysis.appCategory)
    return analysis as PromptAnalysis
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error)
    console.log("🔄 Using fallback analysis")
    return fallbackPromptAnalysis(userPrompt)
  }
}

function fallbackPromptAnalysis(userPrompt: string): PromptAnalysis {
  const promptLower = userPrompt.toLowerCase()
  
  let category = "general"
  let mood = "professional"
  let colors = ["#3B82F6", "#10B981"]
  
  if (promptLower.includes("finance") || promptLower.includes("budget") || promptLower.includes("money")) {
    category = "finance"
    mood = "professional"
    colors = ["#10B981", "#059669", "#047857"]
  } else if (promptLower.includes("fitness") || promptLower.includes("health") || promptLower.includes("workout")) {
    category = "fitness"
    mood = "energetic"
    colors = ["#F59E0B", "#EF4444", "#EC4899"]
  } else if (promptLower.includes("meditation") || promptLower.includes("mindful") || promptLower.includes("calm")) {
    category = "meditation"
    mood = "calm"
    colors = ["#8B5CF6", "#A78BFA", "#C4B5FD"]
  } else if (promptLower.includes("social") || promptLower.includes("chat") || promptLower.includes("message")) {
    category = "social"
    mood = "playful"
    colors = ["#3B82F6", "#8B5CF6", "#EC4899"]
  }
  
  return {
    appCategory: category,
    appName: "Your App",
    keyFeatures: ["Main Feature", "Key Benefit", "Unique Selling Point"],
    targetAudience: "young professionals aged 25-40",
    visualStyle: {
      mood,
      colorScheme: colors,
      designStyle: "modern gradient"
    },
    screenshotStrategy: {
      recommendedCount: 3,
      focusAreas: ["Main interface", "Key features", "User benefits"],
      storytellingArc: ["Hook with main value", "Show key features", "Call to action"]
    },
    confidence: 0.6,
    suggestions: ["Upload actual app screenshots for better results", "Specify your target audience"]
  }
}

// ===========================
// NANO BANANA IMAGE GENERATION
// ===========================

export interface ImageGenerationOptions {
  prompt: string
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4"
  numberOfImages?: number
  style?: string
}

export async function generateBackgroundWithNanoBanana(
  prompt: string,
  options: Partial<ImageGenerationOptions> = {}
): Promise<string> {
  // DISABLED: Gemini API causes 429 rate limits
  // Using local gradient generation instead for stability
  console.log("📊 Using local gradient generation (Gemini disabled to prevent 429 errors)")
  return generateGradientFromDescription(prompt)
  
  /* GEMINI CODE DISABLED TO PREVENT 429 ERRORS
  if (!GEMINI_API_KEY) {
    return generateGradientFromDescription(prompt)
  }

  const fullPrompt = `Suggest CSS gradient colors for a modern App Store screenshot background. ${prompt}. 
Respond with ONLY a JSON object in this format:
{
  "color1": "#hexcode",
  "color2": "#hexcode",
  "angle": 135
}
The gradient should be suitable for placing mobile app screenshots on top.`

  try {
    const apiUrl = `${GEMINI_API_BASE}/models/${GEMINI_TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 256,
          responseMimeType: "application/json"
        }
      })
    })

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("⚠️ Rate limit, using gradient")
      }
      return generateGradientFromDescription(prompt)
    }

    const data = await response.json()
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (textResponse) {
      try {
        const cleanedResponse = textResponse.replace(/```json\n?|\n?```/g, "").trim()
        const gradientData = JSON.parse(cleanedResponse)
        
        if (gradientData.color1 && gradientData.color2) {
          const angle = gradientData.angle || 135
          console.log("✅ AI gradient:", `${gradientData.color1} → ${gradientData.color2}`)
          return `linear-gradient(${angle}deg, ${gradientData.color1} 0%, ${gradientData.color2} 100%)`
        }
      } catch (parseError) {
        // Silent fallback
      }
    }
    
    return generateGradientFromDescription(prompt)
  } catch (error) {
    return generateGradientFromDescription(prompt)
  }
  */
}

function generateGradientFromDescription(description: string): string {
  const lower = description.toLowerCase()
  
  // Finance - Green/Blue professional gradients
  if (lower.includes("finance") || lower.includes("professional") || lower.includes("trust")) {
    return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  }
  
  // Fitness - Energetic orange/red gradients
  if (lower.includes("fitness") || lower.includes("energy") || lower.includes("active")) {
    return "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  }
  
  // Meditation - Calm purple/blue gradients
  if (lower.includes("calm") || lower.includes("meditat") || lower.includes("peace")) {
    return "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
  }
  
  // Social - Vibrant multi-color gradients
  if (lower.includes("social") || lower.includes("fun") || lower.includes("playful")) {
    return "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  }
  
  // Default modern gradient
  return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
}

// ===========================
// ENHANCED SCREENSHOT ENHANCEMENT
// ===========================

export async function enhanceScreenshotWithAI(
  imageBase64: string,
  enhancement: "clarity" | "color" | "professional" | "vibrant"
): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn("Gemini API key not found, returning original image")
    return imageBase64
  }

  const enhancementPrompts = {
    clarity: "Enhance the clarity and sharpness of this app screenshot while maintaining authenticity",
    color: "Enhance the colors to be more vibrant and appealing while keeping it natural",
    professional: "Make this screenshot look more professional and polished for App Store presentation",
    vibrant: "Make the colors more vibrant and eye-catching for marketing purposes"
  }

  try {
    const response = await fetch(`${GEMINI_API_BASE}/models/${GEMINI_TEXT_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: enhancementPrompts[enhancement]
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64.split(",")[1] // Remove data:image/jpeg;base64, prefix
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // For now, return original as Gemini API response format varies
    // In production, extract enhanced image from response
    return imageBase64
  } catch (error) {
    console.error("Screenshot enhancement error:", error)
    return imageBase64
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

