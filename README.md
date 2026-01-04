# 🎨 Lume AI

**The foundation for your App Store presence.**

Lume AI is an AI-powered tool that turns your raw app screenshots into **beautiful, App Store–ready visuals** in under a minute.  
Upload your screenshots, and Lume automatically places them into clean iPhone mockups, adds concise headlines, and exports perfectly sized assets ready for submission.

No design skills required. No complex setup. Just upload and generate.

---

## ✨ What Lume AI Does

Lume AI focuses on one simple goal:

> **Make your app look great on the App Store — fast.**

With Lume AI, you can:
- Upload your existing app screenshots
- Automatically generate polished App Store screenshots
- Get iOS-ready sizes that follow App Store guidelines
- Download and submit instantly

---

## 🚀 How It Works

1. **Describe your app**  
   Start a chat and describe what your app does. AI analyzes and provides recommendations.

2. **Upload screenshots**  
   Upload 2-5 raw screenshots directly from your app. No editing or preparation needed.

3. **AI enhancement**  
   Lume AI automatically:
   - Places them inside clean iPhone mockups
   - Applies modern backgrounds
   - Generates compelling headlines
   - Creates multiple layout variations

4. **Customize**  
   Edit text, colors, positioning, and more in the interactive canvas editor.

5. **Export & ship**  
   Download App Store–ready screenshots in all required resolutions and submit immediately.

All in under 5 minutes.

---

## 🎯 PoC Implementation

This repository contains a **Proof of Concept** implementing the workflow described in **Claude.md**:

### **Key Features Implemented:**
- ✅ AI-powered chat workflow with detailed analysis
- ✅ Automatic project creation in sidebar
- ✅ Screenshot upload with preview
- ✅ 70% slide panel design canvas
- ✅ Multi-screen management
- ✅ Layer-based editing system
- ✅ Drag-and-drop positioning
- ✅ Text formatting (bold, italic, alignment)
- ✅ Color customization
- ✅ Zoom and pan controls

### **Architecture:**
```
User Prompt → AI Thinking → Detailed Analysis → Screenshot Upload 
  → Canvas Generation → User Editing → Export (Ready for implementation)
```

See **[POC_GUIDE.md](./POC_GUIDE.md)** for comprehensive implementation details.

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 with App Router
- **UI:** React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Animations:** Framer Motion
- **State:** React Hooks + localStorage
- **AI:** Ready for OpenAI GPT-4 integration (mock responses in PoC)
- **Rendering:** HTML/CSS → Playwright → Sharp (ready for implementation)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables (Optional)

For OpenAI integration, create `.env.local`:

```env
NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
```

---

## 📚 Documentation

- **[POC_GUIDE.md](./POC_GUIDE.md)**: Complete PoC implementation guide
- **[Claude.md](./Claude.md)**: Original system design specifications
- **[lib/ai-helpers.ts](./lib/ai-helpers.ts)**: AI utilities and OpenAI integration helpers

---

## 🎨 Usage Example

### 1. Start a New Chat
Click "New Chat" and describe your app:
```
Create App Store screenshots for a meditation app with guided 
sessions, progress tracking, and calming nature sounds
```

### 2. Review AI Analysis
AI provides:
- App type identification (wellness/meditation)
- Target audience (stressed professionals, mindfulness seekers)
- Key features to highlight
- Visual style recommendations (calm, minimal, soothing colors)
- Screenshot strategy

### 3. Upload Screenshots
- Click "Upload App Screenshots"
- Select 3-4 images of your app
- Preview thumbnails appear

### 4. Generate & Edit
- Click "Generate App Store Screenshots"
- Canvas opens with auto-generated layouts
- Customize headlines, colors, positioning
- Add more screens if needed

### 5. Export
- Click "Export" to download
- Get all required App Store sizes

---

## 🧠 What Lume AI Is (and Isn't)

### Lume AI **is:**
- A screenshot enhancement tool
- A launch-ready App Store asset generator
- Fast, automated, and intelligent
- Based on deterministic composition (not random AI images)

### Lume AI **is not:**
- A design editor from scratch
- A UI redesign tool
- A complex marketing platform
- An image generation tool (DALL·E style)

Lume AI enhances what you already have using structured AI intent and proven templates.

---

## 📦 Current Features

- ✅ Screenshot upload (PNG, JPG, multiple files)
- ✅ AI-powered app analysis
- ✅ Automatic project/workspace creation
- ✅ Interactive canvas editor (70% slide panel)
- ✅ Multi-screen management
- ✅ Layer-based composition
- ✅ Text editing with full formatting
- ✅ Color customization
- ✅ Drag-and-drop positioning
- ✅ Zoom (25%-200%) and pan controls
- ✅ Real-time preview

---

## 🎯 Target Users

- Indie developers launching iOS apps
- Mobile app founders needing quick App Store assets
- Startups with limited design resources
- Developers who want professional visuals without hiring a designer
- Teams needing consistent, reproducible screenshot designs

---

## 📍 Roadmap

### Phase 1: PoC ✅ (Current)
- [x] AI chat workflow
- [x] Project auto-creation
- [x] Screenshot upload
- [x] Canvas editor
- [x] Layer management

### Phase 2: OpenAI Integration
- [ ] Connect GPT-4 API
- [ ] Zod schema validation
- [ ] Structured JSON responses
- [ ] Error handling & retries

### Phase 3: Export System
- [ ] Playwright server-side rendering
- [ ] Sharp image processing
- [ ] Multi-size generation (6.7", 6.5", iPad)
- [ ] ZIP download with all sizes

### Phase 4: Production Features
- [ ] User authentication (Clerk/Auth.js)
- [ ] Database persistence (Postgres)
- [ ] Cloud storage (Cloudflare R2)
- [ ] Template library (10+ layouts)
- [ ] Device mockup overlays
- [ ] Android/Play Store support
- [ ] Collaboration tools

### Phase 5: Advanced Features
- [ ] Multiple layout variations per screenshot
- [ ] A/B testing recommendations
- [ ] Localization support
- [ ] Video screenshot previews
- [ ] Expo/EAS integration

---

## 🌍 Philosophy

> **Design should not block shipping.**

> **AI never draws pixels. AI produces structured intent. Your system turns that intent into App Store screenshots.**

Lume AI removes friction between building an app and launching it. It uses deterministic templates driven by AI intelligence, not random image generation.

---

## 🔧 Development

### Project Structure

```
lumeai/
├── app/
│   ├── dashboard/
│   │   ├── chat/[chatId]/     # Dynamic chat routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Landing page
├── components/
│   ├── chat-input.tsx         # Chat interface with AI
│   ├── chat-conversation.tsx  # Message display & screenshot uploader
│   ├── design-canvas.tsx      # Canvas editor with layers
│   ├── app-sidebar.tsx        # Dynamic workspace sidebar
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── ai-helpers.ts          # AI utilities & OpenAI integration
│   └── utils.ts
├── public/
│   └── images/
├── Claude.md                  # System design specifications
├── POC_GUIDE.md              # Implementation guide
└── README.md
```

### Key Files

- **`components/chat-input.tsx`**: Chat system with AI response generation
- **`components/chat-conversation.tsx`**: Message display with screenshot upload UI
- **`components/design-canvas.tsx`**: Canvas editor with layer management
- **`lib/ai-helpers.ts`**: OpenAI integration, schemas, template resolution

---

## 💳 Pricing Model (Future)

Lume AI will use a **pay-per-use** model:

- Pay only when you generate and export screenshots
- No subscriptions required
- Simple credit-based usage
- Free tier for testing

---

## 📄 License

This project is proprietary.  
All rights reserved © Lume AI.

---

## 🔗 Links

- Website: Coming soon  
- Documentation: See POC_GUIDE.md
- API Docs: Coming soon

---

## 🤝 Contributing

This is currently a private PoC. For questions or collaboration inquiries, please contact the team.

---

**Lume AI**  
*From screenshots to store-ready, in minutes.*

Built with ❤️ using modern web technologies and AI-powered workflows.

---

For detailed implementation information, see [POC_GUIDE.md](./POC_GUIDE.md).
