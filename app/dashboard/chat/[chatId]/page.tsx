"use client"

import { ChatInput } from "@/components/chat-input"
import { NavActions } from "@/components/nav-actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getChatById } from "@/lib/chat-storage"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const params = useParams()
  const chatId = params.chatId as string
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [needsAIResponse, setNeedsAIResponse] = useState(false)
  const [chatTitle, setChatTitle] = useState("Chat")
  const { setOpen: setSidebarOpen } = useSidebar()

  // Hide sidebar when panel opens
  useEffect(() => {
    if (isPanelOpen) {
      setSidebarOpen(false)
    }
  }, [isPanelOpen, setSidebarOpen])

  useEffect(() => {
    // Try loading from new chat storage system
    const existingChat = getChatById(chatId)
    if (existingChat) {
      setMessages(existingChat.messages)
      setChatTitle(existingChat.title)
      
      // Check if we need AI response
      if (existingChat.messages.length === 1 && existingChat.messages[0].role === 'user') {
        setNeedsAIResponse(true)
      }
    } else {
      // Fallback: Try old localStorage format for backwards compatibility
      const storedMessages = localStorage.getItem(`chat-${chatId}`)
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages)
        const loadedMessages = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(loadedMessages)
        
        if (loadedMessages.length === 1 && loadedMessages[0].role === 'user') {
          setNeedsAIResponse(true)
        }
      }
    }
    setIsLoading(false)
  }, [chatId])

  if (isLoading) {
    return (
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 bg-zinc-50">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    Chat
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-3">
            <NavActions />
          </div>
        </header>
        <div className="bg-zinc-50 flex flex-col gap-4 px-4 py-10 justify-center items-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <header className="flex h-12 sm:h-14 shrink-0 items-center gap-2 bg-zinc-50 border-b border-zinc-200">
        <div className="flex flex-1 items-center gap-1 sm:gap-2 px-2 sm:px-3">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mr-1 sm:mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1 text-sm sm:text-base">
                  {chatTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-2 sm:px-3">
          <NavActions />
        </div>
      </header>
      <div className="bg-zinc-50 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 w-full overflow-hidden">
          <ChatInput 
            chatId={chatId} 
            initialMessages={messages}
            onPanelOpenChange={setIsPanelOpen}
            triggerAIResponse={needsAIResponse}
            onAIResponseTriggered={() => setNeedsAIResponse(false)}
          />
        </div>
      </div>
    </SidebarInset>
  )
}

