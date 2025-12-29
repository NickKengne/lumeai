"use client"

import * as React from "react"
import { Paperclip, Globe, ArrowUp, Library, Wand2, Image, X } from "lucide-react"
import { ChatConversation } from "./chat-conversation"
import { useRouter } from "next/navigation"

const placeholderTexts = [
  "Ask, search, or make anything...",
  "Generate store assets...",
  "Create a marketing strategy...",
  "Design app screenshots...",
  "Write product descriptions...",
]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatInputProps {
  chatId?: string
  initialMessages?: Message[]
}

export function ChatInput({ chatId, initialMessages = [] }: ChatInputProps) {
  const router = useRouter()
  const [value, setValue] = React.useState("")
  const [placeholder, setPlaceholder] = React.useState("")
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0)
  const [currentCharIndex, setCurrentCharIndex] = React.useState(0)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showMentionPopover, setShowMentionPopover] = React.useState(false)
  const [showBanner, setShowBanner] = React.useState(true)
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [isThinking, setIsThinking] = React.useState(false)
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

  const handleSubmit = async () => {
    if (value.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: value.trim(),
        timestamp: new Date()
      }
      
      // If no chatId, create new chat and redirect from dashboard
      if (!chatId) {
        const newChatId = Date.now().toString()
        // Store message in localStorage temporarily
        localStorage.setItem(`chat-${newChatId}`, JSON.stringify([userMessage]))
        router.push(`/dashboard/chat/${newChatId}`)
        return
      }
      
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setValue("")
      setIsThinking(true)
      
      // Save to localStorage
      localStorage.setItem(`chat-${chatId}`, JSON.stringify(updatedMessages))
      
      // Simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: generateAIResponse(userMessage.content),
          timestamp: new Date()
        }
        const finalMessages = [...updatedMessages, aiMessage]
        setMessages(finalMessages)
        setIsThinking(false)
        
        // Save AI response to localStorage
        localStorage.setItem(`chat-${chatId}`, JSON.stringify(finalMessages))
      }, 2000 + Math.random() * 2000) // Random delay between 2-4 seconds
    }
  }

  const generateAIResponse = (userInput: string): string => {
    // Simple mock AI responses based on keywords
    const input = userInput.toLowerCase()
    
    if (input.includes("screenshot") || input.includes("design")) {
      return "I can help you create stunning app screenshots! I'll generate multiple variations with different layouts, backgrounds, and device mockups. What style are you looking for - minimal, bold, or professional?"
    } else if (input.includes("marketing") || input.includes("strategy")) {
      return "I'll help you craft a comprehensive marketing strategy. Let's focus on your target audience, unique value proposition, and channels. What's your app's main benefit to users?"
    } else if (input.includes("description") || input.includes("copy")) {
      return "I'll write compelling copy that converts! I can create app descriptions, feature highlights, and promotional text. Would you like me to focus on benefits, features, or a storytelling approach?"
    } else {
      return `I understand you're interested in "${userInput}". I'm here to help you create amazing app store assets! I can generate screenshots, write descriptions, plan marketing strategies, and much more. What would you like to start with?`
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
      <ChatConversation messages={messages} isThinking={isThinking} />

      <div className="relative rounded-4xl border border-neutral-200 bg-white">
        {/* Top bar - Mention & Add context */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2"> 
          <button className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
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
            className="w-full min-h-[60px] max-h-[200px] resize-none border-0 p-0 text-base text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
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