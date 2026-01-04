"use client"

import * as React from "react"
import { X, Type, Move, Trash2, Copy, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Plus, Image as ImageIcon, ZoomIn, ZoomOut } from "lucide-react"

import { resolveTemplate, type AIResponse } from "@/lib/ai-helpers"

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
}

export function DesignCanvas({ onClose, userPrompt, uploadedScreenshots = [], aiStructure }: DesignCanvasProps) {
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
    const backgrounds = ['#F0F4FF', '#FFF0F5', '#F0FFF4', '#FFFBEB', '#FEF2F2', '#F0FDFA']
    return backgrounds[Math.floor(Math.random() * backgrounds.length)]
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
    <div className="w-full bg-white border-l border-neutral-200 overflow-hidden shrink-0 h-full flex flex-col">
      {/* Loading State */}
      {isGenerating && (
        <div className="absolute inset-0 bg-white/90 z-50 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-neutral-800 border-r-transparent mb-4"></div>
            <p className="text-xs sm:text-sm text-neutral-600">Generating your App Store screenshots...</p>
          </div>
        </div>
      )}

      {/* Canvas Header */}
      <div className="bg-white border-b border-neutral-200 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-600" />
          </button>
          <h2 className="text-xs sm:text-sm font-medium text-neutral-700">Edit Screenshot</h2>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
            className="p-1 sm:p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-600" />
          </button>
          <span className="text-[10px] sm:text-xs text-neutral-600 min-w-[35px] sm:min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
          <button 
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            className="p-1 sm:p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-600" />
          </button>
          <button 
            onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }) }}
            className="hidden sm:block px-2 sm:px-3 py-1 sm:py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors ml-1 sm:ml-2"
          >
            Reset
          </button>
          <div className="hidden sm:block h-4 w-px bg-neutral-300 mx-1" />
          <button className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-black text-white hover:bg-neutral-800 rounded-lg transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* Main Content Area - Flex Row */}
      <div className="flex-1 flex overflow-hidden flex-col sm:flex-row">
        {/* Canvas Area - Scrollable */}
        <div 
          ref={canvasRef}
          className={`flex-1 p-2 sm:p-4 md:p-8 overflow-auto flex items-center bg-neutral-200 ${spacePressed ? 'cursor-grab' : ''} ${isPanning ? 'cursor-grabbing' : ''}`}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            className="flex gap-4 sm:gap-6 md:gap-8 min-w-max"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`
            }}
          >
            {screens.map((screen) => (
              <div 
                key={screen.id}
                className={`relative bg-white rounded-lg transition-all ${
                  currentScreenId === screen.id ? 'ring-2 ring-neutral-400' : ''
                }`}
                style={{ 
                  width: `${375 * zoom}px`, 
                  height: `${667 * zoom}px`,
                  backgroundColor: screen.backgroundColor,
                  flexShrink: 0,
                  minWidth: '200px' // Ensure minimum readable size on mobile
                }}
                onClick={() => setCurrentScreenId(screen.id)}
              >
                {/* Screen Label */}
                <div className="absolute -top-6 left-0 text-xs text-neutral-500">{screen.name}</div>

                {/* Draggable Layers */}
                {screen.layers.map(layer => (
                  <div
                    key={layer.id}
                    className={`absolute ${!spacePressed ? 'cursor-move' : ''} ${selectedLayer === layer.id && currentScreenId === screen.id ? 'ring-2 ring-neutral-800' : ''}`}
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
                        className="w-full h-full object-contain rounded-lg shadow-lg"
                        draggable={false}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Tools Sidebar - Fixed on Right, collapsible on mobile */}
        <div className="w-full sm:w-[280px] md:w-[320px] bg-white border-t sm:border-t-0 sm:border-l border-neutral-200 overflow-y-auto shrink-0 max-h-[40vh] sm:max-h-none">
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* User Prompt */}
          {userPrompt && (
            <div className="bg-neutral-50 rounded-lg p-2 sm:p-3">
              <p className="text-[10px] sm:text-xs text-neutral-600 leading-relaxed line-clamp-3 sm:line-clamp-none">
                "{userPrompt}"
              </p>
            </div>
          )}

          {/* Screens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-neutral-700">Screens</h3>
              <button
                onClick={addScreen}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-neutral-600" />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {screens.map(screen => (
                <button
                  key={screen.id}
                  onClick={() => setCurrentScreenId(screen.id)}
                  className={`shrink-0 px-3 py-2 rounded-lg text-xs transition-colors ${
                    currentScreenId === screen.id 
                      ? 'bg-neutral-800 text-white' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {screen.name}
                </button>
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-neutral-700">Background</h3>
            <div className="space-y-2">
              <input
                type="color"
                value={currentScreen.backgroundColor}
                onChange={(e) => updateScreenBackground(e.target.value)}
                className="w-full h-10 rounded border border-neutral-200 cursor-pointer"
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
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      currentScreen.backgroundColor === color 
                        ? 'border-neutral-800 scale-110' 
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Add Tools */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-neutral-700">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={addTextLayer}
                className="p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors flex flex-col items-center gap-1"
              >
                <Type className="h-4 w-4 text-neutral-600" />
                <span className="text-xs text-neutral-600">Text</span>
              </button>
              <button 
                className="p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors flex flex-col items-center gap-1"
              >
                <ImageIcon className="h-4 w-4 text-neutral-600" />
                <span className="text-xs text-neutral-600">Image</span>
              </button>
            </div>
          </div>

          {/* Layers List */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-neutral-700">Layers</h3>
            <div className="space-y-1">
              {layers.map(layer => (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between ${
                    selectedLayer === layer.id ? 'bg-neutral-100 border border-neutral-300' : 'bg-neutral-50 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Type className="h-3 w-3 text-neutral-500" />
                    <span className="text-xs text-neutral-700 truncate max-w-[150px]">
                      {layer.content}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteLayer(layer.id)
                    }}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="h-3 w-3 text-neutral-400 hover:text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Properties */}
          {selectedLayerData && (
            <div className="space-y-3 pt-2 border-t border-neutral-200">
              <h3 className="text-xs font-medium text-neutral-700">Properties</h3>
              
              {selectedLayerData.type === "text" && (
                <>
                  <div>
                    <label className="text-xs text-neutral-600 mb-1 block">Text Content</label>
                    <textarea
                      value={selectedLayerData.content}
                      onChange={(e) => updateLayerContent(selectedLayerData.id, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-neutral-800 resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Text Formatting */}
                  <div>
                    <label className="text-xs text-neutral-600 mb-1 block">Formatting</label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { bold: !selectedLayerData.bold })}
                        className={`p-2 rounded border transition-colors ${
                          selectedLayerData.bold 
                            ? 'bg-neutral-800 text-white border-neutral-800' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { italic: !selectedLayerData.italic })}
                        className={`p-2 rounded border transition-colors ${
                          selectedLayerData.italic 
                            ? 'bg-neutral-800 text-white border-neutral-800' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { underline: !selectedLayerData.underline })}
                        className={`p-2 rounded border transition-colors ${
                          selectedLayerData.underline 
                            ? 'bg-neutral-800 text-white border-neutral-800' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <Underline className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Text Alignment */}
                  <div>
                    <label className="text-xs text-neutral-600 mb-1 block">Alignment</label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { align: 'left' })}
                        className={`p-2 rounded border transition-colors ${
                          selectedLayerData.align === 'left' 
                            ? 'bg-neutral-800 text-white border-neutral-800' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <AlignLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { align: 'center' })}
                        className={`p-2 rounded border transition-colors ${
                          selectedLayerData.align === 'center' 
                            ? 'bg-neutral-800 text-white border-neutral-800' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <AlignCenter className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { align: 'right' })}
                        className={`p-2 rounded border transition-colors ${
                          selectedLayerData.align === 'right' 
                            ? 'bg-neutral-800 text-white border-neutral-800' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <AlignRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Font Family */}
                  <div>
                    <label className="text-xs text-neutral-600 mb-1 block">Font Family</label>
                    <select
                      value={selectedLayerData.fontFamily || 'inherit'}
                      onChange={(e) => updateLayerStyle(selectedLayerData.id, { fontFamily: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-neutral-800 bg-white"
                    >
                      <option value="inherit">Default (System)</option>
                      <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">SF Pro (iOS)</option>
                      <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">Helvetica</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="'Times New Roman', Times, serif">Times New Roman</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Courier New', Courier, monospace">Courier</option>
                      <option value="'Comic Sans MS', cursive">Comic Sans</option>
                      <option value="Impact, fantasy">Impact</option>
                      <option value="'Trebuchet MS', sans-serif">Trebuchet</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                    </select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="text-xs text-neutral-600 mb-1 block">Font Size</label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={selectedLayerData.fontSize || 20}
                      onChange={(e) => updateLayerStyle(selectedLayerData.id, { fontSize: parseInt(e.target.value) })}
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-800"
                    />
                    <span className="text-xs text-neutral-500">{selectedLayerData.fontSize || 20}px</span>
                  </div>
                  
                  <div>
                    <label className="text-xs text-neutral-600 mb-1 block">Color</label>
                    <div className="space-y-2">
                      <input
                        type="color"
                        value={selectedLayerData.color}
                        onChange={(e) => updateLayerStyle(selectedLayerData.id, { color: e.target.value })}
                        className="w-full h-8 rounded border border-neutral-200 cursor-pointer"
                      />
                      <div className="flex gap-2 flex-wrap">
                        {['#000000', '#FFFFFF', '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                          <button
                            key={color}
                            onClick={() => updateLayerStyle(selectedLayerData.id, { color })}
                            className={`w-7 h-7 rounded border-2 ${
                              selectedLayerData.color === color ? 'border-neutral-800' : 'border-neutral-200'
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

          {/* Tips */}
          <div className="space-y-2 pt-2 border-t border-neutral-200">
            <h3 className="text-xs font-medium text-neutral-700">Tips</h3>
            <div className="space-y-1">
              <div className="p-2 rounded bg-neutral-50">
                <p className="text-xs text-neutral-600">Drag elements to reposition</p>
              </div>
              <div className="p-2 rounded bg-neutral-50">
                <p className="text-xs text-neutral-600">Hold Space + Drag to pan</p>
              </div>
              <div className="p-2 rounded bg-neutral-50">
                <p className="text-xs text-neutral-600">Use zoom controls to scale</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

