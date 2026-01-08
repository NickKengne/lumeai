"use client"

import * as React from "react"
import { ChevronsUpDown, User } from "lucide-react"
import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function SidebarUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar?: string
  }
}) {
  const router = useRouter()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-neutral-200 text-neutral-700">
                  {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-neutral-500">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-neutral-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 z-[100] bg-neutral-50 border-neutral-200"
            side="top"
            align="end"
            sideOffset={8}
            alignOffset={0}
          >
            <DropdownMenuLabel className="p-0 font-light">
              <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                <Avatar className="size-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-neutral-200 text-neutral-600">
                    {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-light text-neutral-900">{user.name}</span>
                  <span className="truncate text-xs text-neutral-500 font-light">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-200" />
            <DropdownMenuItem 
              className="font-light text-neutral-600 focus:bg-neutral-100 focus:text-neutral-900 cursor-pointer"
              onClick={() => router.push("/dashboard/settings")}
            >
              <User className="mr-2 size-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="font-light text-neutral-600 focus:bg-neutral-100 focus:text-neutral-900 cursor-pointer">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

