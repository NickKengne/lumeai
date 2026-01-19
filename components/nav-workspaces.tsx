"use client"

import * as React from "react"
import { ChevronRight, MoreHorizontal, Plus } from "lucide-react"
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
  const [openSections, setOpenSections] = React.useState<Record<string, Set<string>>>({})

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

  const toggleSection = (workspaceId: string, sectionId: string, isOpen: boolean) => {
    setOpenSections(prev => {
      const newState = { ...prev }
      if (!newState[workspaceId]) {
        newState[workspaceId] = new Set()
      }
      if (isOpen) {
        newState[workspaceId].add(sectionId)
      } else {
        newState[workspaceId].delete(sectionId)
      }
      return newState
    })
  }

  const isSectionOpen = (workspaceId: string, sectionId: string) => {
    return openSections[workspaceId]?.has(sectionId) || false
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
                      <span className="text-base">📁</span>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(`Delete workspace "${workspace.name}" and all its chats?`)) {
                            // Delete all chats in this workspace
                            chats.forEach(chat => {
                              deleteChatFromHistory(chat.id)
                            })
                            // Remove workspace from localStorage
                            const stored = localStorage.getItem('lume-workspaces')
                            if (stored) {
                              const workspaces = JSON.parse(stored)
                              const updated = workspaces.filter((w: any) => w.name !== workspace.name)
                              localStorage.setItem('lume-workspaces', JSON.stringify(updated))
                            }
                            loadChats()
                            window.dispatchEvent(new Event('chat-updated'))
                          }
                        }}
                        className="text-red-600"
                      >
                        <span className="mr-2">🗑️</span>
                        Delete Workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {/* Chats Section */}
                      <Collapsible
                        open={isSectionOpen(workspaceId, 'chats')}
                        onOpenChange={(open) => toggleSection(workspaceId, 'chats', open)}
                      >
                        <SidebarMenuSubItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuSubButton className="group">
                              <ChevronRight className="w-3 h-3 transition-transform data-[state=open]:rotate-90" />
                              <span className="text-sm">💬</span>
                              <span className="text-xs font-medium">Chats</span>
                              {chats.length > 0 && (
                                <span className="ml-auto text-[10px] text-neutral-500">
                                  {chats.length}
                                </span>
                              )}
                            </SidebarMenuSubButton>
                          </CollapsibleTrigger>
                        </SidebarMenuSubItem>
                        <CollapsibleContent>
                          <div className="ml-4">
                            {chats.length === 0 ? (
                              <div className="px-3 py-2 text-[10px] text-neutral-400">
                                No chats yet
                              </div>
                            ) : (
                              chats.map((chat) => (
                                <SidebarMenuSubItem key={chat.id}>
                                  <SidebarMenuSubButton
                                    onClick={() => handleChatClick(chat.id)}
                                    className="group pl-6"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="text-[11px] font-medium truncate">
                                        {chat.title}
                                      </div>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        {chat.screenshots.length > 0 && (
                                          <div className="flex items-center gap-0.5 text-[9px] text-neutral-500">
                                            <span>📷</span>
                                            <span>{chat.screenshots.length}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </SidebarMenuSubButton>
                                  <SidebarMenuAction 
                                    showOnHover
                                    className="opacity-0 group-hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteChat(e, chat.id)
                                    }}
                                    title="Delete conversation"
                                  >
                                    <span className="text-red-600">🗑️</span>
                                  </SidebarMenuAction>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <SidebarMenuAction 
                                        showOnHover
                                        className="opacity-0 group-hover:opacity-100"
                                      >
                                        <MoreHorizontal className="w-3 h-3" />
                                      </SidebarMenuAction>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="right" align="start">
                                      <DropdownMenuItem
                                        onClick={(e) => handleDeleteChat(e, chat.id)}
                                        className="text-red-600"
                                      >
                                        <span className="mr-2">🗑️</span>
                                        Delete Conversation
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </SidebarMenuSubItem>
                              ))
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Screenshots Section */}
                      <Collapsible
                        open={isSectionOpen(workspaceId, 'screenshots')}
                        onOpenChange={(open) => toggleSection(workspaceId, 'screenshots', open)}
                      >
                        <SidebarMenuSubItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuSubButton className="group">
                              <ChevronRight className="w-3 h-3 transition-transform data-[state=open]:rotate-90" />
                              <span className="text-sm">📷</span>
                              <span className="text-xs font-medium">Screenshots</span>
                              <span className="ml-auto text-[10px] text-neutral-500">
                                {chats.reduce((acc, chat) => acc + chat.screenshots.length, 0)}
                              </span>
                            </SidebarMenuSubButton>
                          </CollapsibleTrigger>
                        </SidebarMenuSubItem>
                        <CollapsibleContent>
                          <div className="ml-4">
                            {chats.filter(chat => chat.screenshots.length > 0).length === 0 ? (
                              <div className="px-3 py-2 text-[10px] text-neutral-400">
                                No screenshots yet
                              </div>
                            ) : (
                              chats
                                .filter(chat => chat.screenshots.length > 0)
                                .map((chat) => (
                                  <SidebarMenuSubItem key={`screenshot-${chat.id}`}>
                                    <SidebarMenuSubButton
                                      onClick={() => handleChatClick(chat.id)}
                                      className="pl-6"
                                    >
                                      <span className="text-xs">📸</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[11px] truncate">
                                          {chat.title}
                                        </div>
                                        <div className="text-[9px] text-neutral-500">
                                          {chat.screenshots.length} images
                                        </div>
                                      </div>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Assets Section */}
                      <Collapsible
                        open={isSectionOpen(workspaceId, 'assets')}
                        onOpenChange={(open) => toggleSection(workspaceId, 'assets', open)}
                      >
                        <SidebarMenuSubItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuSubButton className="group">
                              <ChevronRight className="w-3 h-3 transition-transform data-[state=open]:rotate-90" />
                              <span className="text-sm">✨</span>
                              <span className="text-xs font-medium">Assets</span>
                              <span className="ml-auto text-[10px] text-neutral-500">
                                {chats.reduce((acc, chat) => acc + (chat.logo ? 1 : 0) + chat.assets.length, 0)}
                              </span>
                            </SidebarMenuSubButton>
                          </CollapsibleTrigger>
                        </SidebarMenuSubItem>
                        <CollapsibleContent>
                          <div className="ml-4">
                            {chats.filter(chat => chat.logo || chat.assets.length > 0).length === 0 ? (
                              <div className="px-3 py-2 text-[10px] text-neutral-400">
                                No assets yet
                              </div>
                            ) : (
                              chats
                                .filter(chat => chat.logo || chat.assets.length > 0)
                                .map((chat) => (
                                  <SidebarMenuSubItem key={`asset-${chat.id}`}>
                                    <SidebarMenuSubButton
                                      onClick={() => handleChatClick(chat.id)}
                                      className="pl-6"
                                    >
                                      <span className="text-xs">🎨</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[11px] truncate">
                                          {chat.title}
                                        </div>
                                        <div className="text-[9px] text-neutral-500">
                                          {chat.logo && 'Logo'}
                                          {chat.logo && chat.assets.length > 0 && ' • '}
                                          {chat.assets.length > 0 && `${chat.assets.length} assets`}
                                        </div>
                                      </div>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
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
