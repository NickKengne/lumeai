"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"

interface ThinkingAnimationProps {
  text?: string
  subtext?: string
}

export function ThinkingAnimation({ 
  text = "Thinking...", 
  subtext 
}: ThinkingAnimationProps) {
  const [dots, setDots] = React.useState("")

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-3 py-4">
      <div className="relative">
        <div className="absolute inset-0 animate-ping opacity-20">
          <Sparkles className="h-5 w-5 text-neutral-600" />
        </div>
        <Sparkles className="h-5 w-5 text-neutral-600 animate-pulse" />
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-700 font-normal">
            {text}
          </span>
          <span className="text-sm text-neutral-700 w-6 inline-block">
            {dots}
          </span>
        </div>
        {subtext && (
          <span className="text-xs text-neutral-400 mt-0.5">
            {subtext}
          </span>
        )}
      </div>
    </div>
  )
}

interface ThinkingStepsProps {
  steps: string[]
  currentStep: number
}

export function ThinkingSteps({ steps, currentStep }: ThinkingStepsProps) {
  return (
    <div className="space-y-2 py-2">
      {steps.map((step, idx) => (
        <div 
          key={idx}
          className={`flex items-center gap-2 transition-all duration-300 ${
            idx === currentStep 
              ? "opacity-100" 
              : idx < currentStep 
                ? "opacity-60" 
                : "opacity-30"
          }`}
        >
          {idx < currentStep ? (
            <div className="h-4 w-4 rounded-full bg-neutral-600 flex items-center justify-center">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : idx === currentStep ? (
            <div className="h-4 w-4 rounded-full border-2 border-neutral-600 animate-pulse" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-neutral-300" />
          )}
          <span className="text-xs text-neutral-600">{step}</span>
        </div>
      ))}
    </div>
  )
}

