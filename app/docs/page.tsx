import { Navbar } from "@/components/navbar";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation - Lume AI",
  description: "Complete documentation for Lume AI - App Store screenshot generator with AI-powered features.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-32">
        <div className="mb-16">
          <h1 className="text-6xl font-light tracking-tight text-neutral-900 mb-4">
            Documentation
          </h1>
          <p className="text-lg text-neutral-500 font-light max-w-2xl">
            Everything you need to get started with Lume AI and create stunning App Store visuals.
          </p>
        </div>

        <div className="space-y-12">
          {/* Getting Started */}
          <section className="border-b border-neutral-200 pb-12">
            <h2 className="text-3xl font-light text-neutral-900 mb-6">Getting Started</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-3">Quick Start</h3>
                <p className="text-neutral-500 font-light leading-relaxed mb-4">
                  Lume AI helps you transform raw app screenshots into polished App Store-ready visuals in minutes. 
                  No design skills required.
                </p>
                <ol className="list-decimal list-inside space-y-2 text-neutral-600 font-light ml-4">
                  <li>Upload your app screenshots</li>
                  <li>Let AI analyze and suggest layouts</li>
                  <li>Customize text, colors, and positioning</li>
                  <li>Export in all required App Store sizes</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="border-b border-neutral-200 pb-12">
            <h2 className="text-3xl font-light text-neutral-900 mb-6">Features</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-3">AI-Powered Analysis</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  Our AI analyzes your screenshots to detect colors, typography, mood, and design style. 
                  It then suggests the best templates and backgrounds that match your app's aesthetic.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-3">Template Library</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  Choose from a variety of professionally designed templates including centered, offset, 
                  gradient, minimal, and tilted layouts. Each template is optimized for App Store guidelines.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-3">Interactive Canvas</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  Drag and drop elements, customize text, adjust colors, and fine-tune positioning. 
                  The canvas editor gives you full control while maintaining App Store compliance.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-3">Video Generation</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  Transform your screenshots into promotional videos using Sora AI. Choose from different 
                  styles, durations, and background music to create engaging app previews.
                </p>
              </div>
            </div>
          </section>

          {/* Export Sizes */}
          <section className="border-b border-neutral-200 pb-12">
            <h2 className="text-3xl font-light text-neutral-900 mb-6">Export Sizes</h2>
            <div className="space-y-4">
              <p className="text-neutral-500 font-light leading-relaxed">
                Lume AI automatically exports your screenshots in all required App Store sizes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-600 font-light ml-4">
                <li>iPhone 6.7" (1290 x 2796 pixels)</li>
                <li>iPhone 6.5" (1284 x 2778 pixels)</li>
                <li>iPhone 5.5" (1242 x 2208 pixels)</li>
                <li>iPad Pro 12.9" (2048 x 2732 pixels)</li>
                <li>iPad Pro 11" (1668 x 2388 pixels)</li>
              </ul>
            </div>
          </section>

          {/* Best Practices */}
          <section className="border-b border-neutral-200 pb-12">
            <h2 className="text-3xl font-light text-neutral-900 mb-6">Best Practices</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-3">Screenshot Quality</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  Use high-resolution screenshots (at least 1242px width) for best results. 
                  Ensure your screenshots clearly show key features and are free of personal information.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-3">Headlines</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  Keep headlines concise and benefit-focused. Highlight what makes your app unique 
                  and valuable to users. Avoid generic phrases.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-3">Visual Consistency</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  Maintain consistent colors and typography across all screenshots. Use the AI-suggested 
                  color palette extracted from your app for a cohesive look.
                </p>
              </div>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-3xl font-light text-neutral-900 mb-6">Support</h2>
            <div className="space-y-4">
              <p className="text-neutral-500 font-light leading-relaxed">
                Need help? We're here for you.
              </p>
              <div className="space-y-2">
                <Link href="/dashboard" className="block text-neutral-600 font-light hover:text-neutral-900 transition-colors">
                  → Start creating in the dashboard
                </Link>
                <Link href="/pricing" className="block text-neutral-600 font-light hover:text-neutral-900 transition-colors">
                  → View pricing plans
                </Link>
                <a href="mailto:support@lumeai.com" className="block text-neutral-600 font-light hover:text-neutral-900 transition-colors">
                  → Contact support: support@lumeai.com
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}




