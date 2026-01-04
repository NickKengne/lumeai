# 🚀 Gemini Nano Banana Integration Guide

## Overview

This project now integrates **Google Gemini 2.5 Flash (Nano Banana)** for advanced AI-powered screenshot generation and analysis. The integration provides:

1. **Deep Prompt Analysis** - AI understands user intent comprehensively
2. **Smart Background Generation** - AI-generated backgrounds based on app context
3. **Screenshot Enhancement** - Improve image quality automatically
4. **Intelligent Recommendations** - AI suggests best practices for App Store screenshots

---

## 🔑 Setup Instructions

### 1. Get Your API Keys

#### OpenAI API Key (for GPT-4)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Click "Create new secret key"
4. Copy the key (it won't be shown again)

#### Gemini API Key (for Nano Banana)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# OpenAI API Key for GPT-4 (screenshot structure generation)
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Google Gemini Nano Banana API Key (Gemini 2.5 Flash)
NEXT_PUBLIC_GEMINI_NANO_KEY=AIzaSyxxxxxxxxxxxxxx
```

**Important:** Never commit `.env.local` to version control!

---

## 📊 Features Breakdown

### 1. AI Prompt Analysis

**Location:** `lib/ai-helpers.ts` - `analyzeUserPrompt()`

When a user types a prompt like:
> "Create App Store screenshots for my fitness tracking app"

The AI analyzes and returns:

```typescript
{
  appCategory: "fitness",
  appName: "Fitness Tracker",
  keyFeatures: [
    "Workout tracking",
    "Progress visualization", 
    "Social motivation"
  ],
  targetAudience: "young professionals aged 25-40",
  visualStyle: {
    mood: "energetic",
    colorScheme: ["#F59E0B", "#EF4444", "#EC4899"],
    designStyle: "bold gradient"
  },
  screenshotStrategy: {
    recommendedCount: 3,
    focusAreas: [
      "Main dashboard with workout stats",
      "Progress charts and achievements",
      "Social features and community"
    ],
    storytellingArc: [
      "Hook with transformation promise",
      "Show tracking capabilities",
      "Demonstrate results"
    ]
  },
  confidence: 0.92,
  suggestions: [
    "Highlight before/after comparisons",
    "Use energetic colors like orange and red",
    "Show social proof with user testimonials"
  ]
}
```

**Usage in Code:**
```typescript
import { analyzeUserPrompt } from "@/lib/ai-helpers"

const analysis = await analyzeUserPrompt(userPrompt)
console.log(analysis.appCategory) // "fitness"
console.log(analysis.visualStyle.mood) // "energetic"
```

---

### 2. AI Background Generation

**Location:** `lib/ai-helpers.ts` - `generateBackgroundWithNanoBanana()`

Generates professional backgrounds based on app context:

```typescript
import { generateBackgroundWithNanoBanana } from "@/lib/ai-helpers"

// Generate background
const background = await generateBackgroundWithNanoBanana(
  "Energetic fitness app with orange and blue tones"
)

// Returns CSS gradient or base64 image
// Example: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
```

**In Design Canvas:**
- Click "✨ AI Generate" button next to Background section
- AI analyzes the prompt and generates matching background
- Automatically applies to current screen

---

### 3. Screenshot Enhancement

**Location:** `lib/ai-helpers.ts` - `enhanceScreenshotWithAI()`

Improves uploaded screenshots:

```typescript
import { enhanceScreenshotWithAI } from "@/lib/ai-helpers"

const enhanced = await enhanceScreenshotWithAI(
  imageBase64,
  "professional" // or "clarity", "color", "vibrant"
)
```

Enhancement types:
- `clarity` - Sharper, clearer images
- `color` - More vibrant colors
- `professional` - Polished for App Store
- `vibrant` - Eye-catching marketing

---

### 4. Enhanced Screenshot Structure

**Location:** `lib/ai-helpers.ts` - `generateScreenshotStructure()`

Now accepts prompt analysis for better results:

```typescript
// Old way
const structure = await generateScreenshotStructure(userPrompt)

// New enhanced way
const analysis = await analyzeUserPrompt(userPrompt)
const structure = await generateScreenshotStructure(
  userPrompt,
  undefined, // apiKey (optional)
  analysis   // prompt analysis for context
)
```

---

## 🎨 User Flow

### Complete Workflow

1. **User enters prompt**
   ```
   "Create screenshots for my budget tracking app"
   ```

2. **AI analyzes prompt** (Gemini)
   - Category: Finance
   - Mood: Professional
   - Colors: Green, Blue
   - Target: Young professionals

3. **User uploads screenshots**
   - Upload 2-5 app screenshots
   - System stores them

4. **AI generates structure** (OpenAI + Gemini Analysis)
   - Creates 3-5 screenshot layouts
   - Applies prompt analysis context
   - Suggests headlines & layouts

5. **AI generates backgrounds** (Gemini)
   - Click "AI Generate" button
   - Creates context-aware backgrounds
   - Matches app mood and colors

6. **Canvas opens with results**
   - Shows AI analysis card
   - Displays generated screenshots
   - Allows manual editing
   - Export when ready

---

## 🔧 Technical Architecture

### Data Flow

```
User Prompt
    ↓
[Gemini] analyzeUserPrompt()
    ↓
PromptAnalysis {
  category, features, style, etc.
}
    ↓
[OpenAI] generateScreenshotStructure(prompt, analysis)
    ↓
AIResponse {
  theme, tone, screens[]
}
    ↓
[Canvas] Renders with both contexts
    ↓
[Gemini] generateBackgroundWithNanoBanana()
    ↓
Final Screenshot Ready for Export
```

### File Structure

```
lib/
  ├── ai-helpers.ts          # Core AI functions
  │   ├── analyzeUserPrompt()
  │   ├── generateBackgroundWithNanoBanana()
  │   ├── enhanceScreenshotWithAI()
  │   └── generateScreenshotStructure()
  │
  └── openai-stream.ts        # OpenAI streaming utilities

components/
  ├── chat-conversation.tsx   # Handles AI analysis trigger
  ├── design-canvas.tsx       # Shows AI analysis + generation
  └── chat-input.tsx          # User input interface
```

---

## 📱 UI Components

### AI Analysis Card (in Design Canvas)

Shows comprehensive analysis:

```tsx
<div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
  <div className="flex items-center gap-2">
    <div className="bg-gradient-to-r from-purple-600 to-blue-600">AI</div>
    <h4>Analysis</h4>
  </div>
  
  <div>Category: {promptAnalysis.appCategory}</div>
  <div>Audience: {promptAnalysis.targetAudience}</div>
  <div>Features: {promptAnalysis.keyFeatures}</div>
  <div>Style: {promptAnalysis.visualStyle.mood}</div>
  <div>Suggestion: {promptAnalysis.suggestions[0]}</div>
</div>
```

### AI Background Generator Button

```tsx
<button onClick={generateAIBackground}>
  ✨ AI Generate
</button>
```

---

## 🚀 Advanced Usage

### Custom Prompt Analysis

```typescript
// Analyze any text
const analysis = await analyzeUserPrompt(
  "Make a social media app for dog lovers"
)

// Use analysis for custom logic
if (analysis.appCategory === "social") {
  // Apply social-specific templates
}

if (analysis.confidence > 0.8) {
  // High confidence, proceed automatically
} else {
  // Ask user for clarification
}
```

### Batch Background Generation

```typescript
const prompts = [
  "Energetic fitness background",
  "Calm meditation gradient",
  "Professional finance backdrop"
]

const backgrounds = await Promise.all(
  prompts.map(p => generateBackgroundWithNanoBanana(p))
)
```

### Screenshot Enhancement Pipeline

```typescript
// Upload → Enhance → Apply
const uploadedImages = await getUploads()

const enhanced = await Promise.all(
  uploadedImages.map(img => 
    enhanceScreenshotWithAI(img, "professional")
  )
)

applyToCanvas(enhanced)
```

---

## 🐛 Troubleshooting

### API Key Issues

**Problem:** "Gemini API key not configured"

**Solution:**
1. Check `.env.local` exists
2. Verify `NEXT_PUBLIC_GEMINI_NANO_KEY` is set
3. Restart dev server: `npm run dev`

### Fallback Behavior

If Gemini API fails, the system falls back to:
- Static color palettes
- Rule-based category detection
- Pre-defined templates

**Check Console:**
```javascript
// Look for these logs
"🔍 Analyzing user prompt with Gemini..."
"✅ Prompt analysis complete:"
"⚠️ Gemini API key not found, using fallback analysis"
```

### Rate Limits

**Gemini API:**
- Free tier: 60 requests per minute
- If exceeded, wait 60 seconds or upgrade plan

**OpenAI API:**
- Depends on your plan
- Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

---

## 🎯 Best Practices

### 1. Prompt Writing

**Good Prompts:**
✅ "Create App Store screenshots for my meditation app targeting busy professionals"
✅ "Design screenshots for a fitness tracker with bold, energetic colors"
✅ "Generate mockups for a budget app with clean, professional style"

**Bad Prompts:**
❌ "Make screenshots"
❌ "Design something"
❌ "Create images"

### 2. Screenshot Uploads

- Upload **2-5 screenshots** for best results
- Use **actual app screenshots**, not mockups
- Ensure images are **clear and high-quality**
- Include **key features** (dashboard, charts, main screens)

### 3. API Usage

- **Cache analysis results** when possible
- **Batch requests** instead of individual calls
- **Use fallbacks** for offline/error scenarios
- **Monitor costs** via API dashboards

---

## 📊 Performance Metrics

### Typical Response Times

- **Prompt Analysis:** 2-4 seconds
- **Screenshot Structure:** 3-5 seconds
- **Background Generation:** 3-6 seconds
- **Screenshot Enhancement:** 4-8 seconds

### Optimization Tips

1. **Parallel Processing:**
```typescript
// Run analysis and structure generation in parallel
const [analysis, structure] = await Promise.all([
  analyzeUserPrompt(prompt),
  generateScreenshotStructure(prompt)
])
```

2. **Caching:**
```typescript
// Cache analysis per prompt
const cache = new Map<string, PromptAnalysis>()

function getCachedAnalysis(prompt: string) {
  if (cache.has(prompt)) return cache.get(prompt)
  
  const analysis = await analyzeUserPrompt(prompt)
  cache.set(prompt, analysis)
  return analysis
}
```

---

## 🔮 Future Enhancements

### Planned Features

1. **Image Generation** (when Gemini supports it directly)
   - Generate complete screenshots from text
   - No need for user uploads

2. **Style Transfer**
   - Apply visual style from one app to another
   - "Make it look like Apple's design"

3. **A/B Testing Recommendations**
   - AI suggests multiple variations
   - Predicts which will convert best

4. **Localization**
   - Generate screenshots in multiple languages
   - Culture-aware design suggestions

---

## 📝 API Reference

### `analyzeUserPrompt(userPrompt: string): Promise<PromptAnalysis>`

Analyzes user intent and returns comprehensive breakdown.

**Parameters:**
- `userPrompt` - User's description of desired screenshots

**Returns:** `PromptAnalysis` object

**Throws:** Falls back to rule-based analysis on error

---

### `generateBackgroundWithNanoBanana(prompt: string, options?): Promise<string>`

Generates AI background based on description.

**Parameters:**
- `prompt` - Background description
- `options` - Optional configuration

**Returns:** CSS gradient string or base64 image

**Throws:** Returns fallback gradient on error

---

### `enhanceScreenshotWithAI(imageBase64: string, enhancement: string): Promise<string>`

Enhances screenshot quality.

**Parameters:**
- `imageBase64` - Base64 encoded image
- `enhancement` - Type: "clarity" | "color" | "professional" | "vibrant"

**Returns:** Enhanced base64 image

**Throws:** Returns original image on error

---

### `generateScreenshotStructure(prompt: string, apiKey?: string, analysis?: PromptAnalysis): Promise<AIResponse>`

Generates structured layout instructions.

**Parameters:**
- `prompt` - User prompt
- `apiKey` - Optional OpenAI key override
- `analysis` - Optional pre-computed analysis

**Returns:** `AIResponse` with screen layouts

**Throws:** Returns mock structure on error

---

## 💡 Tips for Developers

### Debugging

Enable verbose logging:
```typescript
// In ai-helpers.ts
const DEBUG = true

if (DEBUG) {
  console.log("📍 Gemini Request:", requestBody)
  console.log("📍 Gemini Response:", responseData)
}
```

### Testing Without API Keys

The system automatically falls back to mock data:
```typescript
// Will use fallback if no API key
const analysis = await analyzeUserPrompt("fitness app")
// Returns { appCategory: "fitness", confidence: 0.6, ... }
```

### Custom AI Prompts

Modify system prompts in `ai-helpers.ts`:
```typescript
const CUSTOM_ANALYSIS_PROMPT = `
You are an expert in ${yourDomain}.
Analyze: ${userInput}
Focus on: ${yourCriteria}
`
```

---

## 📞 Support

- **Issues:** Open a GitHub issue
- **Questions:** Check existing issues first
- **API Docs:** 
  - [Gemini API](https://ai.google.dev/docs)
  - [OpenAI API](https://platform.openai.com/docs)

---

## ✨ Quick Start Checklist

- [ ] Copy `.env.example` to `.env.local`
- [ ] Add `NEXT_PUBLIC_OPENAI_API_KEY`
- [ ] Add `NEXT_PUBLIC_GEMINI_NANO_KEY`
- [ ] Restart dev server (`npm run dev`)
- [ ] Test with sample prompt
- [ ] Upload screenshots
- [ ] Click "AI Generate" button
- [ ] Check console for logs
- [ ] Export final screenshots

**You're ready to go! 🎉**

