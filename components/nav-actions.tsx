"use client"

import * as React from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"

export function NavActions() {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Button className="bg-neutral-50 hover:bg-neutral-100 flex items-center gap-2 text-neutral-900 font-light border border-neutral-200">
        <Image
          src="/expo-svgrepo-com.svg"
          alt="Expo"
          width={20}
          height={20}
          className="dark:invert"
        />
        Connect with Expo
      </Button>
    </div>
  )
}
