import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation - Lume AI",
  description: "Complete API documentation for Lume AI - Integrate App Store screenshot generation into your applications.",
};

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-32">
        <div className="mb-16">
          <h1 className="text-6xl font-light tracking-tight text-neutral-900 mb-4">
            API Documentation
          </h1>
          <p className="text-lg text-neutral-500 font-light max-w-2xl">
            Integrate Lume AI into your applications with our RESTful API. Generate App Store 
            screenshots programmatically with full control over templates, styles, and exports.
          </p>
        </div>

        <div className="space-y-12">
          {/* Authentication */}
          <section className="border-b border-neutral-200 pb-12">
            <h2 className="text-3xl font-light text-neutral-900 mb-6">Authentication</h2>
            <div className="space-y-4">
              <p className="text-neutral-500 font-light leading-relaxed">
                All API requests require authentication using your API key. Include your key in the 
                Authorization header:
              </p>
              <div className="bg-neutral-900 text-neutral-50 p-4 font-mono text-sm">
                <code>Authorization: Bearer YOUR_API_KEY</code>
              </div>
              <p className="text-neutral-500 font-light leading-relaxed">
                You can generate API keys from your account settings. Keep your keys secure and 
                never expose them in client-side code.
              </p>
            </div>
          </section>

          {/* Base URL */}
          <section className="border-b border-neutral-200 pb-12">
            <h2 className="text-3xl font-light text-neutral-900 mb-6">Base URL</h2>
            <div className="bg-neutral-900 text-neutral-50 p-4 font-mono text-sm mb-4">
              <code>https://api.lumeai.com/v1</code>
            </div>
            <p className="text-neutral-500 font-light leading-relaxed">
              All API endpoints are relative to this base URL.
            </p>
          </section>

          {/* Generate Screenshot */}
          <section className="border-b border-neutral-200 pb-12">
            <h2 className="text-3xl font-light text-neutral-900 mb-6">Generate Screenshot</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">POST /screenshots/generate</h3>
                <p className="text-neutral-500 font-light leading-relaxed mb-4">
                  Generate App Store screenshots from uploaded images.
                </p>
                
                <h4 className="text-lg font-light text-neutral-900 mb-2 mt-4">Request Body</h4>
                <div className="bg-neutral-900 text-neutral-50 p-4 font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "screenshots": [
    "https://example.com/screenshot1.png",
    "https://example.com/screenshot2.png"
  ],
  "template": "centered_bold",
  "headline": "Your App Headline",
  "subtitle": "Your app subtitle",
  "background_color": "#F0F4FF",
  "export_sizes": ["6.7", "6.5", "ipad"]
}`}</pre>
                </div>

                <h4 className="text-lg font-light text-neutral-900 mb-2 mt-4">Response</h4>
                <div className="bg-neutral-900 text-neutral-50 p-4 font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "id": "gen_1234567890",
  "status": "completed",
  "screenshots": [
    {
      "size": "6.7",
      "url": "https://cdn.lumeai.com/...",
      "width": 1290,
      "height": 2796
    }
  ],
  "created_at": "2025-01-15T10:30:00Z"
}`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Generate Video */}
          <section className="border-b border-neutral-200 pb-12">
            <h2 className="text-3xl font-light text-neutral-900 mb-6">Generate Video</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">POST /videos/generate</h3>
                <p className="text-neutral-500 font-light leading-relaxed mb-4">
                  Generate promotional videos from screenshots using Sora AI.
                </p>
                
                <h4 className="text-lg font-light text-neutral-900 mb-2 mt-4">Request Body</h4>
                <div className="bg-neutral-900 text-neutral-50 p-4 font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "screenshots": [
    "https://example.com/screenshot1.png"
  ],
  "style": "smooth",
  "duration": 10,
  "music": "upbeat",
  "prompt": "Create a smooth promotional video..."
}`}</pre>
                </div>

                <h4 className="text-lg font-light text-neutral-900 mb-2 mt-4">Response</h4>
                <div className="bg-neutral-900 text-neutral-50 p-4 font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "id": "vid_1234567890",
  "status": "processing",
  "video_url": "https://cdn.lumeai.com/...",
  "thumbnail_url": "https://cdn.lumeai.com/...",
  "estimated_completion": "2025-01-15T10:35:00Z"
}`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Analyze Screenshot */}
          <section className="border-b border-neutral-200 pb-12">
            <h2 className="text-3xl font-light text-neutral-900 mb-6">Analyze Screenshot</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">POST /screenshots/analyze</h3>
                <p className="text-neutral-500 font-light leading-relaxed mb-4">
                  Analyze screenshots to extract colors, typography, mood, and design suggestions.
                </p>
                
                <h4 className="text-lg font-light text-neutral-900 mb-2 mt-4">Request Body</h4>
                <div className="bg-neutral-900 text-neutral-50 p-4 font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "screenshot_url": "https://example.com/screenshot.png"
}`}</pre>
                </div>

                <h4 className="text-lg font-light text-neutral-900 mb-2 mt-4">Response</h4>
                <div className="bg-neutral-900 text-neutral-50 p-4 font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "mood": "modern",
  "dominant_colors": ["#3B82F6", "#10B981"],
  "suggested_backgrounds": ["#F0F4FF", "#FFF0F5"],
  "typography": {
    "primary_font": "SF Pro",
    "font_style": "sans-serif"
  },
  "suggested_templates": ["centered_bold", "offset_left"]
}`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Get Job Status */}
          <section className="border-b border-neutral-200 pb-12">
            <h2 className="text-3xl font-light text-neutral-900 mb-6">Get Job Status</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">GET /jobs/{`{job_id}`}</h3>
                <p className="text-neutral-500 font-light leading-relaxed mb-4">
                  Check the status of a generation job.
                </p>
                
                <h4 className="text-lg font-light text-neutral-900 mb-2 mt-4">Response</h4>
                <div className="bg-neutral-900 text-neutral-50 p-4 font-mono text-sm mb-4 overflow-x-auto">
                  <pre>{`{
  "id": "gen_1234567890",
  "status": "completed",
  "progress": 100,
  "result": {
    "screenshots": [...]
  },
  "error": null
}`}</pre>
                </div>
              </div>
            </div>
          </section>

          {/* Rate Limits */}
          <section className="border-b border-neutral-200 pb-12">
            <h2 className="text-3xl font-light text-neutral-900 mb-6">Rate Limits</h2>
            <div className="space-y-4">
              <p className="text-neutral-500 font-light leading-relaxed">
                API rate limits vary by plan:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-500 font-light leading-relaxed ml-4">
                <li><strong className="text-neutral-900">Free:</strong> 10 requests per hour</li>
                <li><strong className="text-neutral-900">Pro:</strong> 100 requests per hour</li>
                <li><strong className="text-neutral-900">Enterprise:</strong> Custom limits</li>
              </ul>
              <p className="text-neutral-500 font-light leading-relaxed mt-4">
                Rate limit headers are included in all responses:
              </p>
              <div className="bg-neutral-900 text-neutral-50 p-4 font-mono text-sm">
                <code>X-RateLimit-Limit: 100</code><br />
                <code>X-RateLimit-Remaining: 95</code><br />
                <code>X-RateLimit-Reset: 1642233600</code>
              </div>
            </div>
          </section>

          {/* Error Handling */}
          <section className="border-b border-neutral-200 pb-12">
            <h2 className="text-3xl font-light text-neutral-900 mb-6">Error Handling</h2>
            <div className="space-y-4">
              <p className="text-neutral-500 font-light leading-relaxed">
                Errors are returned with appropriate HTTP status codes and error messages:
              </p>
              <div className="bg-neutral-900 text-neutral-50 p-4 font-mono text-sm mb-4 overflow-x-auto">
                <pre>{`{
  "error": {
    "code": "invalid_request",
    "message": "Invalid screenshot URL",
    "details": {...}
  }
}`}</pre>
              </div>
              <p className="text-neutral-500 font-light leading-relaxed">
                Common status codes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-500 font-light leading-relaxed ml-4">
                <li><strong className="text-neutral-900">400:</strong> Bad Request</li>
                <li><strong className="text-neutral-900">401:</strong> Unauthorized</li>
                <li><strong className="text-neutral-900">429:</strong> Rate Limit Exceeded</li>
                <li><strong className="text-neutral-900">500:</strong> Internal Server Error</li>
              </ul>
            </div>
          </section>

          {/* SDKs */}
          <section className="border-b border-neutral-200 pb-12">
            <h2 className="text-3xl font-light text-neutral-900 mb-6">SDKs and Libraries</h2>
            <div className="space-y-4">
              <p className="text-neutral-500 font-light leading-relaxed">
                Official SDKs are available for popular languages:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-500 font-light leading-relaxed ml-4">
                <li>JavaScript/TypeScript: <code className="bg-neutral-100 px-1">npm install @lumeai/sdk</code></li>
                <li>Python: <code className="bg-neutral-100 px-1">pip install lumeai</code></li>
                <li>Ruby: <code className="bg-neutral-100 px-1">gem install lumeai</code></li>
              </ul>
            </div>
          </section>

          {/* Support */}
          <section>
            <h2 className="text-3xl font-light text-neutral-900 mb-6">Support</h2>
            <div className="space-y-4">
              <p className="text-neutral-500 font-light leading-relaxed">
                Need help with the API?
              </p>
              <div className="space-y-2">
                <a href="mailto:api@lumeai.com" className="block text-neutral-600 font-light hover:text-neutral-900 transition-colors">
                  → Email: api@lumeai.com
                </a>
                <a href="https://github.com/lumeai/api-examples" className="block text-neutral-600 font-light hover:text-neutral-900 transition-colors">
                  → Code examples on GitHub
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

