# 🚀 Quick Start Guide - Nano Banana Integration

## ⚡ 5-Minute Setup

### 1. Get API Keys (2 min)

**Gemini API Key:**
```
1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key: AIzaSy...
```

**OpenAI API Key:**
```
1. Visit: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key: sk-proj-...
```

### 2. Create `.env.local` (1 min)

In project root:
```bash
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-your-key-here
NEXT_PUBLIC_GEMINI_NANO_KEY=AIzaSy-your-key-here
```

### 3. Start Server (1 min)

```bash
npm run dev
```

### 4. Test It! (1 min)

1. Go to `http://localhost:3000`
2. Type: "Create App Store screenshots for my fitness app"
3. Upload 2-3 app screenshots
4. Click "Generate App Store Screenshots"
5. ✨ Watch the AI work!

---

## 🎯 What You Get

### AI Analysis
```
Category: fitness
Audience: young professionals
Style: energetic, bold gradients
Colors: orange, red, pink
Confidence: 92%
```

### Screenshot Generation
```
Screen 1: "Achieve Your Goals" (hero)
Screen 2: "Track Progress" (charts)
Screen 3: "Join Community" (social)
```

### AI Backgrounds
```
Click "✨ AI Generate" → Instant professional background
```

---

## 📋 Feature Checklist

When everything works, you'll see:

- ✅ AI analysis card appears in design canvas
- ✅ Category and style are accurate
- ✅ Color suggestions match app type
- ✅ "✨ AI Generate" button works
- ✅ Backgrounds match app mood
- ✅ No console errors
- ✅ Smooth, fast experience

---

## 🐛 Troubleshooting

### "Gemini API key not configured"
**Fix:** Add `NEXT_PUBLIC_GEMINI_NANO_KEY` to `.env.local` and restart

### "No analysis appears"
**Check Console:**
- Look for "🔍 Analyzing user prompt..."
- If missing, check API key format
- Try with a simpler prompt

### "Background generation fails"
**Check:**
- Gemini API quota (60 req/min free tier)
- API key is correct
- Falls back to gradient (still works!)

### Still Issues?
1. Check browser console (F12)
2. Read `GEMINI_INTEGRATION.md`
3. Verify both API keys are set

---

## 📖 Documentation

| File | Purpose |
|------|---------|
| `GEMINI_INTEGRATION.md` | Complete technical guide (400+ lines) |
| `IMPLEMENTATION_SUMMARY.md` | Quick reference & examples |
| `ARCHITECTURE_DIAGRAM.md` | Visual architecture |
| `QUICK_START.md` | This file! |

---

## 🔥 Pro Tips

**Better Prompts:**
```
✅ "Create fitness app screenshots with energetic style"
✅ "Generate meditation app screenshots, calm purple tones"
✅ "Design finance app screenshots, professional green/blue"

❌ "Make screenshots"
❌ "Generate images"
```

**Upload Quality:**
- Use actual app screenshots (not mockups)
- 2-5 screenshots works best
- Include key features (dashboard, charts, etc.)

**AI Generation:**
- Let AI analyze first (takes 2-4 seconds)
- Upload before generating structure
- Try "AI Generate" for backgrounds

---

## 🎨 What The AI Does

### Prompt Analysis (Gemini)
1. Understands your app type
2. Identifies key features
3. Determines target audience
4. Suggests visual style
5. Recommends color palette
6. Creates screenshot strategy

### Structure Generation (OpenAI + Gemini)
1. Uses analysis for context
2. Generates 3-5 screen layouts
3. Creates compelling headlines
4. Suggests layouts & emphasis
5. Applies best practices

### Background Generation (Gemini)
1. Analyzes app mood
2. Matches color scheme
3. Generates gradient/image
4. Applies to canvas instantly

---

## 💰 Costs

**Gemini API (Free Tier):**
- 60 requests/minute
- Sufficient for development
- Upgrade for production

**OpenAI API:**
- ~$0.03-0.06 per generation
- Monitor at platform.openai.com/usage

---

## ✨ Example Flow

```
You type:
"Create App Store screenshots for my meditation app"

AI thinks:
🔍 Category: meditation
🎨 Style: calm, peaceful
🎨 Colors: purple, blue, soft pastels
🎯 Audience: busy professionals seeking calm
💡 Suggestion: Use gradient backgrounds, soft imagery

You upload:
📱 3 app screenshots

AI generates:
Screen 1: "Find Your Peace" (hero shot)
Screen 2: "Guided Meditations" (feature list)
Screen 3: "Track Your Progress" (stats)

You click "✨ AI Generate":
Background: Beautiful purple-to-blue calm gradient

You export:
📥 3 professional App Store screenshots
```

---

## 🚀 Ready?

```bash
# 1. Add keys to .env.local
# 2. Run this:
npm run dev

# 3. Open browser:
http://localhost:3000

# 4. Try a prompt!
```

**That's it! You're ready to generate AI-powered screenshots! 🎉**

---

## 📞 Need Help?

1. **Check console logs** (F12 → Console)
2. **Read full docs** (`GEMINI_INTEGRATION.md`)
3. **Verify API keys** (format & validity)
4. **Test with simple prompt** ("fitness app")

---

## 🎯 Success Indicators

You'll know it's working when:

✅ Console shows: "🔍 Analyzing user prompt with Gemini..."  
✅ Console shows: "✅ Prompt analysis complete"  
✅ AI analysis card appears with accurate data  
✅ Colors match your app type  
✅ Backgrounds look professional  
✅ Everything feels intelligent and context-aware  

**Welcome to the future of App Store screenshot generation! 🚀✨**

