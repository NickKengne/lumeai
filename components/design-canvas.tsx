"use client"

import * as React from "react"
import { X, Type, Move, Trash2, Copy, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Plus, Image as ImageIcon, ZoomIn, ZoomOut } from "lucide-react"

interface Layer {
  id: string
  type: "text" | "image"
  content: string
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
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
}

export function DesignCanvas({ onClose, userPrompt }: DesignCanvasProps) {
  const [screens, setScreens] = React.useState<Screen[]>([
    {
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
  ])
  const [currentScreenId, setCurrentScreenId] = React.useState("1")
  const [selectedLayer, setSelectedLayer] = React.useState<string | null>(null)
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [isPanning, setIsPanning] = React.useState(false)
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 })
  const [spacePressed, setSpacePressed] = React.useState(false)
  const canvasRef = React.useRef<HTMLDivElement>(null)

  const currentScreen = screens.find(s => s.id === currentScreenId)!
  const layers = currentScreen.layers

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
      {/* Canvas Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-neutral-600" />
          </button>
          <h2 className="text-sm font-medium text-neutral-700">Edit Screenshot</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4 text-neutral-600" />
          </button>
          <span className="text-xs text-neutral-600 min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
          <button 
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4 text-neutral-600" />
          </button>
          <button 
            onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }) }}
            className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors ml-2"
          >
            Reset View
          </button>
          <div className="h-4 w-px bg-neutral-300 mx-1" />
          <button className="px-3 py-1.5 text-xs bg-black text-white hover:bg-neutral-800 rounded-lg transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* Main Content Area - Flex Row */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area - Scrollable */}
        <div 
          ref={canvasRef}
          className={`flex-1 p-8 overflow-auto flex items-center bg-neutral-200 ${spacePressed ? 'cursor-grab' : ''} ${isPanning ? 'cursor-grabbing' : ''}`}
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
                className={`relative bg-white rounded-lg transition-all ${
                  currentScreenId === screen.id ? 'ring-2 ring-neutral-400' : ''
                }`}
                style={{ 
                  width: `${375 * zoom}px`, 
                  height: `${667 * zoom}px`,
                  backgroundColor: screen.backgroundColor,
                  flexShrink: 0
                }}
                onClick={() => setCurrentScreenId(screen.id)}
              >
                {/* Screen Label */}
                <div className="absolute -top-6 left-0 text-xs text-neutral-500">{screen.name}</div>

                {/* Draggable Layers */}
                {screen.layers.map(layer => (
                  <div
                    key={layer.id}
                    className={`absolute ${!spacePressed ? 'cursor-move' : ''} ${selectedLayer === layer.id && currentScreenId === screen.id ? 'ring-2 ring-blue-500' : ''}`}
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
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Tools Sidebar - Fixed on Right */}
        <div className="w-[320px] bg-white border-l border-neutral-200 overflow-y-auto shrink-0">
          <div className="p-4 space-y-4">
          {/* User Prompt */}
          {userPrompt && (
            <div className="bg-neutral-50 rounded-lg p-3">
              <p className="text-xs text-neutral-600 leading-relaxed">
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
                      ? 'bg-blue-500 text-white' 
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
                        ? 'border-blue-500 scale-110' 
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
                    selectedLayer === layer.id ? 'bg-blue-50 border border-blue-200' : 'bg-neutral-50 hover:bg-neutral-100'
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
                      className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
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
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { italic: !selectedLayerData.italic })}
                        className={`p-2 rounded border transition-colors ${
                          selectedLayerData.italic 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { underline: !selectedLayerData.underline })}
                        className={`p-2 rounded border transition-colors ${
                          selectedLayerData.underline 
                            ? 'bg-blue-500 text-white border-blue-500' 
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
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <AlignLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { align: 'center' })}
                        className={`p-2 rounded border transition-colors ${
                          selectedLayerData.align === 'center' 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <AlignCenter className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => updateLayerStyle(selectedLayerData.id, { align: 'right' })}
                        className={`p-2 rounded border transition-colors ${
                          selectedLayerData.align === 'right' 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <AlignRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
                      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
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
                              selectedLayerData.color === color ? 'border-blue-500' : 'border-neutral-200'
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

