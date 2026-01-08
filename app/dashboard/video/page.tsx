"use client"

import { VideoGenerator } from "@/components/video-generator";
import { NavActions } from "@/components/nav-actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Upload, X, Video } from "lucide-react";
import * as React from "react";

export default function VideoPage() {
  const [screenshots, setScreenshots] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          urls.push(result);
          if (urls.length === files.length) {
            setScreenshots(prev => [...prev, ...urls]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center gap-2 bg-zinc-50">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  Video Generator
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-3">
          <NavActions />
        </div>
      </header>
      
      <div className="bg-zinc-50 min-h-screen p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-neutral-900 mb-4">
              <Video className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-neutral-900 mb-2">
              Create Promotional Video
            </h1>
            <p className="text-neutral-600">
              Transform your app screenshots into stunning promotional videos with AI
            </p>
          </div>

          {/* Upload Section */}
          {screenshots.length === 0 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8">
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center hover:border-neutral-400 transition-colors cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
                  <p className="text-lg font-medium text-neutral-900 mb-2">
                    Upload App Screenshots
                  </p>
                  <p className="text-sm text-neutral-500">
                    Select multiple screenshots to create your video
                  </p>
                  <p className="text-xs text-neutral-400 mt-2">
                    PNG, JPG up to 10MB each
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Screenshots Preview */}
          {screenshots.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-neutral-900">
                  Screenshots ({screenshots.length})
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-neutral-600 hover:text-neutral-900"
                >
                  + Add more
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <div className="grid grid-cols-6 gap-3">
                {screenshots.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <div className="aspect-[9/19] rounded-lg overflow-hidden border border-neutral-200">
                      <img 
                        src={url} 
                        alt={`Screenshot ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeScreenshot(idx)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Generator */}
          {screenshots.length > 0 && (
            <VideoGenerator screenshots={screenshots} />
          )}
        </div>
      </div>
    </SidebarInset>
  );
}

