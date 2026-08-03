import React from "react";
import Back from "./ClientComponents/Back";

function Privacy() {
  return (
    <section className="min-h-screen pt-34 bg-gray-50 py-20 px-4 md:px-20">
      <div className="max-w-4xl mx-auto">
        <Back />
        <h1 className="text-4xl font-bold mb-6 ">Privacy Policy</h1>

        <p className="mb-6 text-gray-700  text-sm">
          This Privacy Statement explains how we collect, use, and disclose your
          personal information when you use the "ReadNest service" or anywhere
          we display or reference this Privacy Statement. It also explains your
          privacy rights and how to exercise them.
        </p>

        <section className="mb-8  text-sm ">
          <h2 className="text-2xl font-semibold mb-4">Contacting Us</h2>
          <p className="text-gray-700 mb-2">
            For questions about this Privacy Statement, our use of your personal
            information, or how to exercise your privacy rights, please contact
            us at{" "}
            <span className="font-medium text-blue-600">
              ebisileonard@gmail.com
            </span>
            .
          </p>
        </section>

        <section className="mb-8  text-sm">
          <h2 className="text-2xl font-semibold mb-4">
            Information We Collect
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <span className="font-medium">Personal details:</span> Name,
              email, password, phone number.
            </li>
            <li>
              <span className="font-medium">Payment details:</span> Billing
              information, payment history.
            </li>
            <li>
              <span className="font-medium">Usage information:</span>{" "}
              Interactions with ReadNest content, search queries.
            </li>
            <li>
              <span className="font-medium">
                Device and network information:
              </span>{" "}
              IP address, device type, browser info.
            </li>
          </ul>
        </section>

        <section className="mb-8  text-sm">
          <h2 className="text-2xl font-semibold mb-4">
            How We Use Your Information
          </h2>
          <p className="text-gray-700 mb-2">
            We use your information to provide, maintain, and improve the
            ReadNest service, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Personalizing content and recommendations</li>
            <li>Processing payments and managing subscriptions</li>
            <li>
              Communicating with you about updates, offers, and service messages
            </li>
            <li>
              Ensuring security, preventing fraud, and complying with the law
            </li>
          </ul>
        </section>

        <section className="mb-8  text-sm">
          <h2 className="text-2xl font-semibold mb-4">Your Privacy Rights</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Access, correct, or delete your personal information</li>
            <li>Opt-out of marketing communications</li>
            <li>Limit or object to certain processing of your data</li>
            <li>Exercise rights to data portability</li>
          </ul>
        </section>

        <section className="mb-8  text-sm">
          <h2 className="text-2xl font-semibold mb-4">
            Cookies and Similar Technologies
          </h2>
          <p className="text-gray-700">
            We use cookies and similar technologies to improve your experience,
            show personalized content, and analyze usage. You can manage your
            cookie preferences in your browser settings.
          </p>
        </section>

        <section className="mb-8  text-sm">
          <h2 className="text-2xl font-semibold mb-4">Security & Retention</h2>
          <p className="text-gray-700">
            We protect your personal information with appropriate security
            measures and retain it only as long as necessary for the purposes
            described in this Privacy Statement.
          </p>
        </section>

        <section className="mb-8  text-sm">
          <h2 className="text-2xl font-semibold mb-4">Minors</h2>
          <p className="text-gray-700">
            The ReadNest service is intended for users 18 and above. Minors may
            use the service only with parental supervision.
          </p>
        </section>

        <section className="mb-8  text-sm">
          <h2 className="text-2xl font-semibold mb-4">
            Changes to This Policy
          </h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. Your continued
            use of ReadNest after any changes constitutes acceptance of the
            updated Privacy Policy.
          </p>
        </section>

        <p className="text-gray-500 text-sm text-center mt-12">
          Last updated: {new Date().getFullYear()}
        </p>
      </div>
    </section>
  );
}

export default Privacy;
