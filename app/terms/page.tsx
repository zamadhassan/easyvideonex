import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${SITE_NAME}. Please read these terms carefully before using our service.`,
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">
        Terms of Service
      </h1>
      <div className="text-gray-400 space-y-6 leading-relaxed">
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-xl font-semibold text-white mt-8">
          1. Acceptance of Terms
        </h2>
        <p>
          By using {SITE_NAME}, you agree to these terms of service. If you do
          not agree, please do not use the service.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">
          2. Service Description
        </h2>
        <p>
          {SITE_NAME} provides a tool for downloading public videos from
          supported platforms. The service is provided &quot;as is&quot; without
          warranties of any kind.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">
          3. User Responsibilities
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Only download content you own or have explicit permission to use.
          </li>
          <li>
            Respect copyright laws and platform terms of service.
          </li>
          <li>
            Do not use this service to download private, paid, or
            geo-restricted content.
          </li>
          <li>
            Do not abuse the service with automated requests or excessive usage.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-white mt-8">
          4. Copyright
        </h2>
        <p>
          Users are responsible for ensuring they have the right to download any
          content. We do not host any copyrighted content on our servers.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">
          5. Limitation of Liability
        </h2>
        <p>
          {SITE_NAME} is not liable for any damages arising from the use or
          inability to use the service.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">
          6. Changes to Terms
        </h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use
          of the service after changes constitutes acceptance of the new terms.
        </p>
      </div>
    </div>
  );
}
