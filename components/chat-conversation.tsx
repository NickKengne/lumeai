"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Copy, RotateCcw, Share2, Check, Sparkles, Upload, X } from "lucide-react"
import { DesignCanvas } from "./design-canvas"
import { motion, AnimatePresence } from "motion/react"
import { FormattedMessage } from "./formatted-message"
import { generateMockStructure, hasOpenAIKey, generateScreenshotStructure } from "@/lib/openai-stream"
import type { AIResponse, PromptAnalysis } from "@/lib/ai-helpers"
import { analyzeUserPrompt } from "@/lib/ai-helpers"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  screenshots?: string[]
  isStreaming?: boolean
}

interface ChatConversationProps {
  messages: Message[]
  onPanelOpenChange?: (isOpen: boolean) => void
  onScreenshotsUpload?: (screenshots: string[]) => void
}

export function ChatConversation({ messages, onPanelOpenChange, onScreenshotsUpload }: ChatConversationProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = React.useState(false)
  const [selectedPrompt, setSelectedPrompt] = React.useState<string>("")
  const [uploadedScreenshots, setUploadedScreenshots] = React.useState<string[]>([])
  const [showUploader, setShowUploader] = React.useState(false)
  const [aiStructure, setAiStructure] = React.useState<AIResponse | undefined>(undefined)
  const [promptAnalysis, setPromptAnalysis] = React.useState<PromptAnalysis | undefined>(undefined)
  const [isGeneratingStructure, setIsGeneratingStructure] = React.useState(false)
  const [panelWidth, setPanelWidth] = React.useState("70%")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Update panel width based on screen size
  React.useEffect(() => {
    const updatePanelWidth = () => {
      if (typeof window === 'undefined') return
      
      const width = window.innerWidth
      if (width < 640) {
        setPanelWidth("90%")
      } else if (width < 768) {
        setPanelWidth("85%")
      } else if (width < 1024) {
        setPanelWidth("75%")
      } else if (width < 1280) {
        setPanelWidth("70%")
      } else {
        setPanelWidth("65%")
      }
    }

    updatePanelWidth()
    window.addEventListener('resize', updatePanelWidth)
    return () => window.removeEventListener('resize', updatePanelWidth)
  }, [])

  React.useEffect(() => {
    onPanelOpenChange?.(isPanelOpen)
  }, [isPanelOpen, onPanelOpenChange])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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

  const handleOpenDesignTool = async (content: string, screenshots?: string[]) => {
    setSelectedPrompt(content)
    if (screenshots && screenshots.length > 0) {
      setUploadedScreenshots(screenshots)
      
      // Generate AI structure and prompt analysis before opening canvas
      setIsGeneratingStructure(true)
      try {
        // First, analyze the prompt with Gemini
        console.log("🔍 Analyzing user prompt with Gemini...")
        const analysis = await analyzeUserPrompt(content)
        setPromptAnalysis(analysis)
        console.log("✅ Prompt analysis complete:", analysis)
        
        // Then generate structure with OpenAI (enhanced with analysis)
        console.log("🎨 Generating screenshot structure...")
        const structure = hasOpenAIKey() 
          ? await generateScreenshotStructure(content, undefined, analysis)
          : generateMockStructure(content)
        setAiStructure(structure)
        console.log("✅ Structure generation complete:", structure)
      } catch (error) {
        console.error('Failed to generate structure or analysis:', error)
        // Fallback to mock
        setAiStructure(generateMockStructure(content))
      }
      setIsGeneratingStructure(false)
    }
    setIsPanelOpen(true)
  }

  const isDesignRelated = (content: string): boolean => {
    const keywords = ['screenshot', 'design', 'generate', 'create', 'app store', 'visual', 'mockup', 'image']
    return keywords.some(keyword => content.toLowerCase().includes(keyword))
  }

  const shouldShowUploader = (message: Message): boolean => {
    // Show uploader for assistant messages that are design-related
    if (message.role !== 'assistant') return false
    
    // Check if it's the last assistant message
    const lastAssistantIndex = messages.map(m => m.role).lastIndexOf('assistant')
    const currentIndex = messages.findIndex(m => m.id === message.id)
    
    return currentIndex === lastAssistantIndex && isDesignRelated(message.content)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          urls.push(result)
          if (urls.length === files.length) {
            setUploadedScreenshots(prev => [...prev, ...urls])
            onScreenshotsUpload?.(urls)
          }
        }
        reader.readAsDataURL(file)
      }
    }
    setShowUploader(false)
  }

  const handleRemoveScreenshot = (index: number) => {
    setUploadedScreenshots(prev => prev.filter((_, i) => i !== index))
  }

  if (messages.length === 0 ) {
    return null
  }

  return (
    <div className="w-full h-full overflow-hidden relative">
      {/* Main Content - Shrinks when panel opens */}
      <motion.div
        animate={{ 
          width: isPanelOpen ? `calc(100% - ${panelWidth})` : "100%"
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="h-full overflow-y-auto"
      >
        <div className={`w-full mx-auto space-y-4 py-6 px-2 sm:px-4 ${isPanelOpen ? 'max-w-2xl' : 'max-w-3xl'}`}>
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
                "rounded-2xl px-3 sm:px-4 py-3 max-w-[90%] sm:max-w-[85%]",
                message.role === "user"
                  ? "bg-neutral-100 text-neutral-600"
                  : "text-neutral-600"
              )}
            >
              {/* Render formatted message for assistant */}
              {message.role === "assistant" ? (
                <FormattedMessage 
                  content={message.content} 
                  isStreaming={message.isStreaming}
                />
              ) : (
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              )}
              
              {/* Show upload button for design-related messages */}
              {shouldShowUploader(message) && (
                <div className="mt-4 space-y-3">
                  {uploadedScreenshots.length === 0 && !showUploader && (
                    <button
                      onClick={() => setShowUploader(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg hover:bg-neutral-700 transition-colors w-full justify-center"
                    >
                      <Upload className="h-4 w-4" />
                      Upload App Screenshots
                    </button>
                  )}
                  
                  {showUploader && (
                    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-neutral-400 transition-colors cursor-pointer">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                        <p className="text-sm text-neutral-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-neutral-400 mt-1">PNG, JPG up to 10MB</p>
                      </button>
                    </div>
                  )}

                  {uploadedScreenshots.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-neutral-500">Uploaded Screenshots ({uploadedScreenshots.length})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {uploadedScreenshots.map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img 
                              src={url} 
                              alt={`Screenshot ${idx + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-neutral-200"
                            />
                            <button
                              onClick={() => handleRemoveScreenshot(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleOpenDesignTool(message.content, uploadedScreenshots)}
                        disabled={isGeneratingStructure}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg hover:bg-neutral-700 transition-colors w-full justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="h-4 w-4" />
                        {isGeneratingStructure ? 'Generating Structure...' : 'Generate App Store Screenshots'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              
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

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </motion.div>

      {/* Design Canvas - Slides in from right */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{ width: panelWidth }}
            className="absolute right-0 top-0 bottom-0 h-full z-40 border-l border-neutral-200"
          >
            <DesignCanvas 
              onClose={() => setIsPanelOpen(false)}
              userPrompt={selectedPrompt}
              uploadedScreenshots={uploadedScreenshots}
              aiStructure={aiStructure}
              promptAnalysis={promptAnalysis}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

