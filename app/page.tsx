import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Partners } from "@/components/partners";
import { FeatureGrid } from "@/components/feature-card";
import { ChatInput } from "@/components/chat-input";
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
      <div className="flex min-h-screen flex-col bg-white font-sans">
        <main className="flex flex-1 min-h-screen max-w-7xl mx-auto flex-col items-center justify-center py-32 px-16 bg-neutral-50">
          <Navbar />

          <div className="flex flex-col items-center gap-4 max-w-4xl">
            <h1 className="text-5xl font-semibold text-center tracking-tight">
              The foundation for your App Store
            </h1>
            <div className="flex flex-col items-center gap-2 w-[90%]">
              <p className="text-lg text-center mt-1 mb-4">
                Turn your app into a store-ready experience. AI-generated
                screenshots, copy, and layouts you can shape, refine, and perfect.
                Start simple, make it yours, launch effortlessly.
              </p>
            </div>
            <ChatInput/>
            <Partners />
            <div className="max-w-4xl mx-auto px-6">
              <FeatureGrid />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
