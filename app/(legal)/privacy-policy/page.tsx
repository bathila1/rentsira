import { settingsData } from "@/settings";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-10 italic">Last Updated: May 5, 2026</p>

      <div className="prose prose-blue max-w-none space-y-8 text-lg leading-relaxed">
        <p>
          At <strong>Renta.lk</strong>, we are committed to protecting the privacy and security of our customers&apos; personal information. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website or use our services. By using Siraa, you consent to the practices described in this policy.
        </p>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Information We Collect</h2>
          <p className="mb-4">To provide you with a seamless experience, we collect the following types of information:</p>
          <ul className="list-disc ml-8 space-y-3">
            <li><strong>Personal Identification:</strong> Name, email address, phone number, and NIC/Driving License details (for verification purposes).</li>
            <li><strong>Vehicle Information:</strong> Details provided by sellers about their vehicles, including images, registration numbers, and condition reports.</li>
            <li><strong>Usage Data:</strong> Information on how you interact with our platform, including search queries, viewed listings, and IP addresses.</li>
            <li><strong>Payment Information:</strong> We do <strong>not</strong> store your credit/debit card details. All payments are securely processed by <strong>PayHere</strong>, a PCI-DSS compliant payment gateway.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">2. How We Use Your Information</h2>
          <p className="mb-4">We use the collected information for purposes including:</p>
          <ul className="list-disc ml-8 space-y-3">
            <li>Facilitating vehicle sales, rentals, and bookings.</li>
            <li>Verifying the identity of buyers and sellers to ensure a safe marketplace.</li>
            <li>Communicating with you regarding your account, transactions, or support requests.</li>
            <li>Improving our website performance and personalized recommendations.</li>
            <li>Detecting and preventing fraudulent or unauthorized activities.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">3. Information Sharing</h2>
          <p>
            We respect your privacy and do not sell or trade your personal information. We may share data with trusted partners only to:
          </p>
          <ul className="list-disc ml-8 space-y-3 mt-4">
            <li>Process payments via PayHere.</li>
            <li>Comply with legal obligations or respond to valid law enforcement requests.</li>
            <li>Facilitate a transaction between a buyer and a seller (e.g., sharing contact info once a booking is confirmed).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">4. Data Security</h2>
          <p>
            We implement industry-standard security measures, including SSL encryption, to protect your data. While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Cookies and Tracking</h2>
          <p>
            Siraa uses cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can manage your cookie preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Changes to This Policy</h2>
          <p>
            We reserve the right to update this Privacy Policy at any time. Significant changes will be notified via email or a prominent notice on our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Contact Us</h2>
          <p>
            For any questions regarding your privacy, please contact us at:
            <br />
            <span className="font-semibold text-blue-600">Email: {settingsData.supportMail}</span>
          </p>
        </section>
      </div>
    </div>
  );
}
