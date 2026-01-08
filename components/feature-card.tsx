"use client";

import * as React from "react";
import { Upload, Sparkles, FileText, Mic, Video, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
      className={`w-full p-10 text-left bg-neutral-50 border border-dashed border-neutral-200 hover:bg-neutral-100 transition-colors cursor-pointer ${className}`}
    >
      {/* Icon/Illustration area */}
      <div className="mb-6 h-32 flex items-center justify-center">{icon}</div>

      {/* Title */}
      <h3 className="text-xl font-light text-neutral-900 mb-3">{title}</h3>

      {/* Description */}
      <p className="text-neutral-500 text-sm leading-relaxed font-light">{description}</p>
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
        <div className="relative flex gap-2 justify-center w-[70px]">
          <Image
            src="/images/1255@3x.png"
            alt="AI generation"
            width={100}
            height={70}
            className="w-full h-full object-cover rounded-md"
          />
          <Image
            src="/images/1256@3x.png"
            alt="AI generation"
            width={70}
            height={70}
            className="w-full h-full object-cover rounded-md"
          /><Image
          src="/images/1257@3x.png"
          alt="AI generation"
          width={70}
          height={70}
          className="w-full h-full object-cover rounded-md"
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
        <div className="relative flex gap-2 justify-center w-[70px]">
          <Image
            src="/images/1345@3x.png"
            alt="AI generation"
            width={100}
            height={70}
            className="w-full h-full object-cover rounded-md"
          />
          <Image
            src="/images/1344@3x.png"
            alt="AI generation"
            width={70}
            height={70}
            className="w-full h-full object-cover rounded-md"
          />
          <Image
          src="/images/1347@3x.png"
          alt="AI generation"
          width={70}
          height={70}
          className="w-full h-full object-cover rounded-md"
        />
        <Image
          src="/images/1343@3x.png"
          alt="AI generation"
          width={70}
          height={70}
          className="w-full h-full object-cover rounded-md"
        />
        <Image
          src="/images/1346@3x.png"
          alt="AI generation"
          width={70}
          height={70}
          className="w-full h-full object-cover rounded-md"
        />
        </div>
      }
      title="Ready for the App Store"
      description="Get perfectly sized screenshots for iOS, optimized for App Store guidelines and instant submission."
    />
  </div>

  {/* Card 4 — Video Generation */}
  <div className="col-span-12 md:col-span-2">
      <Link href="/dashboard/video">
      <FeatureCard
        icon={
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 bg-neutral-900 flex items-center justify-center">
              <div className="relative">
                <Video className="h-10 w-10 text-white" />
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-neutral-600 flex items-center justify-center">
                  <Play className="h-3 w-3 text-white ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        }
        title="Create Promo Videos"
        description="Transform screenshots into stunning promotional videos with AI-powered animations."
      />
    </Link>
  </div>

</div>

  );
}