"use client";

import * as React from "react";
import { Upload, Sparkles, FileText, Mic } from "lucide-react";
import Image from "next/image";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

function FeatureCard({ icon, title, description, onClick, className = "" }: FeatureCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left bg-zinc-50 rounded-2xl border border-dashed border-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer ${className}`}
    >
      {/* Icon/Illustration area */}
      <div className="mb-6 h-32 flex items-center justify-center">{icon}</div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-neutral-600">{title}</h3>

      {/* Description */}
      <p className="text-neutral-500 text-sm leading-relaxed">{description}</p>
    </button>
  );
}

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-5 gap-4 mt-15">

  {/* Card 1 — Upload Screenshots */}
  <div className="col-span-12 md:col-span-2">
    <FeatureCard
      icon={
        <div className="relative">
          <Image
            src="/images/card-1.png"
            alt="Upload screenshots"
            width={400}
            height={400}
          />
        </div>
      }
      title="Upload your screenshots"
      description="Upload your raw app screenshots directly from your device. No preparation required."
    />
  </div>

  {/* Card 2 — AI Generation */}
  <div className="col-span-12 md:col-span-3">
    <FeatureCard
      icon={
        <div className="relative flex gap-2 justify-center">
          <Image
            src="/images/card-2.png"
            alt="AI generation"
            width={400}
            height={400}
          />
        </div>
      }
      title="AI-enhanced App Store visuals"
      description="We automatically place your screens inside clean iPhone mockups, add headlines, and generate store-ready layouts."
    />
  </div>

  {/* Card 3 — App Store Ready Export */}
  <div className="col-span-12 md:col-span-3">
    <FeatureCard
      icon={
        <div className="flex gap-3 items-center justify-center">
          <Image
            src="/images/card-3.png"
            alt="App Store export"
            width={450}
            height={450}
          />
        </div>
      }
      title="Ready for the App Store"
      description="Get perfectly sized screenshots for iOS, optimized for App Store guidelines and instant submission."
    />
  </div>

  {/* Card 4 — One-Click Flow */}
  <div className="col-span-12 md:col-span-2">
    <FeatureCard
      icon={
        <div className="relative flex items-center justify-center">
          <div className="absolute w-15 h-15 bg-blue-500 rounded-full flex items-center justify-center">
            <Mic className="w-7 h-7 text-white" />
          </div>
        </div>
      }
      title="Done in one minute"
      description="One click. One minute. No design tools, no manual work. Just upload and generate."
    />
  </div>

</div>

  );
}