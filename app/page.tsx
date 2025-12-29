import Image from "next/image";
import { ChatInput } from "@/components/chat-input";
import { Navbar } from "@/components/navbar";
import { Partners } from "@/components/partners";
import { FeatureGrid } from "@/components/feature-card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans dark:bg-black">
      <main className="flex flex-1 min-h-screen max-w-7xl mx-auto flex-col items-center justify-center py-32 px-16 bg-neutral-50 dark:bg-black">
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
          <ChatInput />
          <Partners />
        </div>
      </main>
      <div className="max-w-4xl mx-auto px-6">
      <FeatureGrid/>
      </div>
    </div>
  );
}
