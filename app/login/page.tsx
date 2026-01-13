"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Add your magic link authentication logic here
    setTimeout(() => {
      setIsLoading(false)
      setEmailSent(true)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      {/* Logo */}
      <div className="mb-12">
        <Link href="/" className="flex flex-col items-center gap-3">
          <img src="/images/logo.png" alt="LumeAI" width={50} height={50} />
        </Link>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md">
        <div className="bg-white p-10">
          {!emailSent ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-light text-neutral-900 tracking-tight mb-2">
                  Welcome back
                </h1>
                <p className="text-sm text-neutral-500 font-light">
                  Enter your email and we'll send you a magic link to sign in
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label 
                    htmlFor="email" 
                    className="text-xs uppercase tracking-widest text-neutral-400 font-light"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-neutral-50 text-neutral-900 text-sm font-light focus:outline-none focus:bg-neutral-100 transition-colors placeholder:text-neutral-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-neutral-900 text-white text-sm font-light tracking-wide hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending magic link..." : "Send magic link"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="mb-6">
                <svg 
                  className="w-16 h-16 mx-auto text-neutral-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1} 
                    d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-light text-neutral-900 tracking-tight mb-2">
                Check your email
              </h2>
              <p className="text-sm text-neutral-500 font-light mb-6">
                We've sent a magic link to <span className="text-neutral-900">{email}</span>
              </p>
              <p className="text-xs text-neutral-400 font-light mb-6">
                Click the link in the email to sign in. The link will expire in 15 minutes.
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-sm text-neutral-500 font-light hover:text-neutral-900 transition-colors"
              >
                Try a different email
              </button>
            </div>
          )}
        </div>

        {/* Sign Up Link */}
        {!emailSent && (
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500 font-light">
              Don't have an account?{" "}
              <Link 
                href="/signup" 
                className="text-neutral-900 font-normal hover:underline transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="text-xs text-neutral-400 font-light hover:text-neutral-900 transition-colors inline-flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

