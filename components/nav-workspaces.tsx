"use client"

import * as React from "react"
import { ChevronRight, Folder, MoreHorizontal, Plus, MessageSquare, Image as ImageIcon, Sparkles, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getChatsByWorkspace, deleteChatFromHistory, type ChatHistory } from "@/lib/chat-storage"

export function NavWorkspaces({
  workspaces,
}: {
  workspaces: {
    name: string
    emoji: React.ReactNode
    pages: {
      name: string
      emoji: React.ReactNode
    }[]
  }[]
}) {
  const router = useRouter()
  const [workspaceChats, setWorkspaceChats] = React.useState<Record<string, ChatHistory[]>>({})
  const [openWorkspaces, setOpenWorkspaces] = React.useState<Set<string>>(new Set())

  const loadChats = React.useCallback(() => {
    const chats: Record<string, ChatHistory[]> = {}
    workspaces.forEach((workspace) => {
      const workspaceId = workspace.name.toLowerCase().replace(/\s+/g, '-')
      chats[workspaceId] = getChatsByWorkspace(workspaceId)
    })
    setWorkspaceChats(chats)
  }, [workspaces])

  React.useEffect(() => {
    loadChats()
    const interval = setInterval(loadChats, 2000)
    window.addEventListener('chat-updated', loadChats)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('chat-updated', loadChats)
    }
  }, [loadChats])

  const handleChatClick = (chatId: string) => {
    router.push(`/dashboard/chat/${chatId}`)
  }

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    if (confirm('Delete this chat?')) {
      deleteChatFromHistory(chatId)
      loadChats()
      window.dispatchEvent(new Event('chat-updated'))
    }
  }

  const handleNewChatInWorkspace = (workspaceId: string) => {
    const newChatId = `chat_${Date.now()}`
    router.push(`/dashboard/chat/${newChatId}?workspace=${workspaceId}`)
  }

  const toggleWorkspace = (workspaceId: string, isOpen: boolean) => {
    setOpenWorkspaces(prev => {
      const newSet = new Set(prev)
      if (isOpen) {
        newSet.add(workspaceId)
      } else {
        newSet.delete(workspaceId)
      }
      return newSet
    })
  }
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {workspaces.map((workspace, index) => {
            const workspaceId = workspace.name.toLowerCase().replace(/\s+/g, '-')
            const chats = workspaceChats[workspaceId] || []
            const isOpen = openWorkspaces.has(workspaceId)

            return (
              <Collapsible 
                key={`workspace-${index}`}
                open={isOpen}
                onOpenChange={(open) => toggleWorkspace(workspaceId, open)}
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button className="w-full">
                      <span><Folder className="w-4 h-4" /></span>
                      <span>{workspace.name}</span>
                      {chats.length > 0 && (
                        <span className="ml-auto text-xs text-neutral-500">
                          {chats.length}
                        </span>
                      )}
                    </button>
                  </SidebarMenuButton>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction
                      className="bg-sidebar-accent text-sidebar-accent-foreground left-2 data-[state=open]:rotate-90"
                      showOnHover
                    >
                      <ChevronRight />
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <SidebarMenuAction 
                    showOnHover
                    onClick={() => handleNewChatInWorkspace(workspaceId)}
                  >
                    <Plus />
                  </SidebarMenuAction>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {chats.length === 0 ? (
                        <SidebarMenuSubItem>
                          <div className="px-3 py-2 text-xs text-neutral-500">
                            No chats yet
                          </div>
                        </SidebarMenuSubItem>
                      ) : (
                        chats.map((chat) => (
                          <SidebarMenuSubItem key={chat.id}>
                            <SidebarMenuSubButton
                              onClick={() => handleChatClick(chat.id)}
                              className="group"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">
                                  {chat.title}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {chat.screenshots.length > 0 && (
                                    <div className="flex items-center gap-0.5 text-[10px] text-neutral-500">
                                      <ImageIcon className="w-2.5 h-2.5" />
                                      <span>{chat.screenshots.length}</span>
                                    </div>
                                  )}
                                  {chat.logo && (
                                    <div className="flex items-center gap-0.5 text-[10px] text-neutral-500">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      <span>Logo</span>
                                    </div>
                                  )}
                                  {chat.assets.length > 0 && (
                                    <div className="flex items-center gap-0.5 text-[10px] text-neutral-500">
                                      <ImageIcon className="w-2.5 h-2.5" />
                                      <span>{chat.assets.length} assets</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </SidebarMenuSubButton>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction 
                                  showOnHover
                                  className="opacity-0 group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent side="right" align="start">
                                <DropdownMenuItem
                                  onClick={(e) => handleDeleteChat(e, chat.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </SidebarMenuSubItem>
                        ))
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          })}
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <MoreHorizontal />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
