"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-zinc-100 w-[65%] mx-auto">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="LumeAI" width={30} height={100} />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/features" 
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Pricing
            </Link>
            <Link 
              href="/docs" 
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Docs
            </Link>
            <Link 
              href="/about" 
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              About
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              Log in
            </Button>
            <Button 
              className="text-sm bg-black text-white hover:bg-zinc-800 rounded-full "
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

