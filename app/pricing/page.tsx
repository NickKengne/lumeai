import { Navbar } from "@/components/navbar";
import { Check, Video, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - Lume AI",
  description: "Simple, transparent pricing for App Store screenshot and video generation. Pay as you go or subscribe for unlimited access.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      {/* Header */}
      <div className="mx-auto max-w-5xl px-6 pt-32 pb-20">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-light tracking-tight text-neutral-900">
            Pricing
          </h1>
          <p className="text-lg text-neutral-500 font-light max-w-xl mx-auto">
            Start for free. Upgrade when you're ready.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-6xl px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-px bg-neutral-200">
          
          {/* Free Plan */}
          <div className="bg-neutral-50 p-10">
            <div className="space-y-8">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-neutral-400 mb-4">
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
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>3 screenshot generations</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>AI analysis & suggestions</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>Basic templates</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>Standard export</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>1 video (5s max)</span>
                </li>
              </ul>

              <button className="w-full py-3 px-6 border border-neutral-200 text-neutral-900 text-sm font-light tracking-wide hover:bg-neutral-100 transition-colors">
                Get Started
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-neutral-900 p-10 relative">
            <div className="absolute top-4 right-4">
              <span className="text-xs uppercase tracking-widest text-neutral-400">
                Popular
              </span>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-neutral-400 mb-4">
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
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>Unlimited screenshots</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-300 font-light">
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>Advanced AI analysis</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-300 font-light">
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>All templates</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-300 font-light">
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-300 font-light">
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>10 videos/month (30s)</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-300 font-light">
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>Sora AI video styles</span>
                </li>
              </ul>

              <button className="w-full py-3 px-6 bg-white text-neutral-900 text-sm font-light tracking-wide hover:bg-neutral-100 transition-colors">
                Start Pro Trial
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-neutral-50 p-10">
            <div className="space-y-8">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-neutral-400 mb-4">
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
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>Custom templates</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>Unlimited videos</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>Custom video branding</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-neutral-600 font-light">
                  <Check className="w-4 h-4 mt-0.5 text-neutral-400 flex-shrink-0" />
                  <span>API access</span>
                </li>
              </ul>

              <button className="w-full py-3 px-6 border border-neutral-200 text-neutral-900 text-sm font-light tracking-wide hover:bg-neutral-100 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-3xl px-6 pb-32">
        <h2 className="text-3xl font-light text-neutral-900 mb-12 text-center">
          Questions
        </h2>
        
        <div className="divide-y divide-neutral-200">
          <div className="py-8">
            <h3 className="text-lg font-light text-neutral-900 mb-3">
              Can I cancel anytime?
            </h3>
            <p className="text-neutral-500 font-light leading-relaxed">
              Yes. Cancel your subscription anytime from your account settings. No questions asked.
            </p>
          </div>

          <div className="py-8">
            <h3 className="text-lg font-light text-neutral-900 mb-3">
              What payment methods do you accept?
            </h3>
            <p className="text-neutral-500 font-light leading-relaxed">
              We accept all major credit cards (Visa, Mastercard, Amex) and PayPal.
            </p>
          </div>

          <div className="py-8">
            <h3 className="text-lg font-light text-neutral-900 mb-3">
              Do you offer refunds?
            </h3>
            <p className="text-neutral-500 font-light leading-relaxed">
              Yes. If you're not satisfied within the first 14 days, we'll refund you in full.
            </p>
          </div>

          <div className="py-8">
            <h3 className="text-lg font-light text-neutral-900 mb-3">
              Is there a free trial?
            </h3>
            <p className="text-neutral-500 font-light leading-relaxed">
              Yes. Pro plan includes a 7-day free trial. No credit card required to start.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}