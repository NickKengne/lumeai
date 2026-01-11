import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Lume AI",
  description: "Privacy Policy for Lume AI - How we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-32">
        <div className="mb-16">
          <h1 className="text-6xl font-light tracking-tight text-neutral-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-neutral-400 font-light">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Introduction</h2>
            <p className="text-neutral-500 font-light leading-relaxed">
              Lume AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              service to generate App Store screenshots and videos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">Account Information</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  When you create an account, we collect your name, email address, and any profile 
                  information you provide. We use this to manage your account and communicate with you.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">Screenshots and Content</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  We process the screenshots and images you upload to generate App Store visuals. 
                  This content is processed temporarily and is not stored permanently unless you 
                  explicitly save it to your account.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">Usage Data</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  We collect information about how you use our service, including features accessed, 
                  generation counts, and interaction patterns. This helps us improve our service.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">Technical Data</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  We automatically collect device information, IP addresses, browser type, and 
                  operating system for security and service optimization purposes.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-neutral-500 font-light leading-relaxed ml-4">
              <li>To provide and maintain our service</li>
              <li>To process your screenshot and video generation requests</li>
              <li>To improve and optimize our AI models and features</li>
              <li>To send you service-related communications</li>
              <li>To respond to your support requests</li>
              <li>To detect and prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Data Storage and Security</h2>
            <p className="text-neutral-500 font-light leading-relaxed mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-neutral-500 font-light leading-relaxed ml-4">
              <li>Encryption in transit and at rest</li>
              <li>Secure cloud infrastructure</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
            </ul>
            <p className="text-neutral-500 font-light leading-relaxed mt-4">
              Your uploaded screenshots are processed and stored temporarily. You can delete your 
              content at any time from your dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Third-Party Services</h2>
            <p className="text-neutral-500 font-light leading-relaxed">
              We use third-party services to provide our functionality, including AI processing 
              services (OpenAI, Sora) and cloud storage providers. These services process your 
              data according to their own privacy policies and our data processing agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Your Rights</h2>
            <p className="text-neutral-500 font-light leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-neutral-500 font-light leading-relaxed ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to certain processing activities</li>
            </ul>
            <p className="text-neutral-500 font-light leading-relaxed mt-4">
              To exercise these rights, contact us at privacy@lumeai.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Cookies and Tracking</h2>
            <p className="text-neutral-500 font-light leading-relaxed">
              We use cookies and similar technologies to maintain your session, remember your 
              preferences, and analyze service usage. You can control cookies through your browser 
              settings, though this may affect service functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Children's Privacy</h2>
            <p className="text-neutral-500 font-light leading-relaxed">
              Our service is not intended for users under 13 years of age. We do not knowingly 
              collect personal information from children. If you believe we have collected information 
              from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Changes to This Policy</h2>
            <p className="text-neutral-500 font-light leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any 
              material changes by posting the new policy on this page and updating the "Last updated" 
              date. Your continued use of our service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Contact Us</h2>
            <p className="text-neutral-500 font-light leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 space-y-1 text-neutral-500 font-light">
              <p>Email: privacy@lumeai.com</p>
              <p>Address: [Your Company Address]</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}




