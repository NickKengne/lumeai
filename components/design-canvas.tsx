"use client"

import * as React from "react"
import { X, Type, Move, Trash2, Copy, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Plus, Image as ImageIcon, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Layers, Layout, Check, Video, Download, Share2 } from "lucide-react"
import { VideoGenerator } from "./video-generator"

import { resolveTemplate, type AIResponse, generateBackgroundWithNanoBanana, type PromptAnalysis } from "@/lib/ai-helpers"
import { IphoneMockup } from "./iphone-mockup"
import { type ScreenshotAnalysisResult, generateLayoutForScreenshot, type ScreenAssetLayout } from "@/lib/screenshot-analyzer"

interface Layer {
  id: string
  type: "text" | "image" | "mockup" | "background" | "decoration"
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
  // Mockup specific
  mockupFrame?: {
    x: number
    y: number
    width: number
    height: number
    borderRadius?: number
  }
  // Background specific
  backgroundColor?: string
  backgroundGradient?: {
    type: "linear" | "radial"
    colors: string[]
    angle?: number
  }
}

interface Screen {
  id: string
  name: string
  backgroundColor: string
  layers: Layer[]
  templateId?: string // Track which template is being used
}

interface DesignCanvasProps {
  onClose: () => void
  userPrompt?: string
  uploadedScreenshots?: string[]
  uploadedLogo?: string
  uploadedAssets?: string[]
  screenshotAnalysis?: ScreenshotAnalysisResult | null
  aiStructure?: AIResponse // AI-generated structure
  promptAnalysis?: PromptAnalysis // Enhanced prompt analysis from Gemini
}

export function DesignCanvas({ onClose, userPrompt, uploadedScreenshots = [], uploadedLogo, uploadedAssets = [], screenshotAnalysis, aiStructure, promptAnalysis }: DesignCanvasProps) {
  const [screens, setScreens] = React.useState<Screen[]>([])
  const [currentScreenId, setCurrentScreenId] = React.useState("")
  const [selectedLayer, setSelectedLayer] = React.useState<string | null>(null)
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [resizing, setResizing] = React.useState<string | null>(null)
  const [resizeStart, setResizeStart] = React.useState({ x: 0, y: 0, width: 0, height: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [isPanning, setIsPanning] = React.useState(false)
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 })
  const [spacePressed, setSpacePressed] = React.useState(false)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isGeneratingBackground, setIsGeneratingBackground] = React.useState(false)
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const [showVideoGenerator, setShowVideoGenerator] = React.useState(false)
  const [showShareModal, setShowShareModal] = React.useState(false)
  const [shareLink, setShareLink] = React.useState("")
  const [isExporting, setIsExporting] = React.useState(false)
  const canvasRef = React.useRef<HTMLDivElement>(null)
  const rafRef = React.useRef<number | null>(null)
  const dragPositionRef = React.useRef({ x: 0, y: 0 })
  const resizeDimensions = React.useRef({ width: 0, height: 0 })
  const isDraggingRef = React.useRef(false)

  // Generate screens from uploaded screenshots + AI structure
  React.useEffect(() => {
    if (uploadedScreenshots.length > 0 && screens.length === 0) {
      generateScreensFromAIStructure()
    }
  }, [uploadedScreenshots, aiStructure])

  const generateScreensFromAIStructure = async () => {
    setIsGenerating(true)
    
    try {
      const generatedScreens: Screen[] = []

      for (let index = 0; index < uploadedScreenshots.length; index++) {
        const screenshot = uploadedScreenshots[index]
        
        const aiLayout = await generateLayoutForScreenshot(
          screenshot,
          userPrompt || 'mobile app',
          uploadedLogo,
          index
        )

        if (aiLayout) {
          const layers = createLayersFromAILayout(aiLayout, screenshot, uploadedLogo)
          generatedScreens.push({
            id: `screen_${index + 1}`,
            name: `Screen ${index + 1}`,
            backgroundColor: aiLayout.backgroundColor,
            layers
          })
        } else {
          const fallbackLayers = createFallbackLayers(screenshot, index, uploadedLogo)
          generatedScreens.push({
            id: `screen_${index + 1}`,
            name: `Screen ${index + 1}`,
            backgroundColor: getRandomBackground(index),
            layers: fallbackLayers
          })
        }
      }

      setScreens(generatedScreens)
      setCurrentScreenId(generatedScreens[0]?.id || "")
    } catch (error) {
      console.error('Failed to generate screens:', error)
      const fallbackScreens = uploadedScreenshots.map((screenshot, index) => ({
        id: `screen_${index + 1}`,
        name: `Screen ${index + 1}`,
        backgroundColor: getRandomBackground(index),
        layers: createFallbackLayers(screenshot, index, uploadedLogo)
      }))
      setScreens(fallbackScreens)
      setCurrentScreenId(fallbackScreens[0]?.id || "")
    } finally {
      setIsGenerating(false)
    }
  }

  const createLayersFromAILayout = (layout: ScreenAssetLayout, screenshot: string, logo?: string): Layer[] => {
    const layers: Layer[] = []

    layers.push({
      id: `bg_${Date.now()}`,
      type: "background",
      content: "",
      x: 0,
      y: 0,
      width: 1242,
      height: 2688,
      backgroundColor: layout.backgroundColor
    })

    layers.push({
      id: `mockup_${Date.now()}`,
      type: "mockup",
      content: screenshot,
      x: layout.screenshotPosition.x,
      y: layout.screenshotPosition.y,
      width: layout.screenshotPosition.width,
      height: layout.screenshotPosition.height,
      mockupFrame: {
        x: 0,
        y: 0,
        width: layout.screenshotPosition.width,
        height: layout.screenshotPosition.height,
        borderRadius: 40
      }
    })

    layers.push({
      id: `headline_${Date.now()}`,
      type: "text",
      content: layout.headline,
      x: layout.headlinePosition.x,
      y: layout.headlinePosition.y,
      width: 1000,
      height: 100,
      fontSize: layout.fontSize?.headline || 72,
      fontFamily: layout.fontFamily || screenshotAnalysis?.typography?.primaryFont || 'Inter',
      color: layout.textColor,
      bold: true,
      align: "center"
    })

    if (layout.subtitle && layout.subtitlePosition) {
      layers.push({
        id: `subtitle_${Date.now()}`,
        type: "text",
        content: layout.subtitle,
        x: layout.subtitlePosition.x,
        y: layout.subtitlePosition.y,
        width: 900,
        height: 60,
        fontSize: layout.fontSize?.subtitle || 36,
        fontFamily: layout.fontFamily || screenshotAnalysis?.typography?.primaryFont || 'Inter',
        color: layout.textColor,
        align: "center"
      })
    }

    if (logo && layout.logoPosition) {
      layers.push({
        id: `logo_${Date.now()}`,
        type: "image",
        content: logo,
        x: layout.logoPosition.x,
        y: layout.logoPosition.y,
        width: layout.logoPosition.width,
        height: layout.logoPosition.height
      })
    }

    if (layout.additionalAssets) {
      layout.additionalAssets.forEach((asset, idx) => {
        if (uploadedAssets[idx]) {
          layers.push({
            id: `asset_${Date.now()}_${idx}`,
            type: "decoration",
            content: uploadedAssets[idx],
            x: asset.position.x,
            y: asset.position.y,
            width: asset.position.width,
            height: asset.position.height
          })
        }
      })
    }

    return layers
  }

  const createFallbackLayers = (screenshot: string, index: number, logo?: string): Layer[] => {
    const layers: Layer[] = []
    const bgColor = getRandomBackground(index)

    layers.push({
      id: `bg_${Date.now()}`,
      type: "background",
      content: "",
      x: 0,
      y: 0,
      width: 1242,
      height: 2688,
      backgroundColor: bgColor
    })

    layers.push({
      id: `mockup_${Date.now()}`,
      type: "mockup",
      content: screenshot,
      x: 371,
      y: 900,
      width: 500,
      height: 1080,
      mockupFrame: {
        x: 0,
        y: 0,
        width: 500,
        height: 1080,
        borderRadius: 40
      }
    })

    layers.push({
      id: `headline_${Date.now()}`,
      type: "text",
      content: `Feature ${index + 1}`,
      x: 621,
      y: 400,
      width: 1000,
      height: 100,
      fontSize: 72,
      fontFamily: screenshotAnalysis?.typography?.primaryFont || 'Inter',
      color: "#1A1A1A",
      bold: true,
      align: "center"
    })

    if (logo) {
      layers.push({
        id: `logo_${Date.now()}`,
        type: "image",
        content: logo,
        x: 80,
        y: 120,
        width: 100,
        height: 100
      })
    }

    return layers
  }


  const getRandomBackground = (index: number = 0): string => {
    // Priority 1: Use colors from screenshot analysis (extracted from actual app)
    if (screenshotAnalysis?.suggestedBackgrounds?.length) {
      return screenshotAnalysis.suggestedBackgrounds[index % screenshotAnalysis.suggestedBackgrounds.length]
    }
    // Priority 2: Use colors from prompt analysis
    if (promptAnalysis?.visualStyle?.colorScheme) {
      return promptAnalysis.visualStyle.colorScheme[index % promptAnalysis.visualStyle.colorScheme.length] || '#F0F4FF'
    }
    // Fallback: Default palette
    const backgrounds = ['#F0F4FF', '#FFF0F5', '#F0FFF4', '#FFFBEB', '#FEF2F2', '#F0FDFA']
    return backgrounds[index % backgrounds.length]
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
        templateId: "minimal",
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

  // Cleanup effect for RAF
  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  // Mouse handlers - MUST be before early return
  const handleMouseDown = React.useCallback((layerId: string, e: React.MouseEvent, screenId: string) => {
    if (spacePressed) return
    e.stopPropagation()
    setCurrentScreenId(screenId)
    setSelectedLayer(layerId)
    setDragging(layerId)
    isDraggingRef.current = true
    const screen = screens.find(s => s.id === screenId)
    const layer = screen?.layers.find(l => l.id === layerId)
    if (layer) {
      setDragStart({ x: e.clientX - (layer.x * zoom), y: e.clientY - (layer.y * zoom) })
      dragPositionRef.current = { x: layer.x, y: layer.y }
    }
  }, [spacePressed, screens, zoom])

  const handleCanvasMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (spacePressed) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }, [spacePressed, panOffset])

  const updateLayers = React.useCallback((updater: (layers: Layer[]) => Layer[]) => {
    setScreens(prev => prev.map(screen => 
      screen.id === currentScreenId 
        ? { ...screen, layers: updater(screen.layers) }
        : screen
    ))
  }, [currentScreenId])

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (isPanning && spacePressed) {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        setPanOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y
        })
        rafRef.current = null
      })
      return
    }
    
    if (resizing && !spacePressed) {
      const deltaX = (e.clientX - resizeStart.x) / zoom
      const deltaY = (e.clientY - resizeStart.y) / zoom
      
      resizeDimensions.current = {
        width: Math.max(50, resizeStart.width + deltaX),
        height: Math.max(50, resizeStart.height + deltaY)
      }
      
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        if (resizing) {
          updateLayers(prev => prev.map(layer => 
            layer.id === resizing 
              ? { 
                  ...layer, 
                  width: resizeDimensions.current.width, 
                  height: resizeDimensions.current.height 
                }
              : layer
          ))
        }
        rafRef.current = null
      })
      return
    }
    
    if (dragging && !spacePressed) {
      dragPositionRef.current = {
        x: (e.clientX - dragStart.x) / zoom,
        y: (e.clientY - dragStart.y) / zoom
      }
      
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        if (dragging) {
          updateLayers(prev => prev.map(layer => 
            layer.id === dragging 
              ? { ...layer, x: dragPositionRef.current.x, y: dragPositionRef.current.y }
              : layer
          ))
        }
        rafRef.current = null
      })
    }
  }, [isPanning, spacePressed, dragging, resizing, panStart, dragStart, resizeStart, zoom, updateLayers])

  const handleMouseUp = React.useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    isDraggingRef.current = false
    setDragging(null)
    setResizing(null)
    setIsPanning(false)
  }, [])

  // Get current screen and layers - AFTER all hooks
  const currentScreen = screens.find(s => s.id === currentScreenId)
  const layers = currentScreen?.layers || []

  // Early return AFTER all hooks
  if (!currentScreen) {
    return (
      <div className="w-full h-full bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 font-light">Loading canvas...</p>
      </div>
    )
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

  const updateScreenBackground = (color: string, applyToAll: boolean = false) => {
    setScreens(prev => prev.map(screen => 
      (applyToAll || screen.id === currentScreenId)
        ? { ...screen, backgroundColor: color }
        : screen
    ))
  }

  const applyBackgroundToAllScreens = (color: string) => {
    updateScreenBackground(color, true)
  }

  const regenerateCurrentScreen = async () => {
    if (!currentScreen) return
    
    const currentScreenshot = currentScreen.layers.find(l => l.type === "mockup" || l.type === "image")?.content
    if (!currentScreenshot) {
      console.warn("No screenshot found in current screen")
      return
    }

    setIsGenerating(true)
    try {
      const screenIndex = screens.findIndex(s => s.id === currentScreenId)
      const aiLayout = await generateLayoutForScreenshot(
        currentScreenshot,
        userPrompt || 'mobile app',
        uploadedLogo,
        screenIndex
      )

      if (aiLayout) {
        const newLayers = createLayersFromAILayout(aiLayout, currentScreenshot, uploadedLogo)
        setScreens(prev => prev.map(screen => 
          screen.id === currentScreenId 
            ? { 
                ...screen, 
                backgroundColor: aiLayout.backgroundColor,
                layers: newLayers
              }
            : screen
        ))
      }
    } catch (error) {
      console.error('Failed to regenerate screen:', error)
    } finally {
      setIsGenerating(false)
    }
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

  // Export screenshot as PNG
  const exportScreenshotAsPNG = async (screen: Screen) => {
    setIsExporting(true)
    try {
      // Create a temporary canvas element
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      // Set canvas dimensions (iPhone X size)
      canvas.width = 375
      canvas.height = 812

      // Fill background
      ctx.fillStyle = screen.backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Render each layer
      for (const layer of screen.layers) {
        if (layer.type === 'text') {
          // Render text layer
          ctx.save()
          ctx.font = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${layer.fontSize || 20}px ${layer.fontFamily || 'sans-serif'}`
          ctx.fillStyle = layer.color || '#000000'
          ctx.textAlign = (layer.align || 'left') as CanvasTextAlign
          
          const x = layer.align === 'center' ? layer.x + layer.width / 2 : 
                    layer.align === 'right' ? layer.x + layer.width : 
                    layer.x + 8
          const y = layer.y + (layer.fontSize || 20)
          
          ctx.fillText(layer.content, x, y)
          
          if (layer.underline) {
            const metrics = ctx.measureText(layer.content)
            ctx.strokeStyle = layer.color || '#000000'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(x, y + 2)
            ctx.lineTo(x + metrics.width, y + 2)
            ctx.stroke()
          }
          ctx.restore()
        } else if (layer.type === 'image' || layer.type === 'mockup') {
          // Render image layer
          await new Promise<void>((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height)
              resolve()
            }
            img.onerror = () => {
              console.warn('Failed to load image:', layer.content)
              resolve() // Continue even if image fails
            }
            img.src = layer.content
          })
        } else if (layer.type === 'decoration') {
          // Render decoration layer
          ctx.fillStyle = layer.backgroundColor || 'rgba(255,255,255,0.1)'
          ctx.fillRect(layer.x, layer.y, layer.width, layer.height)
        }
      }

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${screen.name.replace(/\s+/g, '_')}_${Date.now()}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
        setIsExporting(false)
      }, 'image/png')
    } catch (error) {
      console.error('Export failed:', error)
      setIsExporting(false)
      alert('Failed to export screenshot. Please try again.')
    }
  }

  // Export all screenshots
  const exportAllScreenshots = async () => {
    for (const screen of screens) {
      await exportScreenshotAsPNG(screen)
      // Add a small delay between exports
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // Share screenshot (generate shareable link)
  const shareScreenshot = async (screen: Screen) => {
    try {
      // Create a temporary canvas element
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      // Set canvas dimensions
      canvas.width = 375
      canvas.height = 812

      // Fill background
      ctx.fillStyle = screen.backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Render each layer (same as export)
      for (const layer of screen.layers) {
        if (layer.type === 'text') {
          ctx.save()
          ctx.font = `${layer.italic ? 'italic ' : ''}${layer.bold ? 'bold ' : ''}${layer.fontSize || 20}px ${layer.fontFamily || 'sans-serif'}`
          ctx.fillStyle = layer.color || '#000000'
          ctx.textAlign = (layer.align || 'left') as CanvasTextAlign
          
          const x = layer.align === 'center' ? layer.x + layer.width / 2 : 
                    layer.align === 'right' ? layer.x + layer.width : 
                    layer.x + 8
          const y = layer.y + (layer.fontSize || 20)
          
          ctx.fillText(layer.content, x, y)
          
          if (layer.underline) {
            const metrics = ctx.measureText(layer.content)
            ctx.strokeStyle = layer.color || '#000000'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(x, y + 2)
            ctx.lineTo(x + metrics.width, y + 2)
            ctx.stroke()
          }
          ctx.restore()
        } else if (layer.type === 'image' || layer.type === 'mockup') {
          await new Promise<void>((resolve) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height)
              resolve()
            }
            img.onerror = () => {
              console.warn('Failed to load image:', layer.content)
              resolve()
            }
            img.src = layer.content
          })
        } else if (layer.type === 'decoration') {
          ctx.fillStyle = layer.backgroundColor || 'rgba(255,255,255,0.1)'
          ctx.fillRect(layer.x, layer.y, layer.width, layer.height)
        }
      }

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png')
      
      // In a real app, you would upload this to a server and get a shareable link
      // For now, we'll create a shareable data URL
      setShareLink(dataUrl)
      setShowShareModal(true)
    } catch (error) {
      console.error('Share failed:', error)
      alert('Failed to generate shareable link. Please try again.')
    }
  }

  // Copy share link to clipboard
  const copyShareLink = async () => {
    try {
      // If the browser supports clipboard API
      if (navigator.clipboard && shareLink.startsWith('data:')) {
        // For data URLs, we need to convert to blob first
        const response = await fetch(shareLink)
        const blob = await response.blob()
        const item = new ClipboardItem({ 'image/png': blob })
        await navigator.clipboard.write([item])
        alert('Image copied to clipboard! You can paste it anywhere.')
      } else {
        // Fallback: just copy the data URL as text
        await navigator.clipboard.writeText(shareLink)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Copy failed:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Link copied to clipboard!')
    }
  }

  // Download from share modal
  const downloadFromShare = () => {
    const a = document.createElement('a')
    a.href = shareLink
    a.download = `screenshot_${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="w-full bg-neutral-50 overflow-hidden shrink-0 h-full flex flex-col">
      {/* Loading State */}
      {isGenerating && (
        <div className="absolute inset-0 bg-neutral-50/90 z-50 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-neutral-900 border-r-transparent mb-4"></div>
            <p className="text-xs sm:text-sm text-neutral-500 font-light">Generating your App Store screenshots...</p>
          </div>
        </div>
      )}

      {/* Canvas Header - Minimalist */}
      <div className="bg-neutral-50 border-b border-neutral-200 px-3 sm:px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 transition-all duration-200"
          >
            <X className="h-4 w-4 text-neutral-500 hover:text-neutral-900" />
          </button>
          <div className="hidden sm:block h-4 w-px bg-neutral-200" />
          <h2 className="text-sm font-light text-neutral-900">Canvas Editor</h2>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden lg:flex items-center gap-1 bg-neutral-50 px-2 py-1 border border-neutral-200">
            <button 
              onClick={() => {
                const newZoom = Math.max(0.5, zoom - 0.1)
                setZoom(newZoom)
              }}
              className="p-1 hover:bg-neutral-100 transition-all duration-200"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5 text-neutral-500" />
            </button>
            <span className="text-xs text-neutral-500 min-w-[45px] text-center font-light">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={() => {
                const newZoom = Math.min(1.5, zoom + 0.1)
                setZoom(newZoom)
              }}
              className="p-1 hover:bg-neutral-100 transition-all duration-200"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5 text-neutral-500" />
            </button>
          </div>
          <button 
            onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }) }}
            className="hidden lg:block px-2.5 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 transition-all duration-200 font-light"
          >
            Reset
          </button>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-neutral-100 transition-all duration-200"
            title={sidebarOpen ? "Hide Panel" : "Show Panel"}
          >
            <Layers className="h-4 w-4 text-neutral-500 hover:text-neutral-900" />
          </button>
          <div className="hidden sm:block h-4 w-px bg-neutral-200" />
          <button 
            onClick={() => setShowVideoGenerator(true)}
            className="px-3 sm:px-4 py-1.5 text-xs font-light bg-neutral-50 text-neutral-900 hover:bg-neutral-100 transition-all duration-200 flex items-center gap-1.5 border border-neutral-200"
          >
            <Video className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Video</span>
          </button>
          <button 
            onClick={() => {
              // TODO: Implement community sharing with link generation
              alert('Community sharing coming soon! This will generate a shareable link to your canvas.')
            }}
            className="px-3 sm:px-4 py-1.5 text-xs font-light bg-neutral-50 text-neutral-900 hover:bg-neutral-100 transition-all duration-200 flex items-center gap-1.5 border border-neutral-200"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button 
            onClick={() => currentScreen && exportScreenshotAsPNG(currentScreen)}
            className="px-3 sm:px-4 py-1.5 text-xs font-light bg-neutral-900 text-white hover:bg-neutral-800 transition-all duration-200 border border-neutral-900 flex items-center gap-1.5"
            disabled={!currentScreen || isExporting}
          >
            {isExporting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span className="hidden sm:inline">Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </>
            )}
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
          onMouseLeave={handleMouseUp}
          style={{ 
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          }}
        >
          <div
            className="flex gap-8 min-w-max"
            style={{
              transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
              willChange: isPanning ? 'transform' : 'auto',
            }}
          >
            {screens.map((screen) => (
              <div 
                key={screen.id}
                className={`relative overflow-hidden duration-200 ${
                  currentScreenId === screen.id ? 'ring-2 ring-neutral-600' : 'ring-1 ring-neutral-200'
                }`}
                style={{ 
                  width: `${375 * zoom}px`, 
                  height: `${812 * zoom}px`,
                  backgroundColor: screen.backgroundColor,
                  flexShrink: 0,
                  minWidth: '200px',
                  transform: 'translateZ(0)',
                }}
                onClick={() => setCurrentScreenId(screen.id)}
              >
                {/* Screen Label - Minimalist */}
                <div className="absolute -top-8 left-0 text-xs font-light text-neutral-700">{screen.name}</div>

                {/* Draggable Layers - Minimalist */}
                {screen.layers.map(layer => {
                  const isSelected = selectedLayer === layer.id && currentScreenId === screen.id
                  const isDraggingThis = dragging === layer.id
                  
                  return (
                    <div
                      key={layer.id}
                      className={`absolute ${!spacePressed ? 'cursor-move' : ''} ${
                        isDraggingThis ? '' : 'transition-all duration-150'
                      } ${
                        isSelected
                          ? 'ring-2 ring-neutral-600' 
                          : 'hover:ring-1 hover:ring-neutral-400'
                      }`}
                      style={{
                        transform: `translate(${layer.x * zoom}px, ${layer.y * zoom}px)`,
                        width: layer.width * zoom,
                        height: layer.height * zoom,
                        willChange: isDraggingThis ? 'transform' : 'auto',
                      }}
                      onMouseDown={(e) => handleMouseDown(layer.id, e, screen.id)}
                    >
                      {/* Text Layer */}
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
                      
                      {/* Simple Image Layer */}
                      {layer.type === "image" && (
                        <img
                          src={layer.content}
                          alt="App screenshot"
                          className="w-full h-full"
                          draggable={false}
                        />
                      )}
                      
                      {/* iPhone Mockup Frame with Screenshot Inside */}
                      {layer.type === "mockup" && (
                        <>
                          <IphoneMockup 
                            src={layer.content}
                            className="w-full h-full"
                          />
                          {/* Resize Handle */}
                          {isSelected && (
                            <div
                              className="absolute bottom-0 right-0 w-4 h-4 bg-neutral-900 cursor-nwse-resize hover:scale-110 transition-transform"
                              onMouseDown={(e) => {
                                e.stopPropagation()
                                setResizing(layer.id)
                                setResizeStart({
                                  x: e.clientX,
                                  y: e.clientY,
                                  width: layer.width,
                                  height: layer.height
                                })
                                resizeDimensions.current = { width: layer.width, height: layer.height }
                              }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Move className="h-2.5 w-2.5 text-white rotate-45" />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Decoration Layer (colored boxes, shapes) */}
                      {layer.type === "decoration" && (
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundColor: layer.backgroundColor || 'rgba(255,255,255,0.1)',
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Tools Sidebar - Animated & Collapsible - Minimalist */}
        <div 
          className={`bg-neutral-50 border-l border-neutral-200 overflow-y-auto shrink-0 transition-all duration-300 ease-in-out ${
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
              <div className="bg-neutral-50 p-3 border border-neutral-200">
                <p className="text-xs text-neutral-500 leading-relaxed font-light">
                  "{userPrompt.length > 80 ? userPrompt.slice(0, 80) + '...' : userPrompt}"
                </p>
              </div>
              
              {/* Screenshot Analysis - Font Detection */}
              {/* Temporarily disabled - font detection not working properly
              {screenshotAnalysis?.typography?.primaryFont && (
                <div className="bg-neutral-50 p-3 border border-neutral-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Type className="h-4 w-4 text-neutral-400" />
                    <h4 className="text-xs font-light text-neutral-900">Detected Font</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div 
                      className="px-3 py-2 bg-neutral-100 border border-neutral-200 font-light text-neutral-900"
                      style={{ fontFamily: screenshotAnalysis.typography.primaryFont }}
                    >
                      {screenshotAnalysis.typography.primaryFont.split(',')[0].replace(/['"]/g, '')}
                    </div>
                    <p className="text-[9px] font-light text-neutral-500">
                      This font is automatically applied to all text in your screenshots
                    </p>
                  </div>
                </div>
              )}
              */}
              
              {/* Smart Analysis - Commented out
              {promptAnalysis && (
                <div className="bg-neutral-50 p-3 border border-neutral-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 bg-neutral-900 flex items-center justify-center text-white text-xs font-light">
                      AI
                    </div>
                    <h4 className="text-xs font-light text-neutral-900">Smart Analysis</h4>
                  </div>
                  
                  <div className="space-y-2.5 text-xs text-neutral-500">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400 font-light">Category</span>
                      <span className="font-light text-neutral-900">{promptAnalysis.appCategory}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400 font-light">Audience</span>
                      <span className="font-light text-neutral-900">{promptAnalysis.targetAudience}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block mb-1.5 font-light">Key Features</span>
                      <div className="flex flex-wrap gap-1.5">
                        {promptAnalysis.keyFeatures.slice(0, 3).map((feature, i) => (
                          <span key={i} className="px-2 py-1 bg-neutral-50 text-[10px] font-light text-neutral-600 border border-neutral-200">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400 font-light">Design Style</span>
                      <span className="font-light text-neutral-900">{promptAnalysis.visualStyle.mood}</span>
                    </div>
                  </div>
                </div>
              )}
              */}
            </div>
          )}

          {/* Screens - Minimalist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-light text-neutral-900">Screens ({screens.length})</h3>
              <button
                onClick={addScreen}
                className="p-1.5 hover:bg-neutral-100 transition-all duration-200"
              >
                <Plus className="h-4 w-4 text-neutral-500" />
              </button>
            </div>
            <div className="space-y-2">
              {screens.map(screen => (
                <button
                  key={screen.id}
                  onClick={() => setCurrentScreenId(screen.id)}
                  className={`w-full px-3 py-2.5 text-xs font-light transition-all duration-200 border ${
                    currentScreenId === screen.id 
                      ? 'bg-neutral-900 text-white border-neutral-900' 
                      : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100 border-neutral-200'
                  }`}
                >
                  {screen.name}
                </button>
              ))}
            </div>
          </div>

          {currentScreen && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-light text-neutral-900">AI Layout</h3>
                <Layout className="h-4 w-4 text-neutral-400" />
              </div>
              <button
                onClick={regenerateCurrentScreen}
                disabled={isGenerating}
                className="w-full p-3 border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent"></div>
                    <span className="text-xs font-light text-neutral-600">Regenerating...</span>
                  </>
                ) : (
                  <>
                    <Layout className="h-4 w-4 text-neutral-600" />
                    <span className="text-xs font-light text-neutral-900">Regenerate with AI</span>
                  </>
                )}
              </button>
              <p className="text-[9px] font-light text-neutral-500">AI will analyze your screenshot and create a new layout with contextual text and positioning</p>
            </div>
          )}

          {/* Background Color - Minimalist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-light text-neutral-900">Background</h3>
              <button
                onClick={generateAIBackground}
                disabled={isGeneratingBackground}
                className="px-2.5 py-1.5 text-xs font-light bg-neutral-900 text-white hover:bg-neutral-800 transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5 border border-neutral-900"
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
              {/* Suggested Backgrounds from AI Analysis */}
              {screenshotAnalysis?.suggestedBackgrounds && screenshotAnalysis.suggestedBackgrounds.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-light text-neutral-400">From Your App</p>
                  <div className="grid grid-cols-5 gap-2">
                    {screenshotAnalysis.suggestedBackgrounds.slice(0, 5).map((color, idx) => (
                      <button
                        key={color + idx}
                        onClick={(e) => {
                          if (e.shiftKey) {
                            applyBackgroundToAllScreens(color)
                          } else {
                            updateScreenBackground(color)
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          applyBackgroundToAllScreens(color)
                        }}
                        className={`w-full aspect-square border transition-all duration-200 relative group ${
                          currentScreen.backgroundColor === color 
                            ? 'border-neutral-900 scale-105 ring-2 ring-neutral-900' 
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={`${color}\nShift+Click or Right-click to apply to all screens`}
                      >
                        {currentScreen.backgroundColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white drop-shadow-lg" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] font-light text-neutral-500 italic">Shift+Click or Right-click any color to apply to all screens</p>
                </div>
              )}
              
              <input
                type="color"
                value={currentScreen.backgroundColor.startsWith('#') ? currentScreen.backgroundColor : '#F0F4FF'}
                onChange={(e) => updateScreenBackground(e.target.value)}
                className="w-full h-10 border border-neutral-200 cursor-pointer"
              />
              <div className="space-y-2">
                <p className="text-[10px] font-light text-neutral-400">Presets</p>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    '#FFFFFF', '#F5F5F5', '#000000',
                    '#F0F4FF', '#FFF0F5', '#F0FFF4',
                    '#FFFBEB', '#FEF2F2', '#F0FDFA',
                    '#FAF5FF', '#FDF4FF', '#ECFEFF'
                  ].map(color => (
                    <button
                      key={color}
                      onClick={(e) => {
                        if (e.shiftKey) {
                          applyBackgroundToAllScreens(color)
                        } else {
                          updateScreenBackground(color)
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        applyBackgroundToAllScreens(color)
                      }}
                      className={`w-full aspect-square border transition-all duration-200 ${
                        currentScreen.backgroundColor === color 
                          ? 'border-neutral-900 scale-105' 
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`${color}\nShift+Click or Right-click to apply to all screens`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Apply to All Screens Button */}
              {screens.length > 1 && (
                <button
                  onClick={() => applyBackgroundToAllScreens(currentScreen.backgroundColor)}
                  className="w-full py-2 px-3 text-xs font-light bg-neutral-50 text-neutral-900 hover:bg-neutral-100 transition-all duration-200 border border-neutral-200 flex items-center justify-center gap-2"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Apply Current Background to All {screens.length} Screens
                </button>
              )}
            </div>
          </div>

          {/* Add Tools - Minimalist */}
          <div className="space-y-3">
            <h3 className="text-xs font-light text-neutral-900">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={addTextLayer}
                className="p-3 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 transition-all duration-200 flex flex-col items-center gap-2 group"
              >
                <Type className="h-5 w-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                <span className="text-xs font-light text-neutral-500 group-hover:text-neutral-900 transition-colors">Text</span>
              </button>
              <button 
                className="p-3 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 transition-all duration-200 flex flex-col items-center gap-2 group"
              >
                <ImageIcon className="h-5 w-5 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                <span className="text-xs font-light text-neutral-500 group-hover:text-neutral-900 transition-colors">Image</span>
              </button>
            </div>
          </div>

          {/* Assets Library - NEW */}
          {(uploadedLogo || uploadedAssets.length > 0) && (
            <div className="space-y-3">
              <h3 className="text-xs font-light text-neutral-900">Your Assets</h3>
              
              {/* Logo */}
              {uploadedLogo && (
                <div>
                  <p className="text-[10px] text-neutral-400 mb-2 font-light">App Logo</p>
                  <div 
                    className="relative group cursor-pointer"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('asset-type', 'logo')
                      e.dataTransfer.setData('asset-url', uploadedLogo)
                    }}
                  >
                    <img 
                      src={uploadedLogo} 
                      alt="App Logo"
                      className="w-16 h-16 object-cover border border-neutral-200 bg-neutral-50 hover:border-neutral-900 transition-all"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                      <span className="text-[8px] text-white opacity-0 group-hover:opacity-100 font-light bg-neutral-900 px-2 py-1">Drag to canvas</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Brand Assets */}
              {uploadedAssets.length > 0 && (
                <div>
                  <p className="text-[10px] text-neutral-400 mb-2 font-light">Brand Assets</p>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedAssets.map((asset, idx) => (
                      <div 
                        key={idx}
                        className="relative group cursor-pointer"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('asset-type', 'image')
                          e.dataTransfer.setData('asset-url', asset)
                        }}
                      >
                        <img 
                          src={asset} 
                          alt={`Asset ${idx + 1}`}
                          className="w-full h-16 object-cover border border-neutral-200 bg-neutral-50 hover:border-neutral-900 transition-all"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-neutral-400 mt-2 font-light">Drag assets to canvas to add them</p>
                </div>
              )}
            </div>
          )}

          {/* Layers List - Minimalist */}
          <div className="space-y-3">
            <h3 className="text-xs font-light text-neutral-900">Layers</h3>
            <div className="space-y-1.5">
              {layers.map(layer => (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`px-3 py-2.5 cursor-pointer flex items-center justify-between group transition-all duration-200 border ${
                    selectedLayer === layer.id 
                      ? 'bg-neutral-900 text-white border-neutral-900' 
                      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {layer.type === "text" ? (
                      <Type className={`h-4 w-4 ${selectedLayer === layer.id ? 'text-white' : 'text-neutral-400'}`} />
                    ) : (
                      <ImageIcon className={`h-4 w-4 ${selectedLayer === layer.id ? 'text-white' : 'text-neutral-400'}`} />
                    )}
                    <span className={`text-xs font-light truncate max-w-[150px] ${
                      selectedLayer === layer.id ? 'text-white' : 'text-neutral-600'
                    }`}>
                      {layer.content.length > 20 ? layer.content.slice(0, 20) + '...' : layer.content}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteLayer(layer.id)
                    }}
                    className={`p-1 hover:bg-neutral-800 transition-colors ${
                      selectedLayer === layer.id ? 'opacity-0 group-hover:opacity-100' : ''
                    }`}
                  >
                    <Trash2 className={`h-3.5 w-3.5 ${
                      selectedLayer === layer.id ? 'text-white hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-600'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Properties - Minimalist */}
          {selectedLayerData && (
            <div className="space-y-4 pt-4 border-t border-neutral-200">
              <h3 className="text-xs font-light text-neutral-900">Properties</h3>
              
              {selectedLayerData.type === "text" && (
                <>
                  <div>
                    <label className="text-xs font-light text-neutral-400 mb-2 block">Content</label>
                    <textarea
                      value={selectedLayerData.content}
                      onChange={(e) => updateLayerContent(selectedLayerData.id, e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none bg-neutral-50"
                      rows={2}
                      placeholder="Enter text..."
                    />
                  </div>

                  {/* Text Formatting - Minimalist */}
                  <div>
                    <label className="text-xs font-light text-neutral-400 mb-2 block">Style</label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { bold: !selectedLayerData.bold })}
                        className={`flex-1 p-2 border transition-all duration-200 ${
                          selectedLayerData.bold 
                            ? 'bg-neutral-900 text-white border-neutral-900' 
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        <Bold className="h-4 w-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { italic: !selectedLayerData.italic })}
                        className={`flex-1 p-2 border transition-all duration-200 ${
                          selectedLayerData.italic 
                            ? 'bg-neutral-900 text-white border-neutral-900' 
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        <Italic className="h-4 w-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { underline: !selectedLayerData.underline })}
                        className={`flex-1 p-2 border transition-all duration-200 ${
                          selectedLayerData.underline 
                            ? 'bg-neutral-900 text-white border-neutral-900' 
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        <Underline className="h-4 w-4 mx-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Text Alignment - Minimalist */}
                  <div>
                    <label className="text-xs font-light text-neutral-400 mb-2 block">Alignment</label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { align: 'left' })}
                        className={`flex-1 p-2 border transition-all duration-200 ${
                          selectedLayerData.align === 'left' 
                            ? 'bg-neutral-900 text-white border-neutral-900' 
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        <AlignLeft className="h-4 w-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { align: 'center' })}
                        className={`flex-1 p-2 border transition-all duration-200 ${
                          selectedLayerData.align === 'center' 
                            ? 'bg-neutral-900 text-white border-neutral-900' 
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        <AlignCenter className="h-4 w-4 mx-auto" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { align: 'right' })}
                        className={`flex-1 p-2 border transition-all duration-200 ${
                          selectedLayerData.align === 'right' 
                            ? 'bg-neutral-900 text-white border-neutral-900' 
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        <AlignRight className="h-4 w-4 mx-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Font Family - Minimalist */}
                  <div>
                    <label className="text-xs font-light text-neutral-400 mb-2 block">Font</label>
                    <select
                      value={selectedLayerData.fontFamily || 'inherit'}
                      onChange={(e) => updateLayerStyle(selectedLayerData.id, { fontFamily: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent bg-neutral-50"
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
                      <label className="text-xs font-light text-neutral-400">Size</label>
                      <span className="text-xs font-light text-neutral-900">{selectedLayerData.fontSize || 20}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={selectedLayerData.fontSize || 20}
                      onChange={(e) => updateLayerStyle(selectedLayerData.id, { fontSize: parseInt(e.target.value) })}
                      className="w-full h-2 bg-neutral-200 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-light text-neutral-400 mb-2 block">Color</label>
                    <div className="space-y-3">
                      <input
                        type="color"
                        value={selectedLayerData.color}
                        onChange={(e) => updateLayerStyle(selectedLayerData.id, { color: e.target.value })}
                        className="w-full h-10 border border-neutral-200 cursor-pointer"
                      />
                      <div className="grid grid-cols-4 gap-2">
                        {['#000000', '#FFFFFF', '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                          <button
                            key={color}
                            onClick={() => updateLayerStyle(selectedLayerData.id, { color })}
                            className={`w-full aspect-square border transition-all duration-200 ${
                              selectedLayerData.color === color 
                                ? 'border-neutral-900 scale-105' 
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
          <div className="space-y-3 pt-4 border-t border-neutral-200">
            <h3 className="text-xs font-light text-neutral-900">Quick Tips</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-neutral-500 font-light">
                <div className="w-1.5 h-1.5 bg-neutral-400 mt-1.5 shrink-0"></div>
                <p>Drag elements to reposition</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-neutral-500 font-light">
                <div className="w-1.5 h-1.5 bg-neutral-400 mt-1.5 shrink-0"></div>
                <p>Hold <kbd className="px-1.5 py-0.5 bg-neutral-50 text-[10px] font-light border border-neutral-200">Space</kbd> + drag to pan</p>
              </div>
              <div className="flex items-start gap-2 text-xs text-neutral-500 font-light">
                <div className="w-1.5 h-1.5 bg-neutral-400 mt-1.5 shrink-0"></div>
                <p>Use zoom to scale canvas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Video Generator Modal */}
    {showVideoGenerator && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4"
        onClick={() => setShowVideoGenerator(false)}
      >
        <div 
          className="relative w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <VideoGenerator 
            screenshots={uploadedScreenshots}
            prompt={userPrompt}
            onClose={() => setShowVideoGenerator(false)}
          />
        </div>
      </div>
    )}

    {/* Share Modal */}
    {showShareModal && (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4"
        onClick={() => setShowShareModal(false)}
      >
        <div 
          className="relative w-full max-w-lg bg-white p-6 border border-neutral-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowShareModal(false)}
            className="absolute top-4 right-4 p-1.5 hover:bg-neutral-100 transition-all duration-200"
          >
            <X className="h-4 w-4 text-neutral-500 hover:text-neutral-900" />
          </button>

          {/* Modal Header */}
          <div className="mb-6">
            <h3 className="text-lg font-light text-neutral-900 mb-2">Share Screenshot</h3>
            <p className="text-sm font-light text-neutral-500">
              Your screenshot is ready to share. Copy the image to clipboard or download it.
            </p>
          </div>

          {/* Screenshot Preview */}
          <div className="mb-6 flex justify-center">
            <div className="relative w-48 h-auto border border-neutral-200 overflow-hidden">
              <img 
                src={shareLink} 
                alt="Screenshot preview" 
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={copyShareLink}
              className="w-full px-4 py-3 text-sm font-light bg-neutral-900 text-white hover:bg-neutral-800 transition-all duration-200 border border-neutral-900 flex items-center justify-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Image to Clipboard
            </button>
            <button
              onClick={downloadFromShare}
              className="w-full px-4 py-3 text-sm font-light bg-neutral-50 text-neutral-900 hover:bg-neutral-100 transition-all duration-200 border border-neutral-200 flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download as PNG
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <p className="text-xs font-light text-neutral-400 text-center">
              Your screenshot has been copied and is ready to share
            </p>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}

