/**
 * App Store Screenshot Layout Templates
 * ONE default template with alternating screen configurations
 */

export interface LayoutTemplate {
  id: string
  name: string
  category: 'minimal' | 'bold' | 'elegant' | 'playful' | 'dark' | 'modern'
  backgroundColor: string
  textColor: string
  // iPhone mockup positioning (307x622)
  mockup: {
    x: number
    y: number
    width: number
    height: number
  }
  // Title positioning
  title: {
    x: number
    y: number
    width: number
    height: number
    fontSize: number
    align: 'left' | 'center' | 'right'
  }
  // Subtitle positioning
  subtitle: {
    x: number
    y: number
    width: number
    height: number
    fontSize: number
    align: 'left' | 'center' | 'right'
  }
  logo?: {
    x: number
    y: number
    size: number
  }
  preview: string
}

// Screen configurations for the default template
const SCREEN_CONFIGS = [
  // Config A: screens 1, 3, 5
  {
    mockup: { x: 34, y: 245, width: 307, height: 622 },
    title: { x: 26, y: 45, width: 300, height: 50, fontSize: 34, align: 'left' as const },
    subtitle: { x: 26, y: 118, width: 340, height: 20, fontSize: 16, align: 'left' as const }
  },
  // Config B: screens 2, 4
  {
    mockup: { x: 34, y: -66, width: 307, height: 622 },
    title: { x: 26, y: 612, width: 300, height: 50, fontSize: 34, align: 'left' as const },
    subtitle: { x: 26, y: 688, width: 340, height: 20, fontSize: 16, align: 'left' as const }
  }
]

// ONE default template
export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: 'default',
    name: 'Default',
    category: 'minimal',
    backgroundColor: '#F5F5F5',
    textColor: '#1A1A1A',
    mockup: { x: 468, y: 245, width: 307, height: 622 },
    title: { x: 26, y: 45, width: 300, height: 50, fontSize: 34, align: 'left' },
    subtitle: { x: 26, y: 100, width: 340, height: 20, fontSize: 16, align: 'left' },
    preview: 'Default app store layout'
  }
]

// Get template by ID
export function getTemplateById(id: string): LayoutTemplate | undefined {
  return LAYOUT_TEMPLATES.find(t => t.id === id)
}

// Get screen configuration by index (for alternating)
export function getScreenConfig(index: number) {
  return SCREEN_CONFIGS[index % 2]
}

// Generate layers from template with screen-specific config
export function generateLayersFromTemplate(
  template: LayoutTemplate,
  content: {
    screenshot: string
    headline: string
    subtitle?: string
    logo?: string
    textColor?: string
    fontFamily?: string
  },
  screenIndex: number = 0
) {
  const config = getScreenConfig(screenIndex)
  const layers = []
  
  // Background (solid color)
  layers.push({
    id: 'bg',
    type: 'background',
    content: '',
    x: 0,
    y: 0,
    width: 1242,
    height: 2688,
    backgroundColor: template.backgroundColor
  })
  
  // iPhone mockup with screenshot inside
  layers.push({
    id: 'mockup',
    type: 'mockup',
    content: content.screenshot,
    x: config.mockup.x,
    y: config.mockup.y,
    width: config.mockup.width,
    height: config.mockup.height
  })
  
  // Title - AI provides color and font
  layers.push({
    id: 'headline',
    type: 'text',
    content: content.headline,
    x: config.title.x,
    y: config.title.y,
    width: config.title.width,
    height: config.title.height,
    fontSize: config.title.fontSize,
    fontFamily: content.fontFamily || 'Lato, -apple-system, BlinkMacSystemFont, sans-serif',
    color: content.textColor || template.textColor,
    bold: true,
    align: config.title.align
  })
  
  // Subtitle - AI provides color and font
  if (content.subtitle) {
    layers.push({
      id: 'subtitle',
      type: 'text',
      content: content.subtitle,
      x: config.subtitle.x,
      y: config.subtitle.y,
      width: config.subtitle.width,
      height: config.subtitle.height,
      fontSize: config.subtitle.fontSize,
      fontFamily: content.fontFamily || 'Lato, -apple-system, BlinkMacSystemFont, sans-serif',
      color: content.textColor || template.textColor,
      bold: false,
      align: config.subtitle.align
    })
  }
  
  // Logo (optional)
  if (content.logo && template.logo) {
    layers.push({
      id: 'logo',
      type: 'image',
      content: content.logo,
      x: template.logo.x,
      y: template.logo.y,
      width: template.logo.size,
      height: template.logo.size
    })
  }
  
  return layers
}
