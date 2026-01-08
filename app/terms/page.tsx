import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Lume AI",
  description: "Terms of Service for Lume AI - Legal agreement for using our service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-32">
        <div className="mb-16">
          <h1 className="text-6xl font-light tracking-tight text-neutral-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-neutral-400 font-light">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Agreement to Terms</h2>
            <p className="text-neutral-500 font-light leading-relaxed">
              By accessing or using Lume AI ("the Service"), you agree to be bound by these Terms of Service. 
              If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Use of Service</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">Eligibility</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  You must be at least 13 years old to use our Service. By using the Service, you 
                  represent that you meet this age requirement and have the legal capacity to enter 
                  into this agreement.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">Account Registration</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials. 
                  You agree to notify us immediately of any unauthorized use of your account.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">Acceptable Use</h3>
                <p className="text-neutral-500 font-light leading-relaxed mb-2">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-neutral-500 font-light leading-relaxed ml-4">
                  <li>Use the Service for any illegal purpose</li>
                  <li>Upload content that infringes on intellectual property rights</li>
                  <li>Upload malicious software, viruses, or harmful code</li>
                  <li>Attempt to reverse engineer or compromise the Service</li>
                  <li>Use automated systems to abuse or overload the Service</li>
                  <li>Share your account credentials with others</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Content and Intellectual Property</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">Your Content</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  You retain ownership of screenshots and content you upload. By using the Service, 
                  you grant us a license to process, store, and generate derivative works from your 
                  content solely for providing the Service.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">Generated Content</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  You own the App Store visuals generated from your content. You are responsible for 
                  ensuring generated content complies with App Store guidelines and applicable laws.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">Our Intellectual Property</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  The Service, including templates, AI models, and software, is protected by 
                  intellectual property laws. You may not copy, modify, or distribute our proprietary 
                  materials without permission.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Payment and Billing</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">Subscription Plans</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  Paid plans are billed monthly or annually as selected. Prices are subject to change 
                  with 30 days' notice. Your subscription will automatically renew unless cancelled.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">Refunds</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  We offer a 14-day money-back guarantee for new subscriptions. Refund requests must 
                  be made within 14 days of initial purchase. No refunds for partial billing periods.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-light text-neutral-900 mb-2">Cancellation</h3>
                <p className="text-neutral-500 font-light leading-relaxed">
                  You may cancel your subscription at any time from your account settings. 
                  Cancellation takes effect at the end of your current billing period.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Service Availability</h2>
            <p className="text-neutral-500 font-light leading-relaxed">
              We strive to maintain high service availability but do not guarantee uninterrupted access. 
              The Service may be temporarily unavailable due to maintenance, updates, or circumstances 
              beyond our control. We are not liable for any downtime or service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Limitation of Liability</h2>
            <p className="text-neutral-500 font-light leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc list-inside space-y-2 text-neutral-500 font-light leading-relaxed ml-4">
              <li>The Service is provided "as is" without warranties of any kind</li>
              <li>We are not liable for any indirect, incidental, or consequential damages</li>
              <li>Our total liability is limited to the amount you paid in the 12 months preceding the claim</li>
              <li>We are not responsible for App Store rejection of generated content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Indemnification</h2>
            <p className="text-neutral-500 font-light leading-relaxed">
              You agree to indemnify and hold harmless Lume AI and its affiliates from any claims, 
              damages, or expenses arising from your use of the Service, violation of these Terms, 
              or infringement of any rights of another party.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Termination</h2>
            <p className="text-neutral-500 font-light leading-relaxed">
              We may suspend or terminate your account if you violate these Terms. You may terminate 
              your account at any time. Upon termination, your right to use the Service ceases, and 
              we may delete your account data after a reasonable retention period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Changes to Terms</h2>
            <p className="text-neutral-500 font-light leading-relaxed">
              We reserve the right to modify these Terms at any time. Material changes will be 
              notified via email or service notification. Continued use after changes constitutes 
              acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Governing Law</h2>
            <p className="text-neutral-500 font-light leading-relaxed">
              These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict 
              of law principles. Any disputes will be resolved in the courts of [Your Jurisdiction].
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">Contact Information</h2>
            <p className="text-neutral-500 font-light leading-relaxed">
              For questions about these Terms, contact us at:
            </p>
            <div className="mt-4 space-y-1 text-neutral-500 font-light">
              <p>Email: legal@lumeai.com</p>
              <p>Address: [Your Company Address]</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


