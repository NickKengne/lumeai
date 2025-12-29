"use client"

import * as React from "react"
import { Paperclip, Globe, ArrowUp, Library, Wand2, Image, X } from "lucide-react"

const placeholderTexts = [
  "Ask, search, or make anything...",
  "Generate store assets...",
  "Create a marketing strategy...",
  "Design app screenshots...",
  "Write product descriptions...",
]

export function ChatInput() {
  const [value, setValue] = React.useState("")
  const [placeholder, setPlaceholder] = React.useState("")
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0)
  const [currentCharIndex, setCurrentCharIndex] = React.useState(0)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showMentionPopover, setShowMentionPopover] = React.useState(false)
  const [showBanner, setShowBanner] = React.useState(true)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Typewriter effect
  React.useEffect(() => {
    const currentText = placeholderTexts[currentTextIndex]
    const typingSpeed = isDeleting ? 30 : 80
    const pauseTime = 2000

    const timer = setTimeout(() => {
      if (!isDeleting && currentCharIndex < currentText.length) {
        setPlaceholder(currentText.substring(0, currentCharIndex + 1))
        setCurrentCharIndex(currentCharIndex + 1)
      } else if (isDeleting && currentCharIndex > 0) {
        setPlaceholder(currentText.substring(0, currentCharIndex - 1))
        setCurrentCharIndex(currentCharIndex - 1)
      } else if (!isDeleting && currentCharIndex === currentText.length) {
        setTimeout(() => setIsDeleting(true), pauseTime)
      } else if (isDeleting && currentCharIndex === 0) {
        setIsDeleting(false)
        setCurrentTextIndex((currentTextIndex + 1) % placeholderTexts.length)
      }
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [currentCharIndex, currentTextIndex, isDeleting])

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  const handleSubmit = () => {
    if (value.trim()) {
      console.log("Submitted:", value)
      setValue("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">

      <div className="relative rounded-4xl border border-neutral-200 bg-white">
        {/* Top bar - Mention & Add context */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2"> 
          <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <span className="mr-1">@</span>
            Add context
          </button>
        </div>

        {/* Textarea */}
        <div className="relative px-4 mt-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask me anything..."}
            rows={1}
            className="w-full min-h-[60px] max-h-[200px] resize-none border-0 p-0 text-base text-gray-900 placeholder:text-zinc-400 focus:outline-none"
          />
        </div>

        {/* Bottom bar - Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100">
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Paperclip className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Image className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
              <Library className="h-4 w-4" />
              <span>Prompt Library</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
              <Wand2 className="h-4 w-4" />
              <span>Improve Prompt</span>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
              value.trim()
                ? "bg-black text-white cursor-pointer hover:bg-gray-800"
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            }`}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}