"use client"

import * as React from "react"
import { X, Type, Move, Trash2, Copy, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Plus, Image as ImageIcon, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Layers } from "lucide-react"

import { resolveTemplate, type AIResponse, generateBackgroundWithNanoBanana, type PromptAnalysis } from "@/lib/ai-helpers"

interface Layer {
  id: string
  type: "text" | "image"
  content: string
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
  fontFamily?: string
  color?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  align?: "left" | "center" | "right"
}

interface Screen {
  id: string
  name: string
  backgroundColor: string
  layers: Layer[]
}

interface DesignCanvasProps {
  onClose: () => void
  userPrompt?: string
  uploadedScreenshots?: string[]
  aiStructure?: AIResponse // AI-generated structure
  promptAnalysis?: PromptAnalysis // Enhanced prompt analysis from Gemini
}

export function DesignCanvas({ onClose, userPrompt, uploadedScreenshots = [], aiStructure, promptAnalysis }: DesignCanvasProps) {
  const [screens, setScreens] = React.useState<Screen[]>([])
  const [currentScreenId, setCurrentScreenId] = React.useState("")
  const [selectedLayer, setSelectedLayer] = React.useState<string | null>(null)
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [isPanning, setIsPanning] = React.useState(false)
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 })
  const [spacePressed, setSpacePressed] = React.useState(false)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isGeneratingBackground, setIsGeneratingBackground] = React.useState(false)
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const canvasRef = React.useRef<HTMLDivElement>(null)

  // Generate screens from uploaded screenshots + AI structure
  React.useEffect(() => {
    if (uploadedScreenshots.length > 0 && screens.length === 0) {
      generateScreensFromAIStructure()
    }
  }, [uploadedScreenshots, aiStructure])

  const generateScreensFromAIStructure = () => {
    setIsGenerating(true)
    
    setTimeout(() => {
      let generatedScreens: Screen[] = []

      if (aiStructure && aiStructure.screens) {
        // Use AI structure to generate screens
        generatedScreens = aiStructure.screens.map((screenSpec, index) => {
          const screenshot = uploadedScreenshots[index] || uploadedScreenshots[0]
          const canvasState = resolveTemplate(screenSpec, screenshot, index)
          
          return {
            id: screenSpec.id,
            name: `Screen ${index + 1}`,
            backgroundColor: canvasState.backgroundColor,
            layers: canvasState.layers.map(layer => ({
              ...layer,
              type: layer.type as "text" | "image"
            }))
          }
        })
      } else {
        // Fallback to smart generation
        generatedScreens = uploadedScreenshots.map((screenshot, index) => ({
          id: `screen_${index + 1}`,
          name: `Screenshot ${index + 1}`,
          backgroundColor: getRandomBackground(),
          layers: [
            {
              id: `bg_img_${index}`,
              type: "image",
              content: screenshot,
              x: 37.5,
              y: 100,
              width: 300,
              height: 500,
            },
            {
              id: `headline_${index}`,
              type: "text",
              content: generateContextualHeadline(index, extractAppContext(userPrompt || '')),
              x: 20,
              y: 30,
              width: 335,
              height: 50,
              fontSize: 28,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              color: "#000000",
              bold: true,
              align: "center"
            },
            {
              id: `subtitle_${index}`,
              type: "text",
              content: generateContextualSubtitle(index, extractAppContext(userPrompt || '')),
              x: 20,
              y: 610,
              width: 335,
              height: 40,
              fontSize: 14,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              color: "#666666",
              align: "center"
            }
          ]
        }))
      }

      setScreens(generatedScreens)
      setCurrentScreenId(generatedScreens[0]?.id || "")
      setIsGenerating(false)
    }, 1500)
  }

  const extractAppContext = (prompt: string): string => {
    const lower = prompt.toLowerCase()
    if (lower.includes('finance') || lower.includes('budget') || lower.includes('money')) return 'finance'
    if (lower.includes('fitness') || lower.includes('health') || lower.includes('workout')) return 'fitness'
    if (lower.includes('meditation') || lower.includes('mindfulness') || lower.includes('calm')) return 'meditation'
    if (lower.includes('social') || lower.includes('chat') || lower.includes('message')) return 'social'
    if (lower.includes('food') || lower.includes('recipe') || lower.includes('cooking')) return 'food'
    if (lower.includes('travel') || lower.includes('trip')) return 'travel'
    return 'general'
  }

  const generateContextualHeadline = (index: number, context: string): string => {
    const headlines: Record<string, string[]> = {
      finance: ["Track Every Expense", "Budget Smarter", "Reach Your Goals", "Control Your Money", "Save More Today"],
      fitness: ["Achieve Your Goals", "Track Your Progress", "Stay Motivated", "Transform Your Body", "Get Stronger"],
      meditation: ["Find Your Peace", "Breathe & Relax", "Mindful Moments", "Reduce Stress", "Inner Calm"],
      social: ["Stay Connected", "Share Your Story", "Build Community", "Connect & Engage", "Join The Conversation"],
      food: ["Cook Like A Pro", "Delicious Recipes", "Meal Planning Made Easy", "Healthy & Tasty", "Your Kitchen Companion"],
      travel: ["Explore The World", "Plan Your Journey", "Discover New Places", "Travel Smarter", "Adventure Awaits"],
      general: ["Transform Your Experience", "Built For You", "Simple. Powerful.", "Everything You Need", "Start Today"]
    }
    const contextHeadlines = headlines[context] || headlines.general
    return contextHeadlines[index % contextHeadlines.length]
  }

  const generateContextualSubtitle = (index: number, context: string): string => {
    const subtitles: Record<string, string[]> = {
      finance: ["Smart insights for your money", "Reach your savings goals faster", "Budget with confidence", "Financial freedom starts here", "Your money, simplified"],
      fitness: ["Personalized workouts for your goals", "Track progress & stay consistent", "Join thousands getting results", "Your fitness journey begins", "Transform your lifestyle"],
      meditation: ["Guided sessions for peace of mind", "Reduce stress in minutes", "Your daily moment of calm", "Find balance & clarity", "Breathe. Relax. Reset."],
      social: ["Connect with people who matter", "Share moments that count", "Build meaningful relationships", "Your community awaits", "Express yourself freely"],
      food: ["Hundreds of delicious recipes", "Plan meals in seconds", "Healthy eating made simple", "Cook with confidence", "Discover new favorites"],
      travel: ["Plan trips with ease", "Discover hidden gems", "Travel guides at your fingertips", "Make memories everywhere", "Your next adventure starts here"],
      general: ["Features that work for you", "Designed with your needs in mind", "Simple, intuitive, powerful", "Join thousands of happy users", "Experience the difference"]
    }
    const contextSubtitles = subtitles[context] || subtitles.general
    return contextSubtitles[index % contextSubtitles.length]
  }

  const generateHeadline = (index: number): string => {
    return generateContextualHeadline(index, 'general')
  }

  const generateSubtitle = (index: number): string => {
    return generateContextualSubtitle(index, 'general')
  }

  const getRandomBackground = (): string => {
    // Use colors from prompt analysis if available
    if (promptAnalysis?.visualStyle?.colorScheme) {
      return promptAnalysis.visualStyle.colorScheme[0] || '#F0F4FF'
    }
    const backgrounds = ['#F0F4FF', '#FFF0F5', '#F0FFF4', '#FFFBEB', '#FEF2F2', '#F0FDFA']
    return backgrounds[Math.floor(Math.random() * backgrounds.length)]
  }

  const generateAIBackground = async () => {
    if (!currentScreen) return
    
    setIsGeneratingBackground(true)
    try {
      const backgroundPrompt = promptAnalysis 
        ? `${promptAnalysis.visualStyle.mood} background for ${promptAnalysis.appCategory} app. Colors: ${promptAnalysis.visualStyle.colorScheme.join(", ")}. Style: ${promptAnalysis.visualStyle.designStyle}`
        : `Modern app store screenshot background for ${userPrompt || 'mobile app'}`
      
      const generatedBackground = await generateBackgroundWithNanoBanana(backgroundPrompt)
      updateScreenBackground(generatedBackground)
    } catch (error) {
      console.error("Background generation failed:", error)
    } finally {
      setIsGeneratingBackground(false)
    }
  }

  // Initialize with default screen if no uploads
  React.useEffect(() => {
    if (uploadedScreenshots.length === 0 && screens.length === 0) {
      const defaultScreen: Screen = {
        id: "1",
        name: "Screen 1",
        backgroundColor: "#F0F4FF",
        layers: [
          {
            id: "1",
            type: "text",
            content: "Your App Name",
            x: 50,
            y: 100,
            width: 275,
            height: 60,
            fontSize: 32,
            color: "#000000",
            bold: true,
            align: "center"
          },
          {
            id: "2",
            type: "text",
            content: "Discover amazing features",
            x: 50,
            y: 180,
            width: 275,
            height: 40,
            fontSize: 16,
            color: "#666666",
            align: "center"
          }
        ]
      }
      setScreens([defaultScreen])
      setCurrentScreenId("1")
    }
  }, [uploadedScreenshots.length, screens.length])

  // Handle space key for panning
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !spacePressed) {
        e.preventDefault()
        setSpacePressed(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setSpacePressed(false)
        setIsPanning(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [spacePressed])

  // Get current screen and layers - AFTER all hooks
  const currentScreen = screens.find(s => s.id === currentScreenId)
  const layers = currentScreen?.layers || []

  // Early return AFTER all hooks
  if (!currentScreen) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <p className="text-neutral-500">Loading canvas...</p>
      </div>
    )
  }

  const handleMouseDown = (layerId: string, e: React.MouseEvent, screenId: string) => {
    if (spacePressed) return
    e.stopPropagation()
    setCurrentScreenId(screenId)
    setSelectedLayer(layerId)
    setDragging(layerId)
    const screen = screens.find(s => s.id === screenId)
    const layer = screen?.layers.find(l => l.id === layerId)
    if (layer) {
      setDragStart({ x: e.clientX - layer.x, y: e.clientY - layer.y })
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (spacePressed) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && spacePressed) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      })
      return
    }
    
    if (dragging && !spacePressed) {
      updateLayers(prev => prev.map(layer => 
        layer.id === dragging 
          ? { ...layer, x: (e.clientX - dragStart.x) / zoom, y: (e.clientY - dragStart.y) / zoom }
          : layer
      ))
    }
  }

  const handleMouseUp = () => {
    setDragging(null)
    setIsPanning(false)
  }

  const updateLayers = (updater: (layers: Layer[]) => Layer[]) => {
    setScreens(prev => prev.map(screen => 
      screen.id === currentScreenId 
        ? { ...screen, layers: updater(screen.layers) }
        : screen
    ))
  }

  const addScreen = () => {
    const newScreen: Screen = {
      id: Date.now().toString(),
      name: `Screen ${screens.length + 1}`,
      backgroundColor: "#FFFFFF",
      layers: []
    }
    setScreens([...screens, newScreen])
    setCurrentScreenId(newScreen.id)
  }

  const updateScreenBackground = (color: string) => {
    setScreens(prev => prev.map(screen => 
      screen.id === currentScreenId 
        ? { ...screen, backgroundColor: color }
        : screen
    ))
  }

  const addTextLayer = () => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      type: "text",
      content: "New Text",
      x: 100,
      y: 250,
      width: 200,
      height: 40,
      fontSize: 20,
      color: "#000000",
      bold: false,
      italic: false,
      underline: false,
      align: "left"
    }
    updateLayers(prev => [...prev, newLayer])
    setSelectedLayer(newLayer.id)
  }

  const deleteLayer = (layerId: string) => {
    updateLayers(prev => prev.filter(l => l.id !== layerId))
    if (selectedLayer === layerId) {
      setSelectedLayer(null)
    }
  }

  const updateLayerContent = (layerId: string, content: string) => {
    updateLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, content } : layer
    ))
  }

  const updateLayerStyle = (layerId: string, style: Partial<Layer>) => {
    updateLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, ...style } : layer
    ))
  }

  const selectedLayerData = layers.find(l => l.id === selectedLayer)

  return (
    <div className="w-full bg-white overflow-hidden shrink-0 h-full flex flex-col">
      {/* Loading State */}
      {isGenerating && (
        <div className="absolute inset-0 bg-white/90 z-50 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-neutral-800 border-r-transparent mb-4"></div>
            <p className="text-xs sm:text-sm text-neutral-600">Generating your App Store screenshots...</p>
          </div>
        </div>
      )}

      {/* Canvas Header - Minimalist */}
      <div className="bg-white border-b border-neutral-100 px-3 sm:px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-50 rounded-md transition-all duration-200"
          >
            <X className="h-4 w-4 text-neutral-500 hover:text-neutral-900" />
          </button>
          <div className="hidden sm:block h-4 w-px bg-neutral-100" />
          <h2 className="text-sm font-semibold text-neutral-900">Canvas Editor</h2>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden lg:flex items-center gap-1 bg-neutral-50 rounded-md px-2 py-1">
            <button 
              onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
              className="p-1 hover:bg-white rounded transition-all duration-200"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5 text-neutral-500" />
            </button>
            <span className="text-xs text-neutral-600 min-w-[45px] text-center">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
              className="p-1 hover:bg-white rounded transition-all duration-200"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5 text-neutral-500" />
            </button>
          </div>
          <button 
            onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }) }}
            className="hidden lg:block px-2.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50 rounded-md transition-all duration-200"
          >
            Reset
          </button>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-neutral-50 rounded-md transition-all duration-200"
            title={sidebarOpen ? "Hide Panel" : "Show Panel"}
          >
            <Layers className="h-4 w-4 text-neutral-500 hover:text-neutral-900" />
          </button>
          <div className="hidden sm:block h-4 w-px bg-neutral-100" />
          <button className="px-3 sm:px-4 py-1.5 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 rounded-md transition-all duration-200">
            Export
          </button>
        </div>
      </div>

      {/* Main Content Area - Flex Row */}
      <div className="flex-1 flex overflow-hidden flex-col sm:flex-row">
        {/* Canvas Area - Scrollable - Minimalist */}
        <div 
          ref={canvasRef}
          className={`flex-1 p-8 overflow-auto flex items-center justify-center bg-neutral-50 ${spacePressed ? 'cursor-grab' : ''} ${isPanning ? 'cursor-grabbing' : ''}`}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            className="flex gap-8 min-w-max"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`
            }}
          >
            {screens.map((screen) => (
              <div 
                key={screen.id}
                className={`relative bg-white rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md ${
                  currentScreenId === screen.id ? 'ring-2 ring-neutral-900 shadow-lg' : 'ring-1 ring-neutral-200'
                }`}
                style={{ 
                  width: `${375 * zoom}px`, 
                  height: `${667 * zoom}px`,
                  backgroundColor: screen.backgroundColor,
                  flexShrink: 0,
                  minWidth: '200px'
                }}
                onClick={() => setCurrentScreenId(screen.id)}
              >
                {/* Screen Label - Minimalist */}
                <div className="absolute -top-8 left-0 text-xs font-medium text-neutral-400">{screen.name}</div>

                {/* Draggable Layers - Minimalist */}
                {screen.layers.map(layer => (
                  <div
                    key={layer.id}
                    className={`absolute ${!spacePressed ? 'cursor-move' : ''} transition-all duration-200 ${
                      selectedLayer === layer.id && currentScreenId === screen.id 
                        ? 'ring-2 ring-neutral-900 ring-offset-2' 
                        : 'hover:ring-1 hover:ring-neutral-300'
                    }`}
                    style={{
                      left: layer.x * zoom,
                      top: layer.y * zoom,
                      width: layer.width * zoom,
                      height: layer.height * zoom,
                    }}
                    onMouseDown={(e) => handleMouseDown(layer.id, e, screen.id)}
                  >
                    {layer.type === "text" && (
                      <div
                        className="w-full h-full flex items-center px-2"
                        style={{
                          fontSize: (layer.fontSize || 20) * zoom,
                          fontFamily: layer.fontFamily || 'inherit',
                          color: layer.color,
                          fontWeight: layer.bold ? 700 : 400,
                          fontStyle: layer.italic ? 'italic' : 'normal',
                          textDecoration: layer.underline ? 'underline' : 'none',
                          textAlign: layer.align || 'left',
                          justifyContent: 
                            layer.align === 'center' ? 'center' : 
                            layer.align === 'right' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        {layer.content}
                      </div>
                    )}
                    {layer.type === "image" && (
                      <img
                        src={layer.content}
                        alt="App screenshot"
                        className="w-full h-full rounded-xl shadow-sm"
                        draggable={false}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Tools Sidebar - Animated & Collapsible - Minimalist */}
        <div 
          className={`bg-white border-l border-neutral-100 overflow-y-auto shrink-0 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-[320px]' : 'w-0 border-l-0'
          }`}
          style={{
            opacity: sidebarOpen ? 1 : 0,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(20px)'
          }}
        >
          <div className={`p-4 space-y-4 ${sidebarOpen ? 'block' : 'hidden'}`}>
          {/* User Prompt & AI Analysis - Minimalist */}
          {userPrompt && (
            <div className="space-y-3">
              <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  "{userPrompt.length > 80 ? userPrompt.slice(0, 80) + '...' : userPrompt}"
                </p>
              </div>
              
              {promptAnalysis && (
                <div className="bg-linear-to-br from-neutral-50 to-neutral-100/50 rounded-lg p-3 border border-neutral-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-md bg-neutral-900 flex items-center justify-center text-white text-xs font-semibold">
                      AI
                    </div>
                    <h4 className="text-xs font-semibold text-neutral-900">Smart Analysis</h4>
                  </div>
                  
                  <div className="space-y-2.5 text-xs text-neutral-600">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Category</span>
                      <span className="font-medium text-neutral-900">{promptAnalysis.appCategory}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Audience</span>
                      <span className="font-medium text-neutral-900">{promptAnalysis.targetAudience}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block mb-1.5">Key Features</span>
                      <div className="flex flex-wrap gap-1.5">
                        {promptAnalysis.keyFeatures.slice(0, 3).map((feature, i) => (
                          <span key={i} className="px-2 py-1 bg-white rounded-md text-[10px] font-medium text-neutral-700 border border-neutral-200">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Design Style</span>
                      <span className="font-medium text-neutral-900">{promptAnalysis.visualStyle.mood}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Screens - Minimalist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-neutral-900">Screens</h3>
              <button
                onClick={addScreen}
                className="p-1.5 hover:bg-neutral-100 rounded-md transition-all duration-200"
              >
                <Plus className="h-4 w-4 text-neutral-500" />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {screens.map(screen => (
                <button
                  key={screen.id}
                  onClick={() => setCurrentScreenId(screen.id)}
                  className={`shrink-0 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                    currentScreenId === screen.id 
                      ? 'bg-neutral-900 text-white shadow-sm' 
                      : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  {screen.name}
                </button>
              ))}
            </div>
          </div>

          {/* Background Color - Minimalist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-neutral-900">Background</h3>
              <button
                onClick={generateAIBackground}
                disabled={isGeneratingBackground}
                className="px-2.5 py-1.5 text-xs font-medium bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isGeneratingBackground ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>AI</span>
                  </>
                ) : (
                  <>AI Gen</>
                )}
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="color"
                value={currentScreen.backgroundColor.startsWith('#') ? currentScreen.backgroundColor : '#F0F4FF'}
                onChange={(e) => updateScreenBackground(e.target.value)}
                className="w-full h-10 rounded-md border border-neutral-200 cursor-pointer"
              />
              <div className="grid grid-cols-6 gap-2">
                {[
                  '#FFFFFF', '#F5F5F5', '#000000',
                  '#F0F4FF', '#FFF0F5', '#F0FFF4',
                  '#FFFBEB', '#FEF2F2', '#F0FDFA',
                  '#FAF5FF', '#FDF4FF', '#ECFEFF'
                ].map(color => (
                  <button
                    key={color}
                    onClick={() => updateScreenBackground(color)}
                    className={`w-full aspect-square rounded-md border-2 transition-all duration-200 ${
                      currentScreen.backgroundColor === color 
                        ? 'border-neutral-900 scale-105 shadow-sm' 
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Add Tools - Minimalist */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-900">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={addTextLayer}
                className="p-3 rounded-md border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-200 flex flex-col items-center gap-2 group"
              >
                <Type className="h-5 w-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                <span className="text-xs font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors">Text</span>
              </button>
              <button 
                className="p-3 rounded-md border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-200 flex flex-col items-center gap-2 group"
              >
                <ImageIcon className="h-5 w-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                <span className="text-xs font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors">Image</span>
              </button>
            </div>
          </div>

          {/* Layers List - Minimalist */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-neutral-900">Layers</h3>
            <div className="space-y-1.5">
              {layers.map(layer => (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`px-3 py-2.5 rounded-md cursor-pointer flex items-center justify-between group transition-all duration-200 ${
                    selectedLayer === layer.id 
                      ? 'bg-neutral-900 text-white shadow-sm' 
                      : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {layer.type === "text" ? (
                      <Type className={`h-4 w-4 ${selectedLayer === layer.id ? 'text-white' : 'text-neutral-400'}`} />
                    ) : (
                      <ImageIcon className={`h-4 w-4 ${selectedLayer === layer.id ? 'text-white' : 'text-neutral-400'}`} />
                    )}
                    <span className={`text-xs font-medium truncate max-w-[150px] ${
                      selectedLayer === layer.id ? 'text-white' : 'text-neutral-700'
                    }`}>
                      {layer.content.length > 20 ? layer.content.slice(0, 20) + '...' : layer.content}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteLayer(layer.id)
                    }}
                    className={`p-1 hover:bg-red-100 rounded-md transition-colors ${
                      selectedLayer === layer.id ? 'opacity-0 group-hover:opacity-100' : ''
                    }`}
                  >
                    <Trash2 className={`h-3.5 w-3.5 ${
                      selectedLayer === layer.id ? 'text-white hover:text-red-500' : 'text-neutral-400 hover:text-red-600'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Properties - Minimalist */}
          {selectedLayerData && (
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <h3 className="text-xs font-semibold text-neutral-900">Properties</h3>
              
              {selectedLayerData.type === "text" && (
                <>
                  <div>
                    <label className="text-xs font-medium text-neutral-500 mb-2 block">Content</label>
                    <textarea
                      value={selectedLayerData.content}
                      onChange={(e) => updateLayerContent(selectedLayerData.id, e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none bg-white"
                      rows={2}
                      placeholder="Enter text..."
                    />
                  </div>

                  {/* Text Formatting - Minimalist */}
                  <div>
                    <label className="text-xs font-medium text-neutral-500 mb-2 block">Style</label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { bold: !selectedLayerData.bold })}
                        className={`flex-1 p-2 rounded-md border transition-all duration-200 ${
                          selectedLayerData.bold 
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <Bold className="h-4 w-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { italic: !selectedLayerData.italic })}
                        className={`flex-1 p-2 rounded-md border transition-all duration-200 ${
                          selectedLayerData.italic 
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <Italic className="h-4 w-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { underline: !selectedLayerData.underline })}
                        className={`flex-1 p-2 rounded-md border transition-all duration-200 ${
                          selectedLayerData.underline 
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <Underline className="h-4 w-4 mx-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Text Alignment - Minimalist */}
                  <div>
                    <label className="text-xs font-medium text-neutral-500 mb-2 block">Alignment</label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { align: 'left' })}
                        className={`flex-1 p-2 rounded-md border transition-all duration-200 ${
                          selectedLayerData.align === 'left' 
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <AlignLeft className="h-4 w-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { align: 'center' })}
                        className={`flex-1 p-2 rounded-md border transition-all duration-200 ${
                          selectedLayerData.align === 'center' 
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <AlignCenter className="h-4 w-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { align: 'right' })}
                        className={`flex-1 p-2 rounded-md border transition-all duration-200 ${
                          selectedLayerData.align === 'right' 
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <AlignRight className="h-4 w-4 mx-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Font Family - Minimalist */}
                  <div>
                    <label className="text-xs font-medium text-neutral-500 mb-2 block">Font</label>
                    <select
                      value={selectedLayerData.fontFamily || 'inherit'}
                      onChange={(e) => updateLayerStyle(selectedLayerData.id, { fontFamily: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent bg-white"
                    >
                      <option value="inherit">Default (System)</option>
                      <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">SF Pro (iOS)</option>
                      <option value="'Inter', sans-serif">Inter</option>
                      <option value="'Poppins', sans-serif">Poppins</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                      <option value="'Montserrat', sans-serif">Montserrat</option>
                      <option value="'Open Sans', sans-serif">Open Sans</option>
                      <option value="'Lato', sans-serif">Lato</option>
                      <option value="'Raleway', sans-serif">Raleway</option>
                      <option value="'Nunito', sans-serif">Nunito</option>
                      <option value="'Playfair Display', serif">Playfair Display</option>
                      <option value="'Merriweather', serif">Merriweather</option>
                      <option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
                      <option value="'Oswald', sans-serif">Oswald</option>
                      <option value="'PT Sans', sans-serif">PT Sans</option>
                      <option value="'Ubuntu', sans-serif">Ubuntu</option>
                      <option value="'Work Sans', sans-serif">Work Sans</option>
                      <option value="'DM Sans', sans-serif">DM Sans</option>
                      <option value="'Rubik', sans-serif">Rubik</option>
                      <option value="'Manrope', sans-serif">Manrope</option>
                      <option value="'Space Grotesk', sans-serif">Space Grotesk</option>
                      <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans</option>
                      <option value="'Outfit', sans-serif">Outfit</option>
                      <option value="'Quicksand', sans-serif">Quicksand</option>
                      <option value="'Barlow', sans-serif">Barlow</option>
                      <option value="'Karla', sans-serif">Karla</option>
                      <option value="'Lexend', sans-serif">Lexend</option>
                      <option value="'Sora', sans-serif">Sora</option>
                      <option value="'Epilogue', sans-serif">Epilogue</option>
                      <option value="'Red Hat Display', sans-serif">Red Hat Display</option>
                      <option value="'IBM Plex Sans', sans-serif">IBM Plex Sans</option>
                      <option value="'Mulish', sans-serif">Mulish</option>
                      <option value="'Archivo', sans-serif">Archivo</option>
                      <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">Helvetica</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="'Times New Roman', Times, serif">Times New Roman</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                    </select>
                  </div>

                  {/* Font Size - Minimalist */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-neutral-500">Size</label>
                      <span className="text-xs font-semibold text-neutral-900">{selectedLayerData.fontSize || 20}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={selectedLayerData.fontSize || 20}
                      onChange={(e) => updateLayerStyle(selectedLayerData.id, { fontSize: parseInt(e.target.value) })}
                      className="w-full h-2 bg-neutral-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-neutral-500 mb-2 block">Color</label>
                    <div className="space-y-3">
                      <input
                        type="color"
                        value={selectedLayerData.color}
                        onChange={(e) => updateLayerStyle(selectedLayerData.id, { color: e.target.value })}
                        className="w-full h-10 rounded-md border border-neutral-200 cursor-pointer"
                      />
                      <div className="grid grid-cols-4 gap-2">
                        {['#000000', '#FFFFFF', '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                          <button
                            key={color}
                            onClick={() => updateLayerStyle(selectedLayerData.id, { color })}
                            className={`w-full aspect-square rounded-md border-2 transition-all duration-200 ${
                              selectedLayerData.color === color 
                                ? 'border-neutral-900 scale-105 shadow-sm' 
                                : 'border-neutral-200 hover:border-neutral-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tips - Minimalist */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <h3 className="text-xs font-semibold text-neutral-900">Quick Tips</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-neutral-600">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0"></div>
                <p>Drag elements to reposition</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-neutral-600">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0"></div>
                <p>Hold <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded text-[10px] font-medium border border-neutral-200">Space</kbd> + drag to pan</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-neutral-600">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0"></div>
                <p>Use zoom to scale canvas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

