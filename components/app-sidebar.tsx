"use client"

import * as React from "react"
import {
  AudioWaveform,
  Blocks,
  Calendar,
  Command,
  Home,
  Inbox,
  MessageCircleQuestion,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react"

import { NavFavorites } from "@/components/nav-favorites"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavWorkspaces } from "@/components/nav-workspaces"
import { TeamSwitcher } from "@/components/team-switcher"
import { SidebarUser } from "@/components/sidebar-user"
import { SidebarPremium } from "@/components/sidebar-premium"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

interface Workspace {
  name: string
  emoji: string
  pages: Array<{
    name: string
    url: string
    emoji: string
  }>
}

// This is sample data.
const defaultData = {
  teams: [
    {
      name: "Lume",
      logo: Command,
      plan: "Enterprise",
    }
  ],
  navMain: [
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Ask AI",
      url: "#",
      icon: Sparkles,
    },
    {
      title: "Home",
      url: "#",
      icon: Home,
      isActive: true,
    }
  ],
  navSecondary: [
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Templates",
      url: "#",
      icon: Blocks,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
    },
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ],
  favorites: [
    {
      name: "Project Management & Task Tracking",
      url: "#",
      emoji: "📊",
    },
    {
      name: "Family Recipe Collection & Meal Planning",
      url: "#",
      emoji: "🍳",
    },
    {
      name: "Fitness Tracker & Workout Routines",
      url: "#",
      emoji: "💪",
    },
    {
      name: "Book Notes & Reading List",
      url: "#",
      emoji: "📚",
    },
    {
      name: "Sustainable Gardening Tips & Plant Care",
      url: "#",
      emoji: "🌱",
    },
    {
      name: "Language Learning Progress & Resources",
      url: "#",
      emoji: "🗣️",
    },
    {
      name: "Home Renovation Ideas & Budget Tracker",
      url: "#",
      emoji: "🏠",
    },
    {
      name: "Personal Finance & Investment Portfolio",
      url: "#",
      emoji: "💰",
    },
    {
      name: "Movie & TV Show Watchlist with Reviews",
      url: "#",
      emoji: "🎬",
    },
    {
      name: "Daily Habit Tracker & Goal Setting",
      url: "#",
      emoji: "✅",
    },
  ],
  workspaces: [],
  user: {
    name: "Nick Dibrilain",
    email: "nickdk294@gmail.com",
    avatar: "https://media.licdn.com/dms/image/v2/D4E03AQHTYbBtKMY2Vg/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1714722950547?e=1769040000&v=beta&t=uwYoa3mmJNdHaic0FpADf8r_qPm7CmhWN7jRId4Yxq0",
  },
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>(defaultData.workspaces)

  // Load workspaces from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('lume-workspaces')
    if (stored) {
      try {
        setWorkspaces(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to load workspaces', e)
      }
    }
  }, [])

  // Save workspaces to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('lume-workspaces', JSON.stringify(workspaces))
  }, [workspaces])

  const handleNewChat = () => {
    router.push('/dashboard')
  }

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={defaultData.teams} />
        <Button 
          onClick={handleNewChat}
          className="bg-neutral-800 text-white rounded-xl p-0" 
          variant={"default"}
        >
          <Plus className="size-4" />
          New Chat
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <NavWorkspaces workspaces={workspaces} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarPremium />
        <SidebarUser user={defaultData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
