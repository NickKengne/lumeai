"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Copy, RotateCcw, Share2, Check, Sparkles } from "lucide-react"
import { DesignCanvas } from "./design-canvas"
import { motion, AnimatePresence } from "motion/react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatConversationProps {
  messages: Message[]
  isThinking?: boolean
  onPanelOpenChange?: (isOpen: boolean) => void
}

export function ChatConversation({ messages, isThinking, onPanelOpenChange }: ChatConversationProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = React.useState(false)
  const [selectedPrompt, setSelectedPrompt] = React.useState<string>("")

  React.useEffect(() => {
    onPanelOpenChange?.(isPanelOpen)
  }, [isPanelOpen, onPanelOpenChange])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isThinking])

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleShare = async (content: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: content,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    }
  }

  const handleRefresh = (messageId: string) => {
    // TODO: Implement message refresh logic
    console.log("Refresh message:", messageId)
  }

  const handleOpenDesignTool = (content: string) => {
    setSelectedPrompt(content)
    setIsPanelOpen(true)
  }

  const isDesignRelated = (content: string): boolean => {
    const keywords = ['screenshot', 'design', 'generate', 'create', 'app store', 'visual', 'mockup', 'image']
    return keywords.some(keyword => content.toLowerCase().includes(keyword))
  }

  if (messages.length === 0 && !isThinking) {
    return null
  }

  return (
    <div className="flex w-full h-full overflow-hidden relative">
      {/* Main Content - Slides LEFT when panel opens */}
      <motion.div
        animate={{ 
          marginRight: isPanelOpen ? "70%" : "0%"
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full overflow-y-auto"
      >
        <div className="w-full max-w-3xl mx-auto space-y-4 mb-6 px-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex flex-col gap-1",
              message.role === "user" ? "items-end" : "items-start"
            )}
          >
            <div
              className={cn(
                "rounded-2xl px-4 py-3 max-w-[85%]",
                message.role === "user"
                  ? "bg-neutral-100 text-neutral-600"
                  : "text-neutral-600"
              )}
            >
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              
              {/* Show design tool button for design-related user messages */}
              {message.role === "user" && isDesignRelated(message.content) && (
                <button
                  onClick={() => handleOpenDesignTool(message.content)}
                  className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-neutral-800 text-white text-xs rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Open Design Tool
                </button>
              )}
            </div>
            
            {/* Action buttons */}
            <div className={cn(
              "flex items-center gap-2 px-1",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}>
              <button
                onClick={() => handleCopy(message.content, message.id)}
                className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                title="Copy"
              >
                {copiedId === message.id ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
              
              {message.role === "user" ? (
                <button
                  onClick={() => handleRefresh(message.id)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                  title="Refresh"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => handleShare(message.content)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                  title="Share"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

          {isThinking && <ThinkingAnimation />}
          
          <div ref={messagesEndRef} />
        </div>
      </motion.div>

      {/* Design Canvas - Slides in from right, 70% width */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 h-full w-[70%] z-50"
          >
            <DesignCanvas 
              onClose={() => setIsPanelOpen(false)}
              userPrompt={selectedPrompt}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ThinkingAnimation() {
  return (
    <div className="flex items-start justify-start">
      <div className="py-2">
        <span className="shimmer-text text-[15px]  text-neutral-700">
          Exploring
        </span>
      </div>
    </div>
  )
}

