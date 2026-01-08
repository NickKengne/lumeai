"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

export function SidebarPremium() {
  return (
    <div className="border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center border border-neutral-200 bg-neutral-50">
            <Sparkles className="size-5 text-neutral-600" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-light text-neutral-900">
              Upgrade to Premium
            </p>
            <p className="text-xs text-neutral-500 font-light">
              Unlock advanced features and unlimited access
            </p>
          </div>
        </div>
        <Button 
          className="bg-neutral-900 text-white font-light border border-neutral-900"
          size="sm"
        >
          Upgrade Now
        </Button>
      </div>
    </div>
  )
}

