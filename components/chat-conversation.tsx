"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Copy, RotateCcw, Share2, Check, Sparkles, Upload, X, Video } from "lucide-react"
import { VideoGenerator } from "./video-generator"
import { DesignCanvas } from "./design-canvas"
import { motion, AnimatePresence } from "motion/react"
import { FormattedMessage } from "./formatted-message"
import { generateMockStructure, hasOpenAIKey, generateScreenshotStructure } from "@/lib/openai-stream"
import type { AIResponse, PromptAnalysis } from "@/lib/ai-helpers"
import { analyzeUserPrompt } from "@/lib/ai-helpers"
import { analyzeScreenshots, suggestTemplatesForMood, type ScreenshotAnalysisResult } from "@/lib/screenshot-analyzer"
import { AVAILABLE_TEMPLATES } from "@/lib/template-library"
import { saveChatToHistory, generateChatTitle, getChatById } from "@/lib/chat-storage"
import { useParams, useSearchParams } from "next/navigation"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  screenshots?: string[]
  logo?: string
  assets?: string[]
  isStreaming?: boolean
}

interface ChatConversationProps {
  messages: Message[]
  onPanelOpenChange?: (isOpen: boolean) => void
  onScreenshotsUpload?: (screenshots: string[]) => void
}

export function ChatConversation({ messages, onPanelOpenChange, onScreenshotsUpload }: ChatConversationProps) {
  const params = useParams()
  const searchParams = useSearchParams()
  const chatId = params?.chatId as string | undefined
  const workspaceId = searchParams?.get('workspace') || 'default'
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = React.useState(false)
  const [selectedPrompt, setSelectedPrompt] = React.useState<string>("")
  const [uploadedScreenshots, setUploadedScreenshots] = React.useState<string[]>([])
  const [uploadedLogo, setUploadedLogo] = React.useState<string>("")
  const [uploadedAssets, setUploadedAssets] = React.useState<string[]>([])
  const [showUploader, setShowUploader] = React.useState(false)
  const [showLogoUploader, setShowLogoUploader] = React.useState(false)
  const [showAssetsUploader, setShowAssetsUploader] = React.useState(false)
  const [aiStructure, setAiStructure] = React.useState<AIResponse | undefined>(undefined)
  const [promptAnalysis, setPromptAnalysis] = React.useState<PromptAnalysis | undefined>(undefined)
  const [isGeneratingStructure, setIsGeneratingStructure] = React.useState(false)
  const [isAnalyzingScreenshots, setIsAnalyzingScreenshots] = React.useState(false)
  const [screenshotAnalysis, setScreenshotAnalysis] = React.useState<ScreenshotAnalysisResult | null>(null)
  const [showLayoutPreview, setShowLayoutPreview] = React.useState(false)
  const [showVideoGenerator, setShowVideoGenerator] = React.useState(false)
  const [panelWidth, setPanelWidth] = React.useState(800)
  const [isResizing, setIsResizing] = React.useState(false)
  const resizeStartRef = React.useRef({ x: 0, width: 0 })
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const logoInputRef = React.useRef<HTMLInputElement>(null)
  const assetsInputRef = React.useRef<HTMLInputElement>(null)

  // Update panel width based on screen size
  React.useEffect(() => {
    const updatePanelWidth = () => {
      if (typeof window === 'undefined') return
      
      const width = window.innerWidth
      if (width < 640) {
        setPanelWidth(Math.min(width * 0.9, 500))
      } else if (width < 768) {
        setPanelWidth(Math.min(width * 0.85, 600))
      } else if (width < 1024) {
        setPanelWidth(Math.min(width * 0.75, 700))
      } else if (width < 1280) {
        setPanelWidth(Math.min(width * 0.70, 800))
      } else {
        setPanelWidth(Math.min(width * 0.65, 900))
      }
    }

    updatePanelWidth()
    window.addEventListener('resize', updatePanelWidth)
    return () => window.removeEventListener('resize', updatePanelWidth)
  }, [])

  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true)
    resizeStartRef.current = {
      x: e.clientX,
      width: panelWidth
    }
  }

  React.useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = resizeStartRef.current.x - e.clientX
      const newWidth = resizeStartRef.current.width + delta
      const minWidth = 400
      const maxWidth = window.innerWidth * 0.9
      setPanelWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)))
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  React.useEffect(() => {
    onPanelOpenChange?.(isPanelOpen)
  }, [isPanelOpen, onPanelOpenChange])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load existing chat data if navigating to an existing chat
  React.useEffect(() => {
    if (!chatId) return

    const existingChat = getChatById(chatId)
    if (existingChat) {
      if (existingChat.screenshots.length > 0) {
        setUploadedScreenshots(existingChat.screenshots)
      }
      if (existingChat.logo) {
        setUploadedLogo(existingChat.logo)
      }
      if (existingChat.assets.length > 0) {
        setUploadedAssets(existingChat.assets)
      }
    }
  }, [chatId])

  // Auto-save chat to history
  React.useEffect(() => {
    if (!chatId || messages.length === 0) return

    const saveChat = () => {
      const title = generateChatTitle(messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp
      })))

      saveChatToHistory({
        id: chatId,
        workspaceId: workspaceId,
        title,
        messages: messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp
        })),
        screenshots: uploadedScreenshots,
        logo: uploadedLogo,
        assets: uploadedAssets,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Notify sidebar to refresh
      window.dispatchEvent(new Event('chat-updated'))
    }

    // Debounce save
    const timeoutId = setTimeout(saveChat, 1000)
    return () => clearTimeout(timeoutId)
  }, [chatId, messages, uploadedScreenshots, uploadedLogo, uploadedAssets, workspaceId])

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
        
        // Then generate structure with OpenAI
        console.log("🎨 Generating screenshot structure...")
        const structure = hasOpenAIKey() 
          ? await generateScreenshotStructure(content)
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0] // Only one logo
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setUploadedLogo(result)
      }
      reader.readAsDataURL(file)
    }
    setShowLogoUploader(false)
  }

  const handleAssetsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setUploadedAssets(prev => [...prev, ...urls])
          }
        }
        reader.readAsDataURL(file)
      }
    }
    setShowAssetsUploader(false)
  }

  const handleRemoveLogo = () => {
    setUploadedLogo("")
  }

  const handleRemoveAsset = (index: number) => {
    setUploadedAssets(prev => prev.filter((_, i) => i !== index))
  }

  const handleAnalyzeAndSuggest = async () => {
    if (uploadedScreenshots.length === 0) return

    setIsAnalyzingScreenshots(true)

    try {
      // Analyze screenshots to extract colors and mood
      const analysis = await analyzeScreenshots(uploadedScreenshots)
      
      // Get suggested templates based on mood
      const suggestedTemplates = suggestTemplatesForMood(analysis.mood)
      
      setScreenshotAnalysis({
        ...analysis,
        suggestedTemplates
      })

      // Show layout preview
      setShowLayoutPreview(true)
    } catch (error: any) {
      console.error('Screenshot analysis failed:', error)
      
      // Check if it's a rate limit error
      const isRateLimitError = error?.message?.includes('429') || error?.message?.includes('Rate limit')
      
      // Fallback to basic color analysis (still works without AI)
      setScreenshotAnalysis({
        dominantColors: ['#F0F4FF', '#E0EAFF', '#D0E0FF'],
        suggestedBackgrounds: ['#F0F4FF', '#FFF0F5', '#F0FFF4'],
        mood: 'minimal',
        suggestedTemplates: ['centered_bold', 'minimal', 'gradient'],
        // Add a notice for rate limit errors
        ...(isRateLimitError && {
          typography: {
            primaryFont: 'Analysis limited due to API rate limit',
            fontStyle: 'modern',
            headlineSize: 'medium',
            textHierarchy: 'Using fallback basic analysis'
          }
        })
      })
      setShowLayoutPreview(true)
      
      // Show user-friendly error message
      if (isRateLimitError) {
        alert('⚠️ Google AI rate limit reached!\n\n' +
              'The AI analysis is temporarily unavailable. Using basic color detection instead.\n\n' +
              '💡 Tip: Wait a few minutes before analyzing more screenshots, or consider upgrading your Google AI API plan for higher limits.')
      }
    } finally {
      setIsAnalyzingScreenshots(false)
    }
  }

  if (messages.length === 0 ) {
    return null
  }

  return (
    <div 
      className="w-full h-full overflow-hidden relative"
      style={{ userSelect: isResizing ? 'none' : 'auto' }}
    >
      {/* Main Content - Shrinks when panel opens */}
      <motion.div
        animate={{ 
          width: isPanelOpen ? `calc(100% - ${panelWidth}px)` : "100%"
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
                    <div className="space-y-3">
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

                      {/* Logo Upload Section */}
                      <div className="pt-2 border-t border-neutral-200">
                        <p className="text-xs text-neutral-500 mb-2">App Logo (Optional)</p>
                        {!uploadedLogo && !showLogoUploader && (
                          <button
                            onClick={() => setShowLogoUploader(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-300 text-neutral-700 text-xs rounded-lg hover:bg-neutral-50 transition-colors w-full justify-center"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Upload Logo
                          </button>
                        )}

                        {showLogoUploader && (
                          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-neutral-400 transition-colors cursor-pointer">
                            <input
                              ref={logoInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <button
                              onClick={() => logoInputRef.current?.click()}
                              className="w-full"
                            >
                              <Upload className="h-6 w-6 mx-auto mb-1 text-neutral-400" />
                              <p className="text-xs text-neutral-600">Upload your app logo</p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">PNG or SVG (square format)</p>
                            </button>
                          </div>
                        )}

                        {uploadedLogo && (
                          <div className="relative group inline-block">
                            <img 
                              src={uploadedLogo} 
                              alt="App Logo"
                              className="w-20 h-20 object-cover rounded-lg border border-neutral-200 bg-white"
                            />
                            <button
                              onClick={handleRemoveLogo}
                              className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Assets Upload Section */}
                      <div className="pt-2 border-t border-neutral-200">
                        <p className="text-xs text-neutral-500 mb-2">Brand Assets (Optional)</p>
                        <p className="text-[10px] text-neutral-400 mb-2">Icons, badges, or decorative elements</p>
                        
                        {!showAssetsUploader && (
                          <button
                            onClick={() => setShowAssetsUploader(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-300 text-neutral-700 text-xs rounded-lg hover:bg-neutral-50 transition-colors w-full justify-center"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Upload Assets
                          </button>
                        )}

                        {showAssetsUploader && (
                          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-neutral-400 transition-colors cursor-pointer">
                            <input
                              ref={assetsInputRef}
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleAssetsUpload}
                              className="hidden"
                            />
                            <button
                              onClick={() => assetsInputRef.current?.click()}
                              className="w-full"
                            >
                              <Upload className="h-6 w-6 mx-auto mb-1 text-neutral-400" />
                              <p className="text-xs text-neutral-600">Upload brand assets</p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">Icons, badges, or decorations</p>
                            </button>
                          </div>
                        )}

                        {uploadedAssets.length > 0 && (
                          <div className="grid grid-cols-4 gap-2 mt-2">
                            {uploadedAssets.map((url, idx) => (
                              <div key={idx} className="relative group">
                                <img 
                                  src={url} 
                                  alt={`Asset ${idx + 1}`}
                                  className="w-full h-16 object-cover rounded-lg border border-neutral-200 bg-white"
                                />
                                <button
                                  onClick={() => handleRemoveAsset(idx)}
                                  className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {!showLayoutPreview ? (
                        <button
                          onClick={handleAnalyzeAndSuggest}
                          disabled={isAnalyzingScreenshots}
                          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg hover:bg-neutral-700 transition-colors w-full justify-center mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Sparkles className="h-4 w-4" />
                          {isAnalyzingScreenshots ? 'Analyzing...' : 'Analyze & Suggest Layouts'}
                        </button>
                      ) : (
                        <div className="mt-3 space-y-3">
                          {/* AI Analysis Results */}
                          <div className="bg-linear-to-br from-neutral-50 to-neutral-100 rounded-lg p-3 border border-neutral-200">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-6 w-6 rounded-md bg-neutral-900 flex items-center justify-center text-white text-xs font-semibold">
                                AI
                              </div>
                              <p className="text-xs font-semibold text-neutral-900">Analysis Complete!</p>
                            </div>
                            <p className="text-xs text-neutral-600 mb-4">
                              I've analyzed your screenshots and detected a <span className="font-semibold">{screenshotAnalysis?.mood}</span> mood. 
                              Here's what I found:
                            </p>

                            {/* Typography & Fonts */}
                            {screenshotAnalysis?.typography && (
                              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-[10px] font-semibold text-blue-900 mb-2">🔤 Typography & Fonts</p>
                                <div className="space-y-1.5">
                                  {screenshotAnalysis.typography.primaryFont && (
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-blue-600">Primary Font:</span>
                                      <span className="font-medium text-blue-900">{screenshotAnalysis.typography.primaryFont}</span>
                                    </div>
                                  )}
                                  {screenshotAnalysis.typography.fontStyle && (
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-blue-600">Style:</span>
                                      <span className="font-medium text-blue-900 capitalize">{screenshotAnalysis.typography.fontStyle}</span>
                                    </div>
                                  )}
                                  {screenshotAnalysis.typography.headlineSize && (
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-blue-600">Headline Size:</span>
                                      <span className="font-medium text-blue-900 capitalize">{screenshotAnalysis.typography.headlineSize}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Dominant Colors */}
                            <div className="mb-3">
                              <p className="text-[10px] text-neutral-500 mb-2">Dominant Colors (from your app)</p>
                              <div className="flex flex-wrap gap-2">
                                {screenshotAnalysis?.dominantColors.slice(0, 6).map((color, idx) => (
                                  <div key={idx} className="flex flex-col items-center gap-1">
                                    <div
                                      className="w-10 h-10 rounded-lg border border-neutral-200"
                                      style={{ backgroundColor: color }}
                                      title={color}
                                    />
                                    <span className="text-[8px] text-neutral-500 font-mono">{color}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Suggested Backgrounds */}
                            <div className="mb-3">
                              <p className="text-[10px] text-neutral-500 mb-2">Suggested Backgrounds</p>
                              <div className="flex flex-wrap gap-2">
                                {screenshotAnalysis?.suggestedBackgrounds.slice(0, 5).map((color, idx) => (
                                  <div key={idx} className="flex flex-col items-center gap-1">
                                    <div
                                      className="w-10 h-10 rounded-lg border border-neutral-200"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                    <span className="text-[8px] text-neutral-500 font-mono">{color}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Design Characteristics */}
                            {screenshotAnalysis?.designStyle && (
                              <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                <p className="text-[10px] font-semibold text-purple-900 mb-2">✨ Design Characteristics</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {screenshotAnalysis.designStyle.layout && (
                                    <div className="text-[10px]">
                                      <span className="text-purple-600 block">Layout:</span>
                                      <span className="font-medium text-purple-900 capitalize">{screenshotAnalysis.designStyle.layout}</span>
                                    </div>
                                  )}
                                  {screenshotAnalysis.designStyle.cornerRadius && (
                                    <div className="text-[10px]">
                                      <span className="text-purple-600 block">Corners:</span>
                                      <span className="font-medium text-purple-900 capitalize">{screenshotAnalysis.designStyle.cornerRadius}</span>
                                    </div>
                                  )}
                                  {screenshotAnalysis.designStyle.spacing && (
                                    <div className="text-[10px]">
                                      <span className="text-purple-600 block">Spacing:</span>
                                      <span className="font-medium text-purple-900 capitalize">{screenshotAnalysis.designStyle.spacing}</span>
                                    </div>
                                  )}
                                  {screenshotAnalysis.designStyle.shadows && (
                                    <div className="text-[10px]">
                                      <span className="text-purple-600 block">Shadows:</span>
                                      <span className="font-medium text-purple-900 capitalize">{screenshotAnalysis.designStyle.shadows}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Suggested Templates */}
                            <div>
                              <p className="text-[10px] text-neutral-500 mb-2"> Recommended Layouts</p>
                              <div className="grid grid-cols-3 gap-2">
                                {screenshotAnalysis?.suggestedTemplates.slice(0, 3).map((templateId) => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === templateId)
                                  return template ? (
                                    <div
                                      key={templateId}
                                      className="p-2 bg-white rounded-md border border-neutral-200 text-center"
                                    >
                                      <p className="text-[9px] font-semibold text-neutral-900 mb-0.5">{template.name}</p>
                                      <p className="text-[8px] text-neutral-500">{template.description}</p>
                                    </div>
                                  ) : null
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenDesignTool(message.content, uploadedScreenshots)}
                              disabled={isGeneratingStructure}
                              className="flex-1 flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg hover:bg-neutral-700 transition-colors justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Sparkles className="h-4 w-4" />
                              {isGeneratingStructure ? 'Generating...' : 'Generate Screenshots'}
                            </button>
                            <button
                              onClick={() => setShowVideoGenerator(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-800 text-sm rounded-lg hover:bg-neutral-200 transition-colors justify-center"
                            >
                              <Video className="h-4 w-4" />
                              Video
                            </button>
                          </div>
                        </div>
                      )}
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
            style={{ width: `${panelWidth}px` }}
            className="fixed right-0 top-0 bottom-0 h-screen overflow-hidden z-50 border-l border-neutral-200 bg-white"
          >
            {/* Resize Handle */}
            <div
              onMouseDown={handleResizeStart}
              className={`absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 bg-transparent hover:bg-neutral-300 cursor-ew-resize transition-all z-50 group ${
                isResizing ? 'w-1.5 bg-neutral-400' : ''
              }`}
            >
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-8 bg-neutral-400 rounded-full"></div>
              </div>
            </div>
            
            <DesignCanvas 
              onClose={() => setIsPanelOpen(false)}
              userPrompt={selectedPrompt}
              uploadedScreenshots={uploadedScreenshots}
              uploadedLogo={uploadedLogo}
              uploadedAssets={uploadedAssets}
              screenshotAnalysis={screenshotAnalysis}
              aiStructure={aiStructure}
              promptAnalysis={promptAnalysis}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Generator Modal */}
      {showVideoGenerator && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <VideoGenerator 
              screenshots={uploadedScreenshots}
              prompt={selectedPrompt}
              onClose={() => setShowVideoGenerator(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

