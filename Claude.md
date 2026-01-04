Perfect — I’ll explain this **as a technical system design**, not marketing, so you can **hand it directly to Cursor** to build a **PoC** using **OpenAI**.

What you want is **NOT “generate images from text”**.
It is a **deterministic composition pipeline** driven by AI.

---

# 🧠 Core Idea (Important)

**AI never draws pixels.**
AI produces **structured intent**.
Your system turns that intent into **App Store screenshots**.

This is the only way to get:

* stable outputs
* correct App Store sizes
* reproducible renders

---

# 🔁 End-to-End Pipeline

```
User Prompt
  ↓
LLM (JSON only)
  ↓
Template Resolver
  ↓
Canvas State
  ↓
Renderer (HTML/CSS)
  ↓
Playwright Screenshot
  ↓
Sharp Resize
  ↓
Store-ready assets
```

---

# 1️⃣ Input Layer (Prompt)

### User Input (minimal)

```txt
A finance app that helps users track expenses and budgets
```

Optional:

* target audience
* app category

You should **not** ask for layout or design details.

---

# 2️⃣ System Prompt (OpenAI)

This is CRITICAL.

### System Prompt (example)

```txt
You are an App Store marketing expert.
Your job is to transform an app description into structured
App Store screenshot instructions.

Rules:
- Output ONLY valid JSON
- No markdown
- No explanations
- No pixel values
- Use known App Store layouts
- Keep headlines under 8 words
```

---

# 3️⃣ LLM Output (Structured Intent)

The model produces **layout intent**, not images.

### Example Output

```json
{
  "theme": "finance",
  "tone": "clean",
  "screens": [
    {
      "id": "screen_1",
      "headline": "Track every expense",
      "layout": "iphone_centered",
      "background": "soft_gradient",
      "emphasis": "dashboard"
    },
    {
      "id": "screen_2",
      "headline": "Stay on budget",
      "layout": "iphone_offset",
      "background": "light",
      "emphasis": "charts"
    }
  ]
}
```

---

# 4️⃣ Validation Layer (Mandatory)

Never trust the model blindly.

Use **Zod / JSON Schema**.

```ts
const ScreenshotSchema = z.object({
  theme: z.string(),
  screens: z.array(
    z.object({
      headline: z.string().max(50),
      layout: z.enum([
        "iphone_centered",
        "iphone_offset"
      ])
    })
  )
})
```

If invalid → retry with error feedback.

---

# 5️⃣ Template Resolution (No AI Here)

You map **layout keys → real templates**.

```ts
function resolveTemplate(screen) {
  switch (screen.layout) {
    case "iphone_centered":
      return IphoneCenteredTemplate(screen)
  }
}
```

Templates define:

* device mockup
* safe areas
* typography rules
* spacing rules

---

# 6️⃣ Canvas State (Single Source of Truth)

AI output becomes **CanvasState JSON**.

```json
{
  "width": 1242,
  "height": 2688,
  "layers": [
    {
      "type": "background",
      "style": "gradient"
    },
    {
      "type": "device",
      "model": "iphone_15"
    },
    {
      "type": "text",
      "content": "Track every expense",
      "position": "top"
    }
  ]
}
```

This is:

* serializable
* replayable
* testable

---

# 7️⃣ Rendering Engine (Deterministic)

### Why not frontend rendering?

* font differences
* inconsistent DPI
* non-reproducible

---

### Correct Approach

1. Convert CanvasState → HTML
2. Apply CSS layout rules
3. Render with Playwright

```ts
await page.setViewport({ width: 1242, height: 2688 })
await page.setContent(renderHTML(canvas))
await page.screenshot({ path: "screen.png" })
```

---

# 8️⃣ Image Post-Processing

Use Sharp to:

* resize
* normalize DPI
* export PNG

```ts
sharp("screen.png")
  .resize(1242, 2688)
  .png()
```

---

# 9️⃣ App Store Size Generation

Repeat rendering for:

* iPhone 6.7"
* iPhone 6.5"
* iPad (optional)

All using the same CanvasState.

---

# 🔑 Why This Works

| Problem              | Solution                |
| -------------------- | ----------------------- |
| Random AI images     | Deterministic templates |
| Inconsistent quality | Fixed layouts           |
| Wrong sizes          | Controlled rendering    |
| Hard to edit         | Canvas JSON             |

---

# ⚠️ What NOT to Do

❌ Ask AI for image dimensions
❌ Let AI draw mockups
❌ Generate screenshots directly via DALL·E
❌ Let users edit raw AI output

---

# 🧪 Minimal PoC Scope (Perfect for Cursor)

* 1 prompt
* 2 layouts
* 2 screenshots
* iPhone only
* No editor

---

# 🧠 Summary for Cursor

> Use OpenAI to generate structured screenshot intent,
> map it to deterministic templates,
> render via HTML + Playwright,
> export App Store–ready images.

That’s the whole system.

---

If you want, I can:

* write the **exact OpenAI API call**
* give **a full system prompt**
* provide **template HTML/CSS**
* give **Cursor instructions (task list)**

Tell me what you want next.
