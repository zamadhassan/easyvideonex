import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${SITE_NAME}. Learn how we handle your data and privacy.`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">
        Privacy Policy
      </h1>
      <div className="text-gray-400 space-y-6 leading-relaxed">
        <p>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">
          1. Information We Collect
        </h2>
        <p>
          We do not collect, store, or share any personal information. The video
          URLs you submit are processed temporarily to generate download links
          and are not stored on our servers.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">
          2. How We Use Information
        </h2>
        <p>
          The URLs you provide are used solely to fetch video metadata and
          generate download links. No data is logged, tracked, or retained after
          the download process is complete.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">
          3. Third-Party Services
        </h2>
        <p>
          We do not use analytics, tracking cookies, or third-party data
          processors. Our service operates without external data collection.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">
          4. Data Security
        </h2>
        <p>
          All connections to our service are encrypted via HTTPS. We do not
          store any user data, minimizing security risks.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">
          5. Contact
        </h2>
        <p>
          If you have questions about this privacy policy, please contact us
          through the website.
        </p>
      </div>
    </div>
  );
}
