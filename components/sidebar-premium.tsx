"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function SidebarPremium() {
  return (
    <Card className="border border-neutral-200 bg-white shadow-none">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
              <Sparkles className="size-5 text-neutral-700" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-neutral-900">
                Upgrade to Premium
              </p>
              <p className="text-xs text-neutral-500">
                Unlock advanced features and unlimited access
              </p>
            </div>
          </div>
          <Button 
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-sm"
            size="sm"
          >
            Upgrade Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

