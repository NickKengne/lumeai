"use client"

import * as React from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ColorPalette, FontSelector } from './color-swatch'
import { ThinkingSteps } from './thinking-animation'

interface FormattedMessageProps {
  content: string
  isStreaming?: boolean
  analysisData?: {
    dominantColors?: string[]
    backgroundsWithTextColors?: Array<{ background: string; textColor: string }>
    detectedFonts?: string[]
  }
  selectedBackground?: number
  selectedFont?: string
  onBackgroundSelect?: (index: number) => void
  onFontSelect?: (font: string) => void
}

export function FormattedMessage({ 
  content, 
  isStreaming = false,
  analysisData,
  selectedBackground,
  selectedFont,
  onBackgroundSelect,
  onFontSelect
}: FormattedMessageProps) {
  // Check if this is a thinking/exploring message
  const isThinking = content.startsWith('__THINKING__')
  
  // Check if this is an analysis message
  const isAnalysisMessage = content.includes('## 🎨 Screenshot Analysis Complete') || 
                           content.includes('Dominant Colors Extracted')
  
  // Extract the text content without the color/font sections if it's an analysis message
  const getContentWithoutColorSections = (text: string) => {
    if (!isAnalysisMessage) return text
    
    // Remove the sections that will be replaced with interactive components
    let cleaned = text
      .replace(/### Dominant Colors Extracted[\s\S]*?(?=###|$)/g, '')
      .replace(/### Background Variations for App Store[\s\S]*?(?=###|$)/g, '')
      .replace(/### Typography Recommendations[\s\S]*?(?=###|$)/g, '')
    
    return cleaned
  }
  // Parse thinking data if present
  let thinkingData = null
  if (isThinking) {
    try {
      const jsonStr = content.replace('__THINKING__', '')
      thinkingData = JSON.parse(jsonStr)
    } catch (e) {
      console.error('Failed to parse thinking data:', e)
    }
  }

  const displayContent = isAnalysisMessage ? getContentWithoutColorSections(content) : content

  // If thinking, show thinking animation
  if (isThinking && thinkingData) {
    return (
      <div className="prose prose-neutral prose-sm max-w-none">
        <div className="flex items-start gap-3 py-2">
          <div className="flex-1">
            <p className="text-sm text-neutral-600 mb-3">Exploring your screenshots</p>
            <ThinkingSteps 
              steps={thinkingData.steps} 
              currentStep={thinkingData.currentStep}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="prose prose-neutral prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-neutral-900 mt-6 mb-3" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-neutral-900 mt-5 mb-2.5" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-neutral-800 mt-4 mb-2" {...props} />,
          
          // Paragraphs
          p: ({ node, ...props }) => <p className="text-[15px] text-neutral-700 leading-relaxed my-1.5" {...props} />,
          
          // Lists
          ul: ({ node, ...props }) => <ul className="space-y-1 ml-4 my-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="space-y-1 ml-4 my-2 list-decimal" {...props} />,
          li: ({ node, ...props }) => (
            <li className="text-neutral-700 text-[15px] flex items-start gap-2" {...props}>
              {props.children}
            </li>
          ),
          
          // Code
          code: ({ node, inline, ...props }: any) => 
            inline ? (
              <code className="px-1.5 py-0.5 bg-neutral-100 text-neutral-800 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="block px-4 py-3 bg-neutral-100 text-neutral-800 rounded-lg text-sm font-mono overflow-x-auto my-2" {...props} />
            ),
          
          // Links
          a: ({ node, ...props }) => (
            <a className="text-neutral-800 underline hover:text-neutral-600" {...props} />
          ),
          
          // Horizontal rule
          hr: ({ node, ...props }) => <hr className="my-4 border-neutral-200" {...props} />,
          
          // Strong/Bold
          strong: ({ node, ...props }) => <strong className="font-semibold text-neutral-900" {...props} />,
          
          // Emphasis/Italic
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          
          // Blockquote
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-neutral-300 pl-4 italic text-neutral-600 my-2" {...props} />
          ),
        }}
      >
        {displayContent}
      </ReactMarkdown>
      
      {/* Render interactive color/font selection for analysis messages */}
      {isAnalysisMessage && analysisData && !isStreaming && (
        <>
          {/* Dominant Colors */}
          {analysisData.dominantColors && analysisData.dominantColors.length > 0 && (
            <ColorPalette
              colors={analysisData.dominantColors}
              labels={analysisData.dominantColors.map((_, idx) => 
                idx === 0 ? 'Primary' : idx === 1 ? 'Secondary' : 'Accent'
              )}
              title="Dominant Colors Extracted"
              type="dominant"
            />
          )}
          
          {/* Background Variations */}
          {analysisData.backgroundsWithTextColors && analysisData.backgroundsWithTextColors.length > 0 && (
            <ColorPalette
              colors={analysisData.backgroundsWithTextColors.map(item => item.background)}
              textColors={analysisData.backgroundsWithTextColors.map(item => item.textColor)}
              labels={analysisData.backgroundsWithTextColors.map((item, idx) => {
                const brightness = item.textColor === '#FFFFFF' ? 'Dark' : 'Light'
                return brightness
              })}
              title="Background Variations for App Store"
              type="background"
              selectedIndex={selectedBackground}
              onSelect={onBackgroundSelect}
            />
          )}
          
          {/* Font Selection */}
          {analysisData.detectedFonts && analysisData.detectedFonts.length > 0 && (
            <FontSelector
              fonts={analysisData.detectedFonts}
              selectedFont={selectedFont}
              onSelect={onFontSelect}
            />
          )}
        </>
      )}
      
      {isStreaming && (
        <span className="inline-block w-1 h-4 bg-neutral-800 animate-pulse ml-1" />
      )}
    </div>
  )
}

