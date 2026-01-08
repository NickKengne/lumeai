import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Partners } from "@/components/partners";
import { FeatureGrid } from "@/components/feature-card";
import { ChatInput } from "@/components/chat-input";
import { Check } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lume AI - Turn App Screenshots into Beautiful App Store Visuals",
  description: "AI-powered tool that transforms your app screenshots into stunning App Store-ready visuals in under a minute. Upload screenshots, get perfect mockups with headlines, ready for submission.",
  alternates: {
    canonical: 'https://lumeai.com',
  },
};

export default function Home() {
  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://lumeai.com/#webapp",
        "name": "Lume AI",
        "url": "https://lumeai.com",
        "description": "AI-powered tool that transforms your app screenshots into stunning App Store-ready visuals in under a minute.",
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Free tier available with pay-per-use pricing"
        },
        "featureList": [
          "AI-powered screenshot enhancement",
          "Automatic iPhone mockup placement",
          "Headline generation",
          "Multi-size export for App Store",
          "Interactive canvas editor",
          "Drag-and-drop positioning"
        ],
        "screenshot": "https://lumeai.com/images/card-1.png",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "127",
          "bestRating": "5",
          "worstRating": "1"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://lumeai.com/#organization",
        "name": "Lume AI",
        "url": "https://lumeai.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://lumeai.com/images/logo.png",
          "width": 512,
          "height": 512
        },
        "description": "AI-powered App Store screenshot generator for indie developers and startups",
        "sameAs": [
          "https://twitter.com/lumeai",
          "https://github.com/lumeai"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://lumeai.com/#website",
        "url": "https://lumeai.com",
        "name": "Lume AI",
        "description": "Turn your app screenshots into beautiful App Store visuals with AI",
        "publisher": {
          "@id": "https://lumeai.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://lumeai.com/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://lumeai.com/#software",
        "name": "Lume AI",
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Web, macOS, Windows, Linux",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Create beautiful App Store screenshots in minutes with AI-powered automation"
      },
      {
        "@type": "FAQPage",
        "@id": "https://lumeai.com/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Lume AI?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Lume AI is an AI-powered tool that transforms your raw app screenshots into beautiful, App Store-ready visuals in under a minute. It automatically places screenshots into iPhone mockups, adds headlines, and exports perfectly sized assets."
            }
          },
          {
            "@type": "Question",
            "name": "How long does it take to generate screenshots?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The entire process takes under 5 minutes from uploading your screenshots to downloading App Store-ready assets."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need design skills?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No design skills are required. Lume AI automates the entire design process using AI while still allowing you to customize text, colors, and positioning."
            }
          },
          {
            "@type": "Question",
            "name": "What sizes are exported?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Lume AI exports all required App Store screenshot sizes including 6.7\", 6.5\", and iPad Pro sizes, ready for immediate submission."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex min-h-screen flex-col bg-neutral-50 font-sans">
        <main className="flex flex-1 flex-col bg-neutral-50">
          <Navbar />

          {/* Hero Section */}
          <section className="max-w-7xl mx-auto w-full px-6 py-32">
            <div className="flex flex-col items-center gap-6 max-w-4xl mx-auto">
              <h1 className="text-6xl md:text-7xl font-light text-center tracking-tight text-neutral-900">
                App Store visuals,<br />generated in <span className="text-neutral-400"> under a minute</span>
              </h1>
              <div className="flex flex-col items-center gap-3 w-full">
                <p className="text-xl text-center text-neutral-500 font-light max-w-2xl">
                  Transform raw screenshots into polished App Store assets with AI. 
                  No design skills required—just upload, customize, and export.
                </p>
                <p className="text-base text-center text-neutral-400 font-light">
                  Trusted by indie developers and startups worldwide
                </p>
              </div>
              <div className="w-full max-w-2xl mt-4">
                <ChatInput/>
              </div>
              <Partners />
            </div>
          </section>

          {/* Features Section */}
          <section className="max-w-7xl mx-auto w-full px-6 py-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-light tracking-tight text-neutral-900 mb-4">
                  Everything you need to launch
                </h2>
                <p className="text-lg text-neutral-500 font-light max-w-2xl mx-auto">
                  From screenshot upload to App Store submission—complete your visuals in minutes, not days.
                </p>
              </div>
              <FeatureGrid />
            </div>
          </section>

          {/* Pricing Section */}
          <section className="max-w-7xl mx-auto w-full px-6 py-20 border-t border-neutral-200">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-light tracking-tight text-neutral-900 mb-4">
                  Simple, transparent pricing
                </h2>
                <p className="text-lg text-neutral-500 font-light">
                  Start for free. Upgrade when you're ready.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-px bg-neutral-200">
                {/* Free Plan */}
                <div className="bg-neutral-50 p-10">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm uppercase tracking-widest text-neutral-400 mb-4 font-light">
                        Free
                      </h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-light text-neutral-900">$0</span>
                        <span className="text-neutral-400 font-light">/month</span>
                      </div>
                      <p className="text-sm text-neutral-500 font-light">
                        Perfect to get started
                      </p>
                    </div>

                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                        <Check className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                        <span>3 screenshot generations</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                        <Check className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                        <span>AI analysis & suggestions</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                        <Check className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                        <span>Basic templates</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                        <Check className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                        <span>Standard export</span>
                      </li>
                    </ul>

                    <Link href="/dashboard">
                      <button className="w-full py-3 px-6 border border-neutral-200 text-neutral-900 text-sm font-light tracking-wide hover:bg-neutral-100 transition-colors">
                        Get Started
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="bg-neutral-900 p-10 relative">
                  <div className="absolute top-4 right-4">
                    <span className="text-xs uppercase tracking-widest text-neutral-400 font-light">
                      Popular
                    </span>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm uppercase tracking-widest text-neutral-400 mb-4 font-light">
                        Pro
                      </h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-light text-white">$29</span>
                        <span className="text-neutral-400 font-light">/month</span>
                      </div>
                      <p className="text-sm text-neutral-400 font-light">
                        For serious developers
                      </p>
                    </div>

                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-neutral-300 font-light">
                        <Check className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                        <span>Unlimited screenshots</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-neutral-300 font-light">
                        <Check className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                        <span>Advanced AI analysis</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-neutral-300 font-light">
                        <Check className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                        <span>All templates</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-neutral-300 font-light">
                        <Check className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                        <span>Priority support</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-neutral-300 font-light">
                        <Check className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                        <span>10 videos/month (30s)</span>
                      </li>
                    </ul>

                    <Link href="/dashboard">
                      <button className="w-full py-3 px-6 bg-white text-neutral-900 text-sm font-light tracking-wide hover:bg-neutral-100 transition-colors">
                        Start Pro Trial
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Enterprise Plan */}
                <div className="bg-neutral-50 p-10">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm uppercase tracking-widest text-neutral-400 mb-4 font-light">
                        Enterprise
                      </h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-light text-neutral-900">Custom</span>
                      </div>
                      <p className="text-sm text-neutral-500 font-light">
                        For teams & agencies
                      </p>
                    </div>

                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                        <Check className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                        <span>Everything in Pro</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                        <Check className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                        <span>Team collaboration</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                        <Check className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                        <span>Custom templates</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                        <Check className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                        <span>Unlimited videos</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                        <Check className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                        <span>API access</span>
                      </li>
                    </ul>

                    <Link href="/pricing">
                      <button className="w-full py-3 px-6 border border-neutral-200 text-neutral-900 text-sm font-light tracking-wide hover:bg-neutral-100 transition-colors">
                        Contact Sales
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="text-center mt-12">
                <Link href="/pricing" className="text-sm text-neutral-500 font-light hover:text-neutral-900 transition-colors">
                  View full pricing details →
                </Link>
              </div>
            </div>
          </section>

          {/* Call-to-Action Section */}
          <section className="max-w-7xl mx-auto w-full px-6 py-20 border-t border-neutral-200">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 mb-6">
                Ready to transform your app visuals?
              </h2>
              <p className="text-xl text-neutral-500 font-light mb-10 max-w-2xl mx-auto">
                Join thousands of developers creating stunning App Store assets with AI. 
                Start free, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/dashboard">
                  <button className="px-8 py-3 bg-neutral-900 text-white text-sm font-light tracking-wide hover:bg-neutral-800 transition-colors border border-neutral-900">
                    Get Started Free
                  </button>
                </Link>
                <Link href="/pricing">
                  <button className="px-8 py-3 border border-neutral-200 text-neutral-900 text-sm font-light tracking-wide hover:bg-neutral-100 transition-colors">
                    View Pricing
                  </button>
                </Link>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-neutral-200 mt-20">
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="grid md:grid-cols-4 gap-12 mb-12">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <img src="/images/logo.png" alt="LumeAI" width={30} height={30} />
                    <span className="text-lg font-light text-neutral-900">Lume AI</span>
                  </div>
                  <p className="text-sm text-neutral-500 font-light">
                    AI-powered App Store screenshot generator for developers and designers.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm uppercase tracking-widest text-neutral-400 mb-4 font-light">
                    Product
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/dashboard" className="text-sm text-neutral-500 font-light hover:text-neutral-900 transition-colors">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/pricing" className="text-sm text-neutral-500 font-light hover:text-neutral-900 transition-colors">
                        Pricing
                      </Link>
                    </li>
                    <li>
                      <Link href="/features" className="text-sm text-neutral-500 font-light hover:text-neutral-900 transition-colors">
                        Features
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm uppercase tracking-widest text-neutral-400 mb-4 font-light">
                    Company
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/about" className="text-sm text-neutral-500 font-light hover:text-neutral-900 transition-colors">
                        About
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs" className="text-sm text-neutral-500 font-light hover:text-neutral-900 transition-colors">
                        Documentation
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm uppercase tracking-widest text-neutral-400 mb-4 font-light">
                    Legal
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/privacy" className="text-sm text-neutral-500 font-light hover:text-neutral-900 transition-colors">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-sm text-neutral-500 font-light hover:text-neutral-900 transition-colors">
                        Terms of Service
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-neutral-400 font-light">
                  © {new Date().getFullYear()} Lume AI. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                  <a href="https://twitter.com/lumeai" className="text-sm text-neutral-400 font-light hover:text-neutral-900 transition-colors">
                    Twitter
                  </a>
                  <a href="https://github.com/lumeai" className="text-sm text-neutral-400 font-light hover:text-neutral-900 transition-colors">
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
