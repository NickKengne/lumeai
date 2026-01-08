"use client"

import * as React from "react"
import { Play, Pause, Download, Sparkles, Video, Music, Clock, Wand2, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { 
  generateVideoWithSora, 
  checkVideoStatus,
  VIDEO_STYLES, 
  VIDEO_DURATIONS, 
  VIDEO_MUSIC,
  type VideoGenerationRequest,
  type VideoGenerationResult
} from "@/lib/video-generator"
import { ScrollArea } from "./ui/scroll-area"

interface VideoGeneratorProps {
  screenshots: string[]
  prompt?: string
  onClose?: () => void
}

export function VideoGenerator({ screenshots, prompt, onClose }: VideoGeneratorProps) {
  const [selectedStyle, setSelectedStyle] = React.useState<'smooth' | 'dynamic' | 'minimal' | 'cinematic'>('smooth')
  const [selectedDuration, setSelectedDuration] = React.useState<4 | 8 | 12>(8)
  const [selectedMusic, setSelectedMusic] = React.useState<'none' | 'upbeat' | 'calm' | 'corporate'>('upbeat')
  const [videoPrompt, setVideoPrompt] = React.useState(prompt || '')
  const [isGenerating, setIsGenerating] = React.useState(false)

  // Sync prompt prop with local state
  React.useEffect(() => {
    if (prompt) setVideoPrompt(prompt)
  }, [prompt])
  const [generatedVideo, setGeneratedVideo] = React.useState<VideoGenerationResult | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleGenerate = async () => {
    if (screenshots.length === 0 && !videoPrompt) return

    setIsGenerating(true)
    try {
      const request: VideoGenerationRequest = {
        screenshots,
        style: selectedStyle,
        duration: selectedDuration,
        music: selectedMusic,
        transitions: 'morph',
        prompt: videoPrompt
      }
      
      const result = await generateVideoWithSora(request)
      
      // If video is still processing, poll for status
      if (result.status === 'processing' && result.videoId) {
        await pollVideoStatus(result.videoId)
      } else {
        setGeneratedVideo(result)
        setIsGenerating(false)
      }
    } catch (error) {
      console.error('Video generation failed:', error)
      setIsGenerating(false)
    }
  }

  const pollVideoStatus = async (videoId: string) => {
    const maxAttempts = 30 // Poll for up to 5 minutes (10s intervals)
    let attempts = 0

    const poll = async () => {
      try {
        const status = await checkVideoStatus(videoId)
        
        if (status.status === 'completed') {
          setGeneratedVideo(status)
          setIsGenerating(false)
        } else if (status.status === 'failed') {
          console.error('Video generation failed')
          setIsGenerating(false)
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 10000) // Poll every 10 seconds
        } else {
          console.error('Video generation timed out')
          setIsGenerating(false)
        }
      } catch (error) {
        console.error('Failed to check video status:', error)
        setIsGenerating(false)
      }
    }

    poll()
  }

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="bg-neutral-50 border border-neutral-200 flex flex-col max-h-[90vh]">
      {/* Header - Fixed */}
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-neutral-900 flex items-center justify-center">
            <Video className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-light text-neutral-900">Create Video</h3>
            <p className="text-sm text-neutral-500 font-light">Generate promotional video from screenshots</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-neutral-200 text-neutral-900 text-xs font-light">
            Powered by Sora
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-100 transition-all duration-200 ml-2"
              aria-label="Close video generator"
            >
              <X className="h-4 w-4 text-neutral-500 hover:text-neutral-900" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="p-6 overflow-y-auto flex-1">
        {/* Preview Area */}
        <div className="mb-6">
          {generatedVideo ? (
            <div className="relative aspect-video bg-neutral-900 overflow-hidden">
              <video
                ref={videoRef}
                src={generatedVideo.videoUrl}
                poster={generatedVideo.thumbnailUrl}
                className="w-full h-full object-cover"
                onEnded={() => setIsPlaying(false)}
              />
              <button
                onClick={togglePlayback}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-16 w-16 text-white" />
                ) : (
                  <Play className="h-16 w-16 text-white" />
                )}
              </button>
            </div>
          ) : (
            <div className="aspect-video bg-neutral-100 flex flex-col items-center justify-center border border-dashed border-neutral-200">
              {isGenerating ? (
                <div className="text-center">
                  <div className="h-12 w-12 mx-auto mb-4 border-4 border-neutral-900 border-t-transparent animate-spin" />
                  <p className="text-sm font-light text-neutral-900">Generating your video...</p>
                  <p className="text-xs text-neutral-500 mt-1 font-light">This may take a few minutes</p>
                </div>
              ) : (
                <>
                  <Video className="h-12 w-12 text-neutral-400 mb-3" />
                  <p className="text-sm text-neutral-500 font-light">Your video will appear here</p>
                  <p className="text-xs text-neutral-400 mt-1 font-light">{screenshots.length} screenshots selected</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Video Prompt */}
        <div className="mb-6">
          <p className="text-xs font-light text-neutral-500 mb-3 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Describe your video
          </p>
          <textarea
            value={videoPrompt}
            onChange={(e) => setVideoPrompt(e.target.value)}
            placeholder="E.g., Create a smooth promotional video showing app features with modern transitions..."
            className="w-full px-4 py-3 text-sm border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none bg-neutral-50 font-light"
            rows={3}
          />
        </div>

        {/* Screenshots Preview */}
        {screenshots.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-light text-neutral-500 mb-3">Screenshots to animate</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {screenshots.slice(0, 5).map((url, idx) => (
                <div key={idx} className="shrink-0 w-16 h-28 overflow-hidden border border-neutral-200">
                  <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              {screenshots.length > 5 && (
                <div className="shrink-0 w-16 h-28 bg-neutral-100 flex items-center justify-center text-sm text-neutral-600 font-light border border-neutral-200">
                  +{screenshots.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Style Selection */}
        <div className="mb-6">
          <p className="text-xs font-light text-neutral-500 mb-3 flex items-center gap-2">
            <Wand2 className="h-3.5 w-3.5" />
            Video Style
          </p>
          <div className="grid grid-cols-4 gap-2">
            {VIDEO_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 border text-left transition-all ${
                  selectedStyle === style.id
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                <p className="text-xs font-light">{style.name}</p>
                <p className={`text-[10px] mt-0.5 font-light ${selectedStyle === style.id ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {style.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Duration Selection */}
        <div className="mb-6">
          <p className="text-xs font-light text-neutral-500 mb-3 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            Duration
          </p>
          <div className="flex gap-2">
            {VIDEO_DURATIONS.map((dur) => (
              <button
                key={dur.seconds}
                onClick={() => setSelectedDuration(dur.seconds as 4 | 8 | 12)}
                className={`flex-1 py-3 px-4 border text-center transition-all ${
                  selectedDuration === dur.seconds
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                <p className="text-sm font-light">{dur.label}</p>
                <p className={`text-[10px] font-light ${selectedDuration === dur.seconds ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {dur.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Music Selection */}
        <div className="mb-6">
          <p className="text-xs font-light text-neutral-500 mb-3 flex items-center gap-2">
            <Music className="h-3.5 w-3.5" />
            Background Music
          </p>
          <div className="grid grid-cols-4 gap-2">
            {VIDEO_MUSIC.map((music) => (
              <button
                key={music.id}
                onClick={() => setSelectedMusic(music.id as any)}
                className={`p-3 border text-left transition-all ${
                  selectedMusic === music.id
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                <p className="text-xs font-light">{music.name}</p>
                <p className={`text-[10px] mt-0.5 font-light ${selectedMusic === music.id ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {music.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {generatedVideo ? (
            <>
              <button
                onClick={handleGenerate}
                className="flex-1 py-3 px-4 bg-neutral-50 text-neutral-900 font-light hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 border border-neutral-200"
              >
                <Sparkles className="h-4 w-4" />
                Regenerate
              </button>
              <button
                className="flex-1 py-3 px-4 bg-neutral-900 text-white font-light hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 border border-neutral-900"
              >
                <Download className="h-4 w-4" />
                Download Video
              </button>
            </>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (screenshots.length === 0 && !videoPrompt.trim())}
              className="w-full py-3 px-4 bg-neutral-900 text-white font-light hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-900"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Video
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

