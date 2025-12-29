"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Copy, RotateCcw, Share2, Check } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatConversationProps {
  messages: Message[]
  isThinking?: boolean
}

export function ChatConversation({ messages, isThinking }: ChatConversationProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

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

  if (messages.length === 0 && !isThinking) {
    return null
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 mb-6">
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

