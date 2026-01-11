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

export function saveChatToHistory(chat: ChatHistory): void {
  const history = getChatHistory()
  const existingIndex = history.findIndex((c) => c.id === chat.id)

  if (existingIndex >= 0) {
    history[existingIndex] = chat
  } else {
    history.push(chat)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
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
  const history = getChatHistory().filter((c) => c.id !== chatId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function generateChatTitle(messages: ChatMessage[]): string {
  if (messages.length === 0) return "New Chat"

  const firstUserMessage = messages.find((m) => m.role === "user")
  if (!firstUserMessage) return "New Chat"

  const content = firstUserMessage.content.trim()
  if (content.length <= 40) return content
  return content.slice(0, 40) + "..."
}



