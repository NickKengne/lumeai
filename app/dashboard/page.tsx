"use client"

import { ChatInput } from "@/components/chat-input";
import { FeatureGrid } from "@/components/feature-card";
import { NavActions } from "@/components/nav-actions";
import { Partners } from "@/components/partners";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import * as React from "react";

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

function getUserName(): string {
  // Try to get user name from localStorage (saved from settings)
  if (typeof window !== 'undefined') {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      return savedName;
    }
  }
  return "there"; // Default fallback
}

export default function Page() {
  const [greeting, setGreeting] = React.useState("Hello");
  const [userName, setUserName] = React.useState("there");
  
  React.useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    setUserName(getUserName());
  }, []);

  return (
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center gap-2 bg-neutral-50 border-b border-neutral-200">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  Dashboard
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-3">
          <NavActions />
        </div>
      </header>
      <div className="bg-neutral-50 flex flex-col gap-4 px-4 py-10 justify-center items-center">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-light tracking-tight text-neutral-900">
            {greeting}, {userName}!
          </h1>
            <p className="text-3xl text-neutral-500 mb-4 mt-2 font-light">
              How can I help you with your screenshots today?
            </p>
        <FeatureGrid />
        </div>
        <ChatInput />
      </div>
    </SidebarInset>
  );
}
