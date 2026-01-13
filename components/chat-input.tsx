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
}

interface ChatInputProps {
  chatId?: string
  initialMessages?: Message[]
  onPanelOpenChange?: (isOpen: boolean) => void
  triggerAIResponse?: boolean
  onAIResponseTriggered?: () => void
}

export function ChatInput({ 
  chatId, 
  initialMessages = [], 
  onPanelOpenChange,
  triggerAIResponse = false,
  onAIResponseTriggered
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
  const [isPanelOpen, setIsPanelOpen] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const [panelWidth, setPanelWidth] = React.useState("70%")

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

  // Track panel open state
  const handlePanelOpenChange = React.useCallback((isOpen: boolean) => {
    setIsPanelOpen(isOpen)
    onPanelOpenChange?.(isOpen)
  }, [onPanelOpenChange])

  // AI Response Generator (moved up for use in effects)
  const generateAIResponse = React.useCallback((userInput: string): string => {
    const input = userInput.toLowerCase()
    
    // Detect intent more intelligently
    const intents = detectIntents(input)
    
    if (intents.isScreenshotRequest) {
      return generateDetailedAnalysis(userInput)
    } else if (intents.isMarketing) {
      const marketingResponses = [
        `Let's build a marketing engine for your app. I'm curious—who's your dream user? The person who'd tell their friends about this?`,
        `Marketing is storytelling at scale. What's the one thing you want people to *feel* when they see your app?`,
        `Before we dive into tactics, let's nail the strategy. What problem does your app solve that keeps people up at night?`
      ]
      return marketingResponses[Math.floor(Math.random() * marketingResponses.length)]
    } else if (intents.isCopywriting) {
      const copyResponses = [
        `Words sell. Let's make yours irresistible. What's the single most surprising benefit of your app?`,
        `Good copy isn't about features—it's about transformation. What does your user's life look like *after* using your app?`,
        `I can write copy that converts, but first: what objection would stop someone from downloading?`
      ]
      return copyResponses[Math.floor(Math.random() * copyResponses.length)]
    } else {
      return generateConversationalResponse(userInput)
    }
  }, [])

  // Intent detection - smarter pattern matching
  const detectIntents = (input: string) => {
    const screenshotKeywords = ['screenshot', 'app store', 'mockup', 'visual', 'design', 'generate', 'create']
    const marketingKeywords = ['marketing', 'strategy', 'growth', 'acquire', 'user acquisition', 'promote', 'advertise']
    const copyKeywords = ['description', 'copy', 'write', 'text', 'tagline', 'headline', 'aso']
    
    return {
      isScreenshotRequest: screenshotKeywords.some(k => input.includes(k)),
      isMarketing: marketingKeywords.some(k => input.includes(k)),
      isCopywriting: copyKeywords.some(k => input.includes(k))
    }
  }

  // Generate natural conversational response for general queries
  const generateConversationalResponse = (userInput: string): string => {
    const contextualResponses = [
      `Interesting. "${userInput.slice(0, 50)}${userInput.length > 50 ? '...' : ''}" — tell me more. What's the end goal here?`,
      `I can help with that. But first, what would success look like for you?`,
      `Got it. Let's break this down. What's the most important thing to get right?`,
      `I'm picking up what you're putting down. Are we talking about something for the App Store, or is this broader?`,
      `That's a solid starting point. Want me to help turn this into App Store-ready assets, or are you still in the brainstorm phase?`
    ]
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)]
  }

  const generateDetailedAnalysis = React.useCallback((userInput: string): string => {
    const appInsights = analyzeAppConcept(userInput)
    const template = getRandomAnalysisTemplate()
    
    return template
      .replace('{{OPENER}}', appInsights.opener)
      .replace('{{APP_ESSENCE}}', appInsights.essence)
      .replace('{{AUDIENCE_INSIGHT}}', appInsights.audienceInsight)
      .replace('{{FEATURE_1}}', appInsights.features[0])
      .replace('{{FEATURE_2}}', appInsights.features[1])
      .replace('{{FEATURE_3}}', appInsights.features[2])
      .replace('{{VISUAL_DIRECTION}}', appInsights.visualDirection)
      .replace('{{CTA}}', appInsights.cta)
  }, [])

  // Analyze the app concept with more depth
  const analyzeAppConcept = (input: string) => {
    const lowerInput = input.toLowerCase()
    
    // Detect app category with nuance
    const category = detectCategory(lowerInput)
    
    // Generate contextual insights
    const openers = [
      `I see what you're building here.`,
      `This is interesting—let me break down what I'm seeing.`,
      `Okay, I've processed this. Here's my take:`,
      `Right, let's get into it.`,
      `I've analyzed your concept. Here's the strategic breakdown:`
    ]
    
    const essenceTemplates = {
      finance: [
        `You're building trust. Financial apps live or die by perceived security and clarity`,
        `Money apps need to feel *safe* before they feel clever. Every pixel matters`,
        `The best finance apps make complexity invisible. That's your north star`
      ],
      fitness: [
        `Fitness apps sell transformation, not features. The screenshots need to show the *after*`,
        `Your competition is willpower. The app needs to feel motivating at first glance`,
        `Health apps work when they make users feel capable, not guilty`
      ],
      social: [
        `Social apps are about belonging. Your screenshots need to show connection, not features`,
        `The best social apps feel alive. Empty states are conversion killers`,
        `You're selling a community, not a product. That changes everything`
      ],
      productivity: [
        `Productivity apps succeed when they feel lighter than the problem they solve`,
        `Your enemy is friction. Every screenshot should whisper "this is easy"`,
        `The best task apps make users feel in control, not overwhelmed`
      ],
      ecommerce: [
        `E-commerce apps sell desire. Your screenshots need to drip with product appeal`,
        `The checkout flow is everything. Trust signals need to be front and center`,
        `Shopping apps win on speed and discovery. Show both`
      ],
      default: [
        `Your app solves a problem. The screenshots need to make that problem feel solvable`,
        `First impressions are brutal in the App Store. We need to nail the hook`,
        `The best apps feel inevitable. Like, "of course this exists"`
      ]
    }
    
    const categoryEssences = essenceTemplates[category] || essenceTemplates.default
    
    const audienceInsights = generateAudienceInsight(lowerInput, category)
    const features = generateFeatureHighlights(lowerInput, category)
    const visualDirection = generateVisualDirection(category)
    const ctas = [
      `Drop your app screenshots below and let's make something that converts.`,
      `Upload your screens—I'll turn them into App Store gold.`,
      `Ready when you are. Share your app's interface and we'll get to work.`,
      `Let's see what we're working with. Upload your screenshots and I'll craft something special.`
    ]
    
    return {
      opener: openers[Math.floor(Math.random() * openers.length)],
      essence: categoryEssences[Math.floor(Math.random() * categoryEssences.length)],
      audienceInsight,
      features,
      visualDirection,
      cta: ctas[Math.floor(Math.random() * ctas.length)]
    }
  }

  const detectCategory = (input: string): string => {
    const categories = {
      finance: ['finance', 'money', 'budget', 'invest', 'bank', 'payment', 'crypto', 'trading', 'expense', 'savings'],
      fitness: ['fitness', 'health', 'workout', 'gym', 'exercise', 'diet', 'nutrition', 'meditation', 'yoga', 'wellness'],
      social: ['social', 'chat', 'message', 'dating', 'community', 'network', 'friends', 'share', 'connect'],
      productivity: ['productivity', 'task', 'todo', 'note', 'calendar', 'schedule', 'organize', 'project', 'time'],
      ecommerce: ['shop', 'store', 'buy', 'sell', 'ecommerce', 'marketplace', 'retail', 'product', 'cart']
    }
    
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(k => input.includes(k))) return cat
    }
    return 'default'
  }

  const generateAudienceInsight = (input: string, category: string): string => {
    const insights = {
      finance: [
        `Your users are likely stressed about money. The app should feel like a weight lifted.`,
        `Financial app users range from anxious first-timers to savvy optimizers. Which are you targeting?`,
        `People downloading finance apps are in "fix this" mode. Meet them there.`
      ],
      fitness: [
        `Your users are motivated but inconsistent. The app needs to be their accountability partner.`,
        `Fitness app users fall into two camps: beginners seeking guidance and athletes wanting data.`,
        `People download fitness apps in moments of inspiration. Your job is to sustain that.`
      ],
      social: [
        `Social app users are looking for connection or validation—usually both.`,
        `Your audience craves belonging. Show them a tribe, not a tool.`,
        `People trying social apps are taking a risk. Make it feel worth it.`
      ],
      productivity: [
        `Productivity app users are overwhelmed and hopeful. That's a delicate combination.`,
        `Your users have tried everything. Show them why this time is different.`,
        `People download productivity apps seeking control. Give them that feeling instantly.`
      ],
      ecommerce: [
        `Your shoppers want discovery and convenience. Nail both in the first screenshot.`,
        `E-commerce users are impatient. Every tap better be worth it.`,
        `Trust and taste—that's what shopping app users judge in 3 seconds.`
      ],
      default: [
        `Understanding your user's mindset is everything. What state are they in when they find you?`,
        `Your audience has a problem and limited patience. Lead with the solution.`,
        `Users decide in seconds. What do they need to believe to download?`
      ]
    }
    
    const categoryInsights = insights[category] || insights.default
    return categoryInsights[Math.floor(Math.random() * categoryInsights.length)]
  }

  const generateFeatureHighlights = (input: string, category: string): string[] => {
    const featureSets = {
      finance: [
        [`Smart expense tracking that categorizes automatically`, `Visual breakdowns that make sense of spending`, `Goal-setting that actually works`],
        [`One-tap insights into your financial health`, `Secure sync with all your accounts`, `Predictive budgeting based on your patterns`],
        [`Real-time notifications that prevent overspending`, `Beautiful reports you'll actually read`, `Export-ready data for tax season`]
      ],
      fitness: [
        [`Personalized workouts that adapt to progress`, `Visual progress tracking that motivates`, `Rest day reminders that prevent burnout`],
        [`AI-powered form correction`, `Social challenges with friends`, `Integration with wearables`],
        [`Meal planning that fits your goals`, `Achievement system that hooks you`, `Offline mode for gym sessions`]
      ],
      social: [
        [`Discovery features that feel serendipitous`, `Privacy controls that build trust`, `Engagement hooks that don't feel manipulative`],
        [`Smart matching algorithms`, `Content creation tools built-in`, `Community moderation that works`],
        [`Stories and ephemeral content`, `Group features that scale`, `DMs that feel secure`]
      ],
      productivity: [
        [`Quick capture that takes seconds`, `Smart organization that thinks ahead`, `Cross-device sync that just works`],
        [`Templates for every workflow`, `Collaboration features built-in`, `Focus modes that block distractions`],
        [`Calendar integration that maps your day`, `Recurring tasks without the setup`, `Progress visualization that motivates`]
      ],
      ecommerce: [
        [`Visual search that finds what you imagine`, `Personalized recommendations that nail it`, `Checkout in 3 taps or less`],
        [`AR try-before-you-buy`, `Wishlist sharing for gift hints`, `Price drop alerts that convert`],
        [`Curated collections that inspire`, `Review system users trust`, `Seamless returns process`]
      ],
      default: [
        [`Intuitive onboarding that respects time`, `Core feature that delivers immediately`, `Delightful details that surprise`],
        [`Fast, responsive interface`, `Smart defaults that just work`, `Offline capability when needed`],
        [`Personalization that feels helpful`, `Sharing features built-in`, `Support that's actually reachable`]
      ]
    }
    
    const sets = featureSets[category] || featureSets.default
    return sets[Math.floor(Math.random() * sets.length)]
  }

  const generateVisualDirection = (category: string): string => {
    const directions = {
      finance: [
        `Clean whites and deep blues. Trust-building gradients. Numbers should be legible and proud.`,
        `Dark mode friendly with pops of green for growth. Minimal chrome, maximum clarity.`,
        `Premium feel—think private banking, not spreadsheet software.`
      ],
      fitness: [
        `High energy colors—oranges, electric blues. Dynamic angles that suggest movement.`,
        `Dark backgrounds with neon accents. The gym aesthetic, elevated.`,
        `Warm, encouraging tones. Approachable but aspirational.`
      ],
      social: [
        `Vibrant, youthful palette. Lots of real faces and genuine moments.`,
        `Purple-to-pink gradients are played out—consider something unexpected.`,
        `Warmth matters more than cool. Show connection, not features.`
      ],
      productivity: [
        `Minimal, almost invisible design. Let the content breathe.`,
        `Soft neutrals with one accent color. Professional but not corporate.`,
        `Paper-like textures and clean typography. Calm, not busy.`
      ],
      ecommerce: [
        `Product-first layouts. Big, beautiful imagery. Price should feel fair, not hidden.`,
        `Aspirational lifestyle shots mixed with clean product grids.`,
        `Luxurious feeling without being exclusive. Accessible premium.`
      ],
      default: [
        `Modern and clean with purposeful color accents. Every element earns its place.`,
        `Start with the content, design around it. No decoration for decoration's sake.`,
        `Consistency is confidence. Pick a style and commit.`
      ]
    }
    
    const categoryDirections = directions[category] || directions.default
    return categoryDirections[Math.floor(Math.random() * categoryDirections.length)]
  }

  const getRandomAnalysisTemplate = (): string => {
    const templates = [
      `{{OPENER}}

**The Core Insight**
{{APP_ESSENCE}}

**Your Audience**  
{{AUDIENCE_INSIGHT}}

**What to Showcase**
→ {{FEATURE_1}}
→ {{FEATURE_2}}
→ {{FEATURE_3}}

**Visual Direction**
{{VISUAL_DIRECTION}}

---

{{CTA}}`,

      `{{OPENER}}

{{APP_ESSENCE}}

**Who's Downloading This?**
{{AUDIENCE_INSIGHT}}

**The Screenshots Should Highlight:**
• {{FEATURE_1}}
• {{FEATURE_2}}  
• {{FEATURE_3}}

**On the Visuals:**
{{VISUAL_DIRECTION}}

---

{{CTA}}`,

      `{{OPENER}}

Here's what matters:

**1. The Essence**
{{APP_ESSENCE}}

**2. The Audience**
{{AUDIENCE_INSIGHT}}

**3. The Features Worth Showing**
{{FEATURE_1}}. {{FEATURE_2}}. {{FEATURE_3}}.

**4. The Look**
{{VISUAL_DIRECTION}}

---

{{CTA}}`
    ]
    
    return templates[Math.floor(Math.random() * templates.length)]
  }

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
      })
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
      })
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ChatConversation messages={messages} onPanelOpenChange={handlePanelOpenChange} />
      </div>

      {/* Chat Input - Shrinks when canvas is open */}
      <motion.div 
        animate={{ 
          width: isPanelOpen ? `calc(100% - ${panelWidth})` : "100%"
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="shrink-0 relative z-50"
      >
        <div className={`w-full mx-auto px-2 sm:px-4 py-4 ${isPanelOpen ? 'max-w-2xl' : 'max-w-3xl'}`}>
          <div className="relative border border-neutral-200 bg-neutral-50">
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
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-t border-neutral-200">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <button className="p-1.5 sm:p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors">
              <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button className="p-1.5 sm:p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors">
              <Image className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors font-light">
              <Library className="h-4 w-4" />
              <span>Prompt Library</span>
            </button>
            <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors font-light">
              <Wand2 className="h-4 w-4" />
              <span>Improve Prompt</span>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={`h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center transition-all shrink-0 border ${
              value.trim()
                ? "bg-neutral-900 text-white cursor-pointer hover:bg-neutral-800 border-neutral-900"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed border-neutral-200"
            }`}
          >
            <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}