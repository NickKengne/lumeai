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
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

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

  useEffect(() => {
    // Load messages from localStorage
    const storedMessages = localStorage.getItem(`chat-${chatId}`)
    if (storedMessages) {
      const parsed = JSON.parse(storedMessages)
      setMessages(parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })))
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
      <div className="bg-zinc-50 flex min-h-screen flex-col gap-4 px-4 py-10 justify-center items-center">
        <ChatInput chatId={chatId} initialMessages={messages} />
      </div>
    </SidebarInset>
  )
}

