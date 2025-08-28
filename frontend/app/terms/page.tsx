import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Lumpsum.in",
  description: "Terms of service and conditions for using Lumpsum.in",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose prose-lg max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Lumpsum.in, you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily download one copy of the materials (information or software) on Lumpsum.in for personal, non-commercial transitory viewing only.
        </p>

        <h2>3. Disclaimer</h2>
        <p>
          The materials on Lumpsum.in are provided on an &apos;as is&apos; basis. Lumpsum.in makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>

        <h2>4. Limitations</h2>
        <p>
          In no event shall Lumpsum.in or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Lumpsum.in, even if Lumpsum.in or a Lumpsum.in authorized representative has been notified orally or in writing of the possibility of such damage.
        </p>

        <h2>5. Investment Disclaimer</h2>
        <p>
          This platform provides investment recommendations for educational purposes only and does not constitute investment advice. Please consult with a qualified financial advisor before making any investment decisions.
        </p>

        <h2>6. Revisions and Errata</h2>
        <p>
          The materials appearing on Lumpsum.in could include technical, typographical, or photographic errors. Lumpsum.in does not warrant that any of the materials on its website are accurate, complete or current.
        </p>

        <h2>7. Links</h2>
        <p>
          Lumpsum.in has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Lumpsum.in of the site.
        </p>

        <h2>8. Modifications</h2>
        <p>
          Lumpsum.in may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms and Conditions of Use.
        </p>

        <h2>9. Governing Law</h2>
        <p>
          Any claim relating to Lumpsum.in shall be governed by the laws of India without regard to its conflict of law provisions.
        </p>

        <p className="text-sm text-gray-600 mt-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
