export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface ChatHistory {
  id: string
  workspaceId: string
  title: string
  messages: ChatMessage[]
  screenshots: string[]
  logo?: string
  assets: string[]
  createdAt: Date
  updatedAt: Date
}

const STORAGE_KEY = "lume-chat-history"
const MAX_CHATS = 50 // Maximum number of chats to store
const MAX_MESSAGES_PER_CHAT = 100 // Maximum messages per chat to store

// Note: Screenshots, logos, and assets are stored separately in sessionStorage
// to avoid exceeding localStorage quota. They will be lost on page refresh.
const TEMP_ASSETS_KEY = "lume-temp-assets"

// Store temporary assets (screenshots, logos, assets) in sessionStorage
export function saveTempAssets(chatId: string, data: {
  screenshots?: string[]
  logo?: string
  assets?: string[]
}): void {
  try {
    const existing = getTempAssets()
    existing[chatId] = {
      ...existing[chatId],
      ...data,
      lastUpdated: new Date().toISOString()
    }
    sessionStorage.setItem(TEMP_ASSETS_KEY, JSON.stringify(existing))
  } catch (error) {
    console.warn('Failed to save temporary assets:', error)
  }
}

// Get temporary assets from sessionStorage
export function getTempAssets(): Record<string, any> {
  try {
    const stored = sessionStorage.getItem(TEMP_ASSETS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Get temporary assets for a specific chat
export function getChatTempAssets(chatId: string): {
  screenshots: string[]
  logo?: string
  assets: string[]
} | null {
  const all = getTempAssets()
  return all[chatId] || null
}

// Helper function to evict old chats if needed
function evictOldChats(history: ChatHistory[]): ChatHistory[] {
  // Sort by updatedAt, most recent first
  const sorted = [...history].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
  
  // Keep only the most recent MAX_CHATS
  return sorted.slice(0, MAX_CHATS)
}

// Helper function to limit message count in a chat
function limitChatMessages(chat: ChatHistory): ChatHistory {
  if (chat.messages.length <= MAX_MESSAGES_PER_CHAT) {
    return chat
  }
  
  // Keep the most recent messages
  return {
    ...chat,
    messages: chat.messages.slice(-MAX_MESSAGES_PER_CHAT)
  }
}

// Helper function to strip large base64 images from chat
function stripLargeData(chat: ChatHistory): ChatHistory {
  return {
    ...chat,
    screenshots: [], // Don't store screenshots in localStorage - too large
    logo: chat.logo ? '' : undefined, // Don't store logo
    assets: [], // Don't store assets - too large
  }
}

export function saveChatToHistory(chat: ChatHistory): void {
  try {
    const history = getChatHistory()
    const existingIndex = history.findIndex((c) => c.id === chat.id)

    // Limit messages in the chat before saving
    const limitedChat = limitChatMessages(chat)

    if (existingIndex >= 0) {
      history[existingIndex] = limitedChat
    } else {
      history.push(limitedChat)
    }

    // Evict old chats if we have too many
    const evictedHistory = evictOldChats(history)

    // Try to save, with retry logic if quota exceeded
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(evictedHistory))
    } catch (error: any) {
      // If quota exceeded, clear storage and try with stripped data
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.warn('localStorage quota exceeded, clearing and saving without images...')
        
        // Clear existing storage to free up space
        localStorage.removeItem(STORAGE_KEY)
        
        // Strip all large data (screenshots, logos, assets) from all chats
        const strippedHistory = evictedHistory
          .slice(0, Math.min(30, evictedHistory.length)) // Keep max 30 chats
          .map(stripLargeData)
        
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(strippedHistory))
          console.log('Saved chat history without images to avoid quota issues')
        } catch (retryError: any) {
          // If still failing, keep only the 5 most recent chats with just text
          console.error('Still failing, keeping only 5 most recent chats')
          
          const minimalHistory = evictedHistory
            .slice(0, 5)
            .map(c => ({
              ...c,
              screenshots: [],
              logo: undefined,
              assets: [],
              messages: c.messages.slice(-20) // Keep only last 20 messages per chat
            }))
          
          try {
            localStorage.removeItem(STORAGE_KEY)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalHistory))
          } catch (finalError: any) {
            console.error('Failed to save chat history even with minimal data:', finalError)
            // At this point, we can't save. The app will continue to work,
            // but chat history won't be persisted.
          }
        }
      } else {
        // Re-throw if it's a different error
        throw error
      }
    }
  } catch (error: any) {
    console.error('Error saving chat to history:', error)
    // Don't throw - allow the app to continue functioning
  }
}

export function getChatHistory(): ChatHistory[] {
  if (typeof window === "undefined") return []
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []

  try {
    const parsed = JSON.parse(stored)
    return parsed.map((chat: any) => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }))
  } catch {
    return []
  }
}

export function getChatsByWorkspace(workspaceId: string): ChatHistory[] {
  return getChatHistory()
    .filter((chat) => chat.workspaceId === workspaceId)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

export function getChatById(chatId: string): ChatHistory | null {
  const history = getChatHistory()
  return history.find((c) => c.id === chatId) || null
}

export function deleteChatFromHistory(chatId: string): void {
  try {
    const history = getChatHistory().filter((c) => c.id !== chatId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error: any) {
    console.error('Error deleting chat from history:', error)
    // Don't throw - allow the app to continue functioning
  }
}

export function generateChatTitle(messages: ChatMessage[]): string {
  if (messages.length === 0) return "New Chat"

  const firstUserMessage = messages.find((m) => m.role === "user")
  if (!firstUserMessage) return "New Chat"

  const content = firstUserMessage.content.trim()
  if (content.length <= 40) return content
  return content.slice(0, 40) + "..."
}




