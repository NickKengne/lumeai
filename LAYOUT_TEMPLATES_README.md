# Layout Templates & iPhone Mockup Variants

## Overview
This document describes the new layout template system and iPhone mockup variants that provide variety and customization for App Store screenshot generation.

## 🎨 Layout Templates

### 4 Different Layout Types

#### 1. **Centered Layout** (Default)
- **Description**: Text above, phone centered
- **Best for**: Balanced, professional presentations
- **Positioning**:
  - Screenshot: Center (x: 371, y: 900)
  - Headline: Top center (y: 300)
  - Subtitle: Below headline (y: 420)
  - Logo: Top-left corner

#### 2. **Top Text Layout**
- **Description**: Text at top, large phone below
- **Best for**: Feature-focused presentations with prominent UI
- **Positioning**:
  - Screenshot: Lower center, larger size (y: 1100)
  - Headline: Top of canvas (y: 200)
  - Subtitle: Below headline (y: 340)
  - Logo: Between text and phone (y: 500)

#### 3. **Bottom Text Layout**
- **Description**: Large phone at top, text below
- **Best for**: Showcasing full-screen app experiences
- **Positioning**:
  - Screenshot: Upper portion, large (y: 300)
  - Headline: Bottom area (y: 1750)
  - Subtitle: Below headline (y: 1900)
  - Logo: At bottom (y: 2100)

#### 4. **Side by Side Layout**
- **Description**: Phone on left, text on right
- **Best for**: Text-heavy descriptions, feature comparisons
- **Positioning**:
  - Screenshot: Left side (x: 100, y: 800)
  - Headline: Right side (x: 750)
  - Subtitle: Below headline on right
  - Logo: Top right area

## 📱 iPhone Mockup Variants

### 4 Different Frame Styles

Each screen automatically cycles through different iPhone frame styles to add visual variety:

#### 1. **Default** (Light Grey)
- Classic light grey iPhone frame
- Matches iOS design guidelines
- Best for: Light backgrounds

#### 2. **Black** (Dark/Midnight)
- Sleek black iPhone frame
- Professional and modern
- Best for: Dark or vibrant backgrounds

#### 3. **Minimal** (Ultra-light)
- Very light, almost white frame
- Clean and minimal aesthetic
- Best for: Minimalist designs

#### 4. **Shadow** (With Drop Shadow)
- Standard frame with prominent shadow
- Adds depth and dimension
- Best for: Floating effect on any background

## 🔄 How It Works

### Automatic Layout Assignment
When you upload multiple screenshots, each screen is automatically assigned:
- A layout type (cycled through 4 types)
- A mockup variant (cycled through 4 styles)

**Example for 4 screenshots:**
1. Screen 1: Centered + Default frame
2. Screen 2: Top Text + Black frame
3. Screen 3: Bottom Text + Minimal frame
4. Screen 4: Side by Side + Shadow frame

### Manual Layout Selection
Users can manually change the layout by:
1. Opening the canvas editor
2. Selecting a screen
3. Clicking on one of the 4 layout template buttons
4. Clicking on one of the 4 frame style buttons

## 🎯 Empty Screenshot Fix

### Problem
Screenshots were appearing empty in the canvas editor because the `content` property wasn't being properly passed to the `IphoneMockup` component.

### Solution
1. Added debug indicator when screenshot content is missing
2. Ensured `layer.content` (data URL) is always passed to mockup
3. Added fallback template system when AI generation fails
4. Improved error handling in layout generation

### Visual Indicator
When a screenshot is missing, users now see:
```
┌─────────────────┐
│                 │
│  No screenshot  │
│                 │
└─────────────────┘
```

## 🚀 Usage in Code

### Applying a Layout Template
```typescript
applyLayoutTemplate('centered')
applyLayoutTemplate('topText')
applyLayoutTemplate('bottomText')
applyLayoutTemplate('sideBySide')
```

### Changing Mockup Variant
```typescript
updateMockupVariant('default')
updateMockupVariant('black')
updateMockupVariant('minimal')
updateMockupVariant('shadow')
```

### Creating Layers with Layout
```typescript
const layout = await generateLayoutForScreenshot(
  screenshot,
  userPrompt,
  logo,
  index // Layout type based on index
)

const layers = createLayersFromAILayout(
  layout,
  screenshot,
  logo,
  index // Mockup variant based on index
)
```

## 📐 Canvas Dimensions

All layouts use standard iPhone 14 Pro Max dimensions:
- **Canvas**: 1242px × 2688px
- **Phone mockup**: ~450-600px wide (varies by layout)
- **Aspect ratio**: ~1.82:1 (optimal for App Store)

## 🎨 Design Principles

### Layout Selection
- **Centered**: Universal, works for all app types
- **Top Text**: Content-first, showcase UI
- **Bottom Text**: UI-first, minimal text
- **Side by Side**: Information-rich, detailed features

### Frame Selection
- **Default**: Professional, neutral
- **Black**: Premium, modern
- **Minimal**: Clean, unobtrusive
- **Shadow**: Dynamic, prominent

## 🔧 Customization

Users can customize:
1. **Layout positioning** - via template selector
2. **Phone frame style** - via mockup variant selector
3. **Background colors** - via color picker
4. **Text content** - via properties panel
5. **Element positions** - via drag & drop

## 📝 Notes

- Layout templates are applied to existing elements (non-destructive)
- Mockup variants only affect the phone frame appearance
- Screenshots inside mockups are always preserved
- Each screen can have a different layout and frame style
- Changes are instant and reversible

