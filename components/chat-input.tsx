"use client"

import * as React from "react"
import { Paperclip, Globe, ArrowUp, Library, Wand2, Image, X } from "lucide-react"
import { ChatConversation } from "./chat-conversation"
import { useRouter } from "next/navigation"
import { streamAIResponse, mockStreamAIResponse, hasOpenAIKey } from "@/lib/openai-stream"
import { motion } from "motion/react"

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
  isStreaming?: boolean
  screenshots?: string[]
}

interface ChatInputProps {
  chatId?: string
  initialMessages?: Message[]
  onPanelOpenChange?: (isOpen: boolean, width?: number) => void
  triggerAIResponse?: boolean
  onAIResponseTriggered?: () => void
  canvasPanelWidth?: number  // Receive pixel width from canvas
  canvasPanelOpen?: boolean  // Receive open state from canvas
}

export function ChatInput({ 
  chatId, 
  initialMessages = [], 
  onPanelOpenChange,
  triggerAIResponse = false,
  onAIResponseTriggered,
  canvasPanelWidth = 800,
  canvasPanelOpen = false
}: ChatInputProps) {
  const router = useRouter()
  const [value, setValue] = React.useState("")
  const [placeholder, setPlaceholder] = React.useState("")
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0)
  const [currentCharIndex, setCurrentCharIndex] = React.useState(0)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showMentionPopover, setShowMentionPopover] = React.useState(false)
  const [showBanner, setShowBanner] = React.useState(true)
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const [uploadedScreenshots, setUploadedScreenshots] = React.useState<string[]>([])
  const [showScreenshotUpload, setShowScreenshotUpload] = React.useState(false)
  const [showDescriptionModal, setShowDescriptionModal] = React.useState(false)
  const [screenshotDescriptions, setScreenshotDescriptions] = React.useState<string[]>([])
  const [tempScreenshots, setTempScreenshots] = React.useState<string[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Track panel open state - use prop if available
  const isPanelOpen = canvasPanelOpen
  const panelWidth = canvasPanelWidth

  // Handle panel changes from ChatConversation and notify parent
  const handlePanelOpenChange = React.useCallback((isOpen: boolean, width?: number) => {
    // Pass both values up to parent if it's a function that accepts them
    if (typeof onPanelOpenChange === 'function') {
      onPanelOpenChange(isOpen, width)
    }
  }, [onPanelOpenChange])

  // Handle adding or updating messages (for analysis streaming)
  const handleAddMessage = React.useCallback((message: Message) => {
    setMessages(prev => {
      const existingIndex = prev.findIndex(m => m.id === message.id)
      if (existingIndex >= 0) {
        // Update existing message
        const newMessages = [...prev]
        newMessages[existingIndex] = message
        return newMessages
      } else {
        // Add new message
        return [...prev, message]
      }
    })
  }, [])

  // AI Response Generator (moved up for use in effects)
  const generateAIResponse = React.useCallback((userInput: string): string => {
    // Enhanced AI response following the Claude.md workflow
    const input = userInput.toLowerCase()
    
    // Detect if this is an app screenshot request
    const isScreenshotRequest = 
      input.includes("screenshot") || 
      input.includes("app store") || 
      input.includes("design") ||
      input.includes("generate") ||
      input.includes("create app") ||
      input.includes("visual") ||
      input.includes("mockup")
    
    if (isScreenshotRequest) {
      // Generate detailed exploration response
      return generateDetailedAnalysis(userInput)
    } else if (input.includes("marketing") || input.includes("strategy")) {
      return "I'll help you craft a comprehensive marketing strategy. Let's focus on your target audience, unique value proposition, and channels. What's your app's main benefit to users?"
    } else if (input.includes("description") || input.includes("copy")) {
      return "I'll write compelling copy that converts! I can create app descriptions, feature highlights, and promotional text. Would you like me to focus on benefits, features, or a storytelling approach?"
    } else {
      return `I understand you're interested in "${userInput}". I'm here to help you create amazing app store assets! I can generate screenshots, write descriptions, plan marketing strategies, and much more. What would you like to start with?`
    }
  }, [])

  const generateDetailedAnalysis = React.useCallback((userInput: string): string => {
    // Simulating the "thinking" phase with detailed analysis
    const analysis = `📊 **Analysis of Your App Concept**

Based on your request, I've analyzed what you're looking to create and here's my understanding:

**App Type & Purpose:**
Your app appears to be ${extractAppType(userInput)}. This type of application typically serves users who are looking for ${extractUserNeed(userInput)}.

**Target Audience:**
The ideal users for this app would be ${extractTargetAudience(userInput)}.

**Key Features to Highlight:**
• ${extractFeature1(userInput)}
• ${extractFeature2(userInput)}
• ${extractFeature3(userInput)}

**Recommended Screenshot Strategy:**
For App Store success, I recommend creating 3-5 screenshots that showcase:
1. Your app's main interface and core functionality
2. Key features that differentiate you from competitors
3. User benefits and value proposition
4. Social proof or results (if applicable)

**Visual Style Recommendations:**
• Layout: ${recommendLayout(userInput)}
• Color Scheme: ${recommendColors(userInput)}
• Tone: ${recommendTone(userInput)}

---

**Next Steps:**

To create stunning, App Store-ready screenshots for your app, I need to see what we're working with!

Please upload or share screenshots of your actual app interface. I'll then:
1. Analyze your app's design and features
2. Generate multiple professional screenshot variations
3. Apply App Store best practices for maximum conversion
4. Create designs in all required sizes (iPhone 6.7", 6.5", etc.)

**What I need from you:**
• Screenshots of your app's main screens
• Any specific features you want to highlight
• Your preferred style (minimal, bold, professional, etc.)

Ready to upload your app screenshots?`

    return analysis
  }, [])

  // Sync with initialMessages prop changes
  React.useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages)
    }
  }, [initialMessages])

  // Trigger AI response when needed (for first message after redirect)
  React.useEffect(() => {
    if (triggerAIResponse && messages.length === 1 && messages[0].role === 'user') {
      const userMessage = messages[0]
      
      // Generate AI response with streaming
      const aiMessageId = (Date.now() + 1).toString()
      const aiMessage: Message = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true
      }
      
      // Add empty AI message
      const messagesWithAI = [...messages, aiMessage]
      setMessages(messagesWithAI)
      
      // Stream the response
      const streamFn = hasOpenAIKey() ? streamAIResponse : mockStreamAIResponse
      
      streamFn(userMessage.content, {
        onStart: () => {
          // Streaming started
        },
        onToken: (token, fullText) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, content: fullText, isStreaming: true }
                : msg
            )
          )
        },
        onComplete: (fullText) => {
          const finalMessages = messages.concat({
            id: aiMessageId,
            role: "assistant",
            content: fullText,
            timestamp: new Date(),
            isStreaming: false
          })
          setMessages(finalMessages)
          
          // Save AI response to localStorage
          if (chatId) {
            localStorage.setItem(`chat-${chatId}`, JSON.stringify(finalMessages))
          }
          
          // Notify parent that AI response was triggered
          onAIResponseTriggered?.()
        },
        onError: (error) => {
          console.error('AI Error:', error)
          onAIResponseTriggered?.()
        }
      }, messages.length)
    }
  }, [triggerAIResponse, messages.length, messages, chatId, onAIResponseTriggered])

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
        const projectName = extractProjectName(value.trim())
        
        // Create a new workspace/project in sidebar
        createProjectInSidebar(newChatId, projectName, value.trim())
        
        // Store message in localStorage temporarily
        localStorage.setItem(`chat-${newChatId}`, JSON.stringify([userMessage]))
        router.push(`/dashboard/chat/${newChatId}`)
        return
      }
      
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setValue("")
      
      // Save to localStorage
      localStorage.setItem(`chat-${chatId}`, JSON.stringify(updatedMessages))
      
      // Generate AI response with streaming
      const aiMessageId = (Date.now() + 1).toString()
      const aiMessage: Message = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true
      }
      
      // Add empty AI message
      const messagesWithAI = [...updatedMessages, aiMessage]
      setMessages(messagesWithAI)
      
      // Stream the response
      const streamFn = hasOpenAIKey() ? streamAIResponse : mockStreamAIResponse
      const conversationLength = updatedMessages.length
      
      streamFn(userMessage.content, {
        onStart: () => {
          // Streaming started
        },
        onToken: (token, fullText) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, content: fullText, isStreaming: true }
                : msg
            )
          )
        },
        onComplete: (fullText) => {
          const finalMessages = updatedMessages.concat({
            id: aiMessageId,
            role: "assistant",
            content: fullText,
            timestamp: new Date(),
            isStreaming: false
          })
          setMessages(finalMessages)
          
          // Save AI response to localStorage
          localStorage.setItem(`chat-${chatId}`, JSON.stringify(finalMessages))
        },
        onError: (error) => {
          console.error('AI Error:', error)
          const errorMessage = updatedMessages.concat({
            id: aiMessageId,
            role: "assistant",
            content: "I apologize, but I encountered an error generating a response. Please try again.",
            timestamp: new Date(),
            isStreaming: false
          })
          setMessages(errorMessage)
          localStorage.setItem(`chat-${chatId}`, JSON.stringify(errorMessage))
        }
      }, conversationLength)
    }
  }

  const extractProjectName = (prompt: string): string => {
    // Remove common action words and prefixes
    let cleaned = prompt
      .toLowerCase()
      .replace(/^(please|could you|can you|i want to|i need to|help me)\s+/gi, '')
      .replace(/^(create|generate|make|design|build|develop)\s+(an?|the|some)?\s*/gi, '')
      .replace(/\s+(app store\s+)?(screenshots?|designs?|assets?|images?|visuals?)\s+(for|of|about)\s+/gi, ' for ')
      .replace(/\s+for\s+(an?|the|my)\s+/gi, ' ')
      .trim()

    // Extract key descriptive words (remove common words)
    const commonWords = ['app', 'application', 'mobile', 'for', 'with', 'that', 'which', 'helps', 'allows', 'enables', 'users', 'people', 'their']
    const words = cleaned.split(/\s+/).filter(word => 
      word.length > 2 && !commonWords.includes(word.toLowerCase())
    )

    // Take first 3-5 meaningful words
    const titleWords = words.slice(0, Math.min(5, words.length))
    
    // Capitalize first letter of each word
    const title = titleWords
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .substring(0, 35)

    // If we got nothing meaningful, create generic name with emoji
    if (!title || title.length < 3) {
      const emoji = getEmojiForPrompt(prompt)
      return `${emoji} New Project`
    }

    return title
  }

  const createProjectInSidebar = (chatId: string, projectName: string, prompt: string) => {
    // Load existing workspaces
    const stored = localStorage.getItem('lume-workspaces')
    let workspaces = []
    
    try {
      workspaces = stored ? JSON.parse(stored) : []
    } catch (e) {
      workspaces = []
    }

    // Determine emoji based on prompt keywords
    const emoji = getEmojiForPrompt(prompt)

    // Create new workspace
    const newWorkspace = {
      name: projectName,
      emoji: emoji,
      pages: [
        {
          name: "Chat",
          url: `/dashboard/chat/${chatId}`,
          emoji: "💬",
        },
        {
          name: "Screenshots",
          url: "#",
          emoji: "📱",
        },
        {
          name: "Assets",
          url: "#",
          emoji: "🎨",
        },
      ],
    }

    // Add to beginning of workspaces array
    workspaces.unshift(newWorkspace)

    // Save back to localStorage
    localStorage.setItem('lume-workspaces', JSON.stringify(workspaces))
  }

  const getEmojiForPrompt = (prompt: string): string => {
    const lower = prompt.toLowerCase()
    if (lower.includes('finance') || lower.includes('money') || lower.includes('budget')) return '💰'
    if (lower.includes('fitness') || lower.includes('health') || lower.includes('workout')) return '💪'
    if (lower.includes('food') || lower.includes('recipe') || lower.includes('cooking')) return '🍳'
    if (lower.includes('travel') || lower.includes('trip')) return '✈️'
    if (lower.includes('education') || lower.includes('learn')) return '📚'
    if (lower.includes('music') || lower.includes('audio')) return '🎵'
    if (lower.includes('photo') || lower.includes('camera')) return '📸'
    if (lower.includes('social') || lower.includes('chat')) return '💬'
    if (lower.includes('game') || lower.includes('play')) return '🎮'
    if (lower.includes('shopping') || lower.includes('store')) return '🛍️'
    return '📱' // Default app emoji
  }

  // Helper functions for AI analysis (defined inline to avoid duplication)
  const extractAppType = (input: string): string => {
    if (input.includes("finance") || input.includes("budget") || input.includes("money")) return "a finance/budgeting application"
    if (input.includes("fitness") || input.includes("health") || input.includes("workout")) return "a fitness and health tracking application"
    if (input.includes("social") || input.includes("chat") || input.includes("message")) return "a social networking application"
    if (input.includes("productivity") || input.includes("task") || input.includes("todo")) return "a productivity and task management application"
    if (input.includes("education") || input.includes("learn") || input.includes("course")) return "an educational application"
    return "a mobile application"
  }

  const extractUserNeed = (input: string): string => {
    if (input.includes("finance")) return "better control over their finances and spending habits"
    if (input.includes("fitness")) return "tracking their health goals and maintaining consistent workout routines"
    if (input.includes("social")) return "connecting with others and sharing experiences"
    if (input.includes("productivity")) return "organizing their tasks and boosting their daily efficiency"
    return "solving specific problems in their daily lives"
  }

  const extractTargetAudience = (input: string): string => {
    return "young professionals aged 25-40 who are tech-savvy and looking for modern, intuitive solutions"
  }

  const extractFeature1 = (input: string): string => {
    if (input.includes("finance")) return "Real-time expense tracking with smart categorization"
    if (input.includes("fitness")) return "Personalized workout plans based on user goals"
    return "Intuitive onboarding and easy setup process"
  }

  const extractFeature2 = (input: string): string => {
    if (input.includes("finance")) return "Budget insights and spending analytics"
    if (input.includes("fitness")) return "Progress tracking with visual charts and milestones"
    return "Core functionality that solves the main user problem"
  }

  const extractFeature3 = (input: string): string => {
    if (input.includes("finance")) return "Bill reminders and savings goals"
    if (input.includes("fitness")) return "Social features and community motivation"
    return "Advanced features that enhance the user experience"
  }

  const recommendLayout = (input: string): string => {
    return "iPhone-centered with bold headlines and clear visual hierarchy"
  }

  const recommendColors = (input: string): string => {
    if (input.includes("finance")) return "Professional blues and greens to convey trust and growth"
    if (input.includes("fitness")) return "Energetic oranges and blues to inspire action"
    return "Modern gradient backgrounds with clean, minimal aesthetics"
  }

  const recommendTone = (input: string): string => {
    return "Clean and professional with emphasis on clarity and user benefits"
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Require exactly 5 screenshots
    if (files.length < 5) {
      alert("Please upload exactly 5 screenshots to proceed.")
      return
    }

    const urls: string[] = []
    for (let i = 0; i < 5; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          urls.push(result)
          if (urls.length === 5) {
            // Store screenshots temporarily and show description modal
            setTempScreenshots(urls)
            setScreenshotDescriptions(['', '', '', '', ''])
            setShowDescriptionModal(true)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleDescriptionsSubmit = () => {
    // Validate all descriptions are filled
    const allFilled = screenshotDescriptions.every(desc => desc.trim().length > 0)
    if (!allFilled) {
      alert("Please describe all 5 screenshots before continuing.")
      return
    }

    setUploadedScreenshots(tempScreenshots)
    setShowDescriptionModal(false)
    
    // Add user message with screenshots and descriptions
    const screenshotMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `[Uploaded 5 screenshots]\n\n${screenshotDescriptions.map((desc, i) => `**Screenshot ${i + 1}:** ${desc}`).join('\n')}`,
      timestamp: new Date(),
      screenshots: tempScreenshots
    }
    
    const updatedMessages = [...messages, screenshotMessage]
    setMessages(updatedMessages)
    
    // Save to localStorage
    if (chatId) {
      localStorage.setItem(`chat-${chatId}`, JSON.stringify(updatedMessages))
    }
    
    // Trigger AI response
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true
    }
    
    const messagesWithAI = [...updatedMessages, aiMessage]
    setMessages(messagesWithAI)
    
    // AI acknowledges and asks to generate
    const analysisPrompt = `The user uploaded 5 screenshots with descriptions:
${screenshotDescriptions.map((desc, i) => `${i + 1}. ${desc}`).join('\n')}

Acknowledge what you see and ask if they'd like to generate App Store screenshots using Template 1.`
    
    const streamFn = hasOpenAIKey() ? streamAIResponse : mockStreamAIResponse
    
    streamFn(analysisPrompt, {
      onStart: () => {},
      onToken: (token, fullText) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: fullText, isStreaming: true }
              : msg
          )
        )
      },
      onComplete: (fullText) => {
        const finalMessages = updatedMessages.concat({
          id: aiMessageId,
          role: "assistant",
          content: fullText,
          timestamp: new Date(),
          isStreaming: false
        })
        setMessages(finalMessages)
        
        if (chatId) {
          localStorage.setItem(`chat-${chatId}`, JSON.stringify(finalMessages))
        }
      },
      onError: (error) => {
        console.error('AI Error:', error)
      }
    }, updatedMessages.length)
  }

  const handleOpenScreenshotUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      {/* Screenshot Description Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-light text-neutral-900 mb-2">
                Describe Your Screenshots
              </h2>
              <p className="text-sm text-neutral-500 mb-6">
                Tell us what each screenshot shows. This helps us create better titles and descriptions.
              </p>

              <div className="space-y-6">
                {tempScreenshots.map((screenshot, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-24 h-44 shrink-0 rounded-lg overflow-hidden border border-neutral-200">
                      <img 
                        src={screenshot} 
                        alt={`Screenshot ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Screenshot {idx + 1} - What does this screen show?
                      </label>
                      <input
                        type="text"
                        value={screenshotDescriptions[idx]}
                        onChange={(e) => {
                          const newDescriptions = [...screenshotDescriptions]
                          newDescriptions[idx] = e.target.value
                          setScreenshotDescriptions(newDescriptions)
                        }}
                        placeholder="e.g., Dashboard with expense tracking and budget overview"
                        className="w-full px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDescriptionModal(false)
                    setTempScreenshots([])
                    setScreenshotDescriptions([])
                  }}
                  className="flex-1 px-4 py-2 border border-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDescriptionsSubmit}
                  className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-full flex flex-col overflow-hidden isolate">
        {/* Messages Area */}
        <div className="flex-1 overflow-hidden">
          <ChatConversation 
            messages={messages} 
            onPanelOpenChange={handlePanelOpenChange}
            onAddMessage={handleAddMessage}
          />
        </div>

      {/* Chat Input - Shrinks when canvas is open */}
      <motion.div 
        animate={{ 
          width: isPanelOpen ? `calc(100% - ${panelWidth}px)` : "100%"
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="shrink-0 relative z-50"
      >
        <div className={`w-full mx-auto px-2 sm:px-4 py-4 ${isPanelOpen ? 'max-w-2xl' : 'max-w-3xl'}`}>
          <div className="relative rounded-2xl border border-neutral-200 bg-white">
        {/* Top bar - Mention & Add context */}
        <div className="flex items-center gap-2 px-3 sm:px-4 pt-2 sm:pt-3 pb-2"> 
          <button className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
            <span className="mr-1">@</span>
            <span className="hidden sm:inline">Add context</span>
            <span className="inline sm:hidden">Context</span>
          </button>
        </div>

        {/* Textarea */}
        <div className="relative px-3 sm:px-4 mt-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask me anything..."}
            rows={1}
            className="w-full min-h-[50px] sm:min-h-[60px] max-h-[200px] resize-none border-0 p-0 text-sm sm:text-base text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
          />
        </div>

        {/* Bottom bar - Actions */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-t border-zinc-100">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleScreenshotUpload}
              className="hidden"
            />
            <button 
              onClick={handleOpenScreenshotUpload}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              title="Upload screenshots (5 required)"
            >
              <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <Image className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
              <Library className="h-4 w-4" />
              <span>Prompt Library</span>
            </button>
            <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
              <Wand2 className="h-4 w-4" />
              <span>Improve Prompt</span>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
              value.trim()
                ? "bg-black text-white cursor-pointer hover:bg-gray-800"
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            }`}
          >
            <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
          </div>
        </div>
      </motion.div>
      </div>
    </>
  )
}