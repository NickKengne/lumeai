"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-50 border-b border-neutral-200 w-[65%] mx-auto">
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
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-light"
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-light"
            >
              Pricing
            </Link>
            <Link 
              href="/docs" 
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-light"
            >
              Docs
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button 
                variant="ghost" 
                className="text-sm text-neutral-500 hover:text-neutral-900 font-light"
              >
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button 
                className="text-sm bg-neutral-900 text-white hover:bg-neutral-800 font-light border border-neutral-900"
              >
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

