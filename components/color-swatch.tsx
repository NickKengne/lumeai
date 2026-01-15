"use client"

import * as React from "react"
import { Check } from "lucide-react"

interface ColorSwatchProps {
  color: string
  label?: string
  textColor?: string
  selected?: boolean
  onClick?: () => void
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

export function ColorSwatch({ 
  color, 
  label, 
  textColor, 
  selected = false, 
  onClick,
  showLabel = true,
  size = "md" 
}: ColorSwatchProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={`${sizeClasses[size]} rounded transition-all relative group ${
          selected 
            ? "ring-1 ring-neutral-400 scale-[1.02]" 
            : "ring-1 ring-neutral-200 hover:ring-neutral-300"
        }`}
        style={{ backgroundColor: color }}
        title={`${color}${textColor ? ` → Text: ${textColor}` : ''}`}
      >
        {/* Show check mark if selected */}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
              <Check className="h-3.5 w-3.5 text-neutral-700" strokeWidth={2.5} />
            </div>
          </div>
        )}
        
        {/* Show text color preview on hover */}
        {textColor && !selected && (
          <div 
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="text-xs font-normal" style={{ color: textColor }}>
              Aa
            </div>
          </div>
        )}
      </button>
      
      {showLabel && (
        <div className="text-center">
          <p className="text-[11px] font-mono text-neutral-600">{color}</p>
          {textColor && (
            <p className="text-[10px] text-neutral-400 mt-0.5">
              {textColor}
            </p>
          )}
          {label && (
            <p className="text-[10px] text-neutral-400 mt-0.5">{label}</p>
          )}
        </div>
      )}
    </div>
  )
}

interface ColorPaletteProps {
  colors: string[]
  labels?: string[]
  title?: string
  type?: "dominant" | "background"
  textColors?: string[]
  selectedIndex?: number
  onSelect?: (index: number) => void
}

export function ColorPalette({ 
  colors, 
  labels, 
  title, 
  type = "dominant",
  textColors,
  selectedIndex,
  onSelect
}: ColorPaletteProps) {
  return (
    <div className="my-6">
      {title && (
        <h4 className="text-sm font-normal text-neutral-700 mb-4">{title}</h4>
      )}
      
      <div className="flex flex-wrap gap-4">
        {colors.map((color, idx) => (
          <ColorSwatch
            key={idx}
            color={color}
            label={labels?.[idx]}
            textColor={type === "background" ? textColors?.[idx] : undefined}
            selected={selectedIndex === idx}
            onClick={onSelect ? () => onSelect(idx) : undefined}
            size={type === "background" ? "md" : "sm"}
          />
        ))}
      </div>
      
      {type === "background" && onSelect && (
        <p className="text-xs text-neutral-400 mt-4">
          Click a background color to use it for all screenshots
        </p>
      )}
    </div>
  )
}

interface FontSelectorProps {
  fonts: string[]
  selectedFont?: string
  onSelect?: (font: string) => void
}

export function FontSelector({ fonts, selectedFont, onSelect }: FontSelectorProps) {
  return (
    <div className="my-6">
      <h4 className="text-sm font-normal text-neutral-700 mb-4">Typography</h4>
      
      <div className="space-y-2">
        {fonts.map((font, idx) => (
          <button
            key={idx}
            onClick={() => onSelect?.(font)}
            className={`w-full text-left px-4 py-3.5 rounded transition-all ${
              selectedFont === font
                ? "ring-1 ring-neutral-400 bg-neutral-50"
                : "ring-1 ring-neutral-200 hover:ring-neutral-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span 
                className="text-base font-normal"
                style={{ fontFamily: font }}
              >
                {font}
              </span>
              {selectedFont === font && (
                <Check className="h-4 w-4 text-neutral-600" strokeWidth={2} />
              )}
            </div>
            <p 
              className="text-sm text-neutral-500 mt-1.5"
              style={{ fontFamily: font }}
            >
              The quick brown fox jumps over the lazy dog
            </p>
          </button>
        ))}
      </div>
      
      {onSelect && (
        <p className="text-xs text-neutral-400 mt-4">
          Select a font to use in your screenshots
        </p>
      )}
    </div>
  )
}

