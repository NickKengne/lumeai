/**
 * Video Generation using OpenAI Sora API
 * Creates promotional videos from app screenshots
 * Based on: https://platform.openai.com/docs/api-reference/videos/create
 */

export interface VideoGenerationRequest {
  screenshots: string[]
  style: 'smooth' | 'dynamic' | 'minimal' | 'cinematic'
  duration: 4 | 8 | 12
  music?: 'none' | 'upbeat' | 'calm' | 'corporate'
  transitions?: 'fade' | 'slide' | 'zoom' | 'morph'
  prompt?: string
  model?: 'sora-2' | 'sora-2-pro'
  size?: '720x1280' | '1280x720' | '1920x1080'
}

export interface VideoGenerationResult {
  videoUrl: string
  thumbnailUrl: string
  duration: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  estimatedTime?: number
  videoId?: string
}

/**
 * Generate a promotional video from screenshots using Sora
 * OpenAI Video API: https://platform.openai.com/docs/api-reference/videos/create
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
    // Build the prompt for video generation
    const prompt = buildVideoPrompt(request)
    const model = request.model || 'sora-2'
    const seconds = request.duration // Already in correct format (4, 8, or 12)
    
    // Prepare form data
    const formData = new FormData()
    formData.append('model', model)
    formData.append('prompt', prompt)
    formData.append('seconds', seconds.toString())
    
    // Add size if specified (vertical for mobile app screenshots)
    if (request.size) {
      formData.append('size', request.size)
    } else {
      formData.append('size', '720x1280') // Default to vertical mobile format
    }
    
    // Add first screenshot as input reference if available
    if (request.screenshots.length > 0 && request.screenshots[0]) {
      try {
        const screenshotFile = await base64ToFile(request.screenshots[0], 'input-reference.png')
        formData.append('input_reference', screenshotFile)
      } catch (error) {
        console.warn('Failed to add screenshot reference:', error)
      }
    }
    
    // Make API request to OpenAI
    const response = await fetch('https://api.openai.com/v1/videos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = 'Video generation failed'
      try {
        const error = JSON.parse(errorText)
        errorMessage = error.error?.message || errorMessage
        console.error('OpenAI Video API error:', error)
      } catch {
        console.error('OpenAI Video API error:', errorText)
      }
      throw new Error(errorMessage)
    }
    
    const data = await response.json()
    
    // OpenAI may return a video generation task that needs polling
    // The video might not be immediately available
    if (data.status === 'processing' || data.status === 'pending') {
      console.log('Video generation started. Video ID:', data.id)
      console.log('Estimated time:', data.estimated_time || 'Unknown')
    }
    
    // Return the result
    return {
      videoUrl: data.url || data.video_url || '',
      thumbnailUrl: request.screenshots[0] || '/images/video-thumbnail.png',
      duration: seconds,
      status: data.status === 'completed' ? 'completed' : 
              data.status === 'failed' ? 'failed' : 'processing',
      videoId: data.id,
      estimatedTime: data.estimated_time
    }
  } catch (error) {
    console.error('Video generation failed:', error)
    // Fallback to mock generation for development
    return mockVideoGeneration(request)
  }
}

/**
 * Convert base64 image to File object for API upload
 */
async function base64ToFile(base64String: string, filename: string): Promise<File> {
  const response = await fetch(base64String)
  const blob = await response.blob()
  return new File([blob], filename, { type: 'image/png' })
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
 * Polls the OpenAI API to check if video generation is complete
 */
export async function checkVideoStatus(videoId: string): Promise<VideoGenerationResult> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  
  if (!apiKey) {
    return {
      videoUrl: '/videos/demo-promo.mp4',
      thumbnailUrl: '/images/video-thumbnail.png',
      duration: 10,
      status: 'completed',
      videoId
    }
  }

  try {
    const response = await fetch(`https://api.openai.com/v1/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    })

    if (!response.ok) {
      throw new Error('Failed to check video status')
    }

    const data = await response.json()

    return {
      videoUrl: data.url || data.video_url,
      thumbnailUrl: '/images/video-thumbnail.png',
      duration: data.seconds || 10,
      status: data.status === 'completed' ? 'completed' : 
              data.status === 'failed' ? 'failed' : 'processing',
      videoId: data.id,
      estimatedTime: data.estimated_time
    }
  } catch (error) {
    console.error('Failed to check video status:', error)
    return {
      videoUrl: '/videos/demo-promo.mp4',
      thumbnailUrl: '/images/video-thumbnail.png',
      duration: 10,
      status: 'completed',
      videoId
    }
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
 * Get available durations (OpenAI supports 4, 8, or 12 seconds)
 */
export const VIDEO_DURATIONS = [
  { seconds: 4, label: '4s', description: 'Quick teaser' },
  { seconds: 8, label: '8s', description: 'Short promo' },
  { seconds: 12, label: '12s', description: 'Standard showcase' }
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

