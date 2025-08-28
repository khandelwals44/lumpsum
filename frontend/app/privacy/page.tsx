import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Lumpsum.in",
  description: "Privacy policy and data protection information for Lumpsum.in",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
        </p>

        <h2>2. Personal Information</h2>
        <p>
          We may collect personal information such as your name, email address, and other contact information when you register for an account or use our services.
        </p>

        <h2>3. Usage Information</h2>
        <p>
          We automatically collect certain information about your use of our services, including your IP address, browser type, operating system, and pages visited.
        </p>

        <h2>4. How We Use Your Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve our services, communicate with you, and ensure the security of our platform.
        </p>

        <h2>5. Information Sharing</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
        </p>

        <h2>6. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2>7. Cookies and Tracking</h2>
        <p>
          We use cookies and similar tracking technologies to enhance your experience on our website and analyze usage patterns.
        </p>

        <h2>8. Third-Party Services</h2>
        <p>
          Our services may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.
        </p>

        <h2>9. Children&apos;s Privacy</h2>
        <p>
          Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy, please contact us through our website.
        </p>

        <p className="text-sm text-gray-600 mt-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
