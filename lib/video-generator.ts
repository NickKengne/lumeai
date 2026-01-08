/**
 * Video Generation using OpenAI Sora API
 * Creates promotional videos from app screenshots
 */

export interface VideoGenerationRequest {
  screenshots: string[]
  style: 'smooth' | 'dynamic' | 'minimal' | 'cinematic'
  duration: 5 | 10 | 15 | 30
  music?: 'none' | 'upbeat' | 'calm' | 'corporate'
  transitions?: 'fade' | 'slide' | 'zoom' | 'morph'
  prompt?: string
}

export interface VideoGenerationResult {
  videoUrl: string
  thumbnailUrl: string
  duration: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  estimatedTime?: number
}

/**
 * Generate a promotional video from screenshots using Sora
 */
export async function generateVideoWithSora(
  request: VideoGenerationRequest
): Promise<VideoGenerationResult> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  
  if (!apiKey) {
    console.warn('OpenAI API key not found, using mock video generation')
    return mockVideoGeneration(request)
  }

  try {
    // Note: Sora API is not yet publicly available
    // This is a placeholder for when it becomes available
    // For now, we'll use a mock implementation
    
    // When Sora becomes available, the implementation would be:
    // const response = await fetch('https://api.openai.com/v1/videos/generations', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     model: 'sora-1',
    //     prompt: buildVideoPrompt(request),
    //     images: request.screenshots,
    //     duration: request.duration,
    //     style: request.style
    //   })
    // })
    
    return mockVideoGeneration(request)
  } catch (error) {
    console.error('Video generation failed:', error)
    throw error
  }
}

/**
 * Build a prompt for Sora based on request parameters
 */
function buildVideoPrompt(request: VideoGenerationRequest): string {
  const styleDescriptions = {
    smooth: 'smooth, elegant transitions with a professional feel',
    dynamic: 'energetic, fast-paced with exciting motion effects',
    minimal: 'clean, minimal movements with subtle animations',
    cinematic: 'cinematic quality with dramatic lighting and depth'
  }

  const transitionDescriptions = {
    fade: 'gentle fade transitions between screens',
    slide: 'sliding transitions from left to right',
    zoom: 'zoom in/out transitions focusing on key elements',
    morph: 'morphing transitions that seamlessly blend screens'
  }

  // If user provided a custom prompt, combine it with our style settings
  const userPrompt = request.prompt 
    ? `${request.prompt}\n\n` 
    : ''

  return `${userPrompt}Create a ${request.duration}-second promotional video for a mobile app. 
Style: ${styleDescriptions[request.style]}. 
Transitions: ${transitionDescriptions[request.transitions || 'fade']}.
The video should showcase the app's key features in a visually appealing way,
with smooth animations that highlight the user interface.`
}

/**
 * Mock video generation for development/demo
 */
async function mockVideoGeneration(
  request: VideoGenerationRequest
): Promise<VideoGenerationResult> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return {
    videoUrl: '/videos/demo-promo.mp4',
    thumbnailUrl: request.screenshots[0] || '/images/video-thumbnail.png',
    duration: request.duration,
    status: 'completed',
    estimatedTime: 0
  }
}

/**
 * Check video generation status
 */
export async function checkVideoStatus(videoId: string): Promise<VideoGenerationResult> {
  // Placeholder for status checking
  return {
    videoUrl: '/videos/demo-promo.mp4',
    thumbnailUrl: '/images/video-thumbnail.png',
    duration: 10,
    status: 'completed'
  }
}

/**
 * Get available video styles
 */
export const VIDEO_STYLES = [
  { id: 'smooth', name: 'Smooth', description: 'Elegant & professional' },
  { id: 'dynamic', name: 'Dynamic', description: 'Energetic & exciting' },
  { id: 'minimal', name: 'Minimal', description: 'Clean & subtle' },
  { id: 'cinematic', name: 'Cinematic', description: 'Dramatic & premium' }
] as const

/**
 * Get available durations
 */
export const VIDEO_DURATIONS = [
  { seconds: 5, label: '5s', description: 'Quick teaser' },
  { seconds: 10, label: '10s', description: 'Short promo' },
  { seconds: 15, label: '15s', description: 'Standard ad' },
  { seconds: 30, label: '30s', description: 'Full showcase' }
] as const

/**
 * Get available music options
 */
export const VIDEO_MUSIC = [
  { id: 'none', name: 'No Music', description: 'Silent video' },
  { id: 'upbeat', name: 'Upbeat', description: 'Energetic & fun' },
  { id: 'calm', name: 'Calm', description: 'Relaxing & peaceful' },
  { id: 'corporate', name: 'Corporate', description: 'Professional & modern' }
] as const

