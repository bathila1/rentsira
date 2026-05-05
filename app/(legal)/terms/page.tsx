import { settingsData } from '@/settings';
import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Terms and Conditions</h1>
      <p className="text-sm text-gray-500 mb-10 italic">Last Updated: May 5, 2026</p>

      <div className="prose prose-blue max-w-none space-y-8 text-lg leading-relaxed">
        <p>
          Welcome to <strong>Siraa.lk</strong>. These Terms and Conditions govern your use of our platform and the services we provide. By accessing or using Siraa, you agree to be bound by these terms. Please read them carefully.
        </p>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Use of the Platform</h2>
          <ul className="list-disc ml-8 space-y-3">
            <li><strong>Eligibility:</strong> You must be at least 18 years old to create an account. For vehicle rentals, a valid Sri Lankan Driving License is required.</li>
            <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
            <li><strong>Prohibited Conduct:</strong> You agree not to use the platform for any unlawful purpose, including posting fraudulent listings or harassing other users.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Marketplace Rules</h2>
          <p className="mb-4">Siraa.lk acts as a facilitator connecting buyers, sellers, and renters. As a user, you agree that:</p>
          <ul className="list-disc ml-8 space-y-3">
            <li><strong>Sellers/Owners:</strong> Must provide accurate descriptions, high-quality images, and honest information about the vehicle&apos;s condition and legal status.</li>
            <li><strong>Buyers/Renters:</strong> Must use the platform to communicate and complete transactions in good faith.</li>
            <li><strong>Listings:</strong> Siraa reserves the right to remove any listing that violates our quality standards or community guidelines without prior notice.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">3. Payments and Fees</h2>
          <p className="mb-4">
            All financial transactions on Siraa are processed securely via <strong>PayHere</strong>.
          </p>
          <ul className="list-disc ml-8 space-y-3">
            <li>Listing fees and promotional (Bump) fees are non-refundable once the service is active.</li>
            <li>Booking or reservation fees are subject to our <strong>Refund Policy</strong>.</li>
            <li>Siraa is not responsible for any additional bank charges or currency conversion fees applied by your financial institution.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">4. Intellectual Property</h2>
          <p>
            All content on Siraa.lk, including logos, text, graphics, and software, is the property of Siraa or its licensors and is protected by copyright and other intellectual property laws. Users retain ownership of the photos and descriptions they upload but grant Siraa a license to display them.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Limitation of Liability</h2>
          <p>
            Siraa.lk is a marketplace and <strong>does not own or inspect</strong> the vehicles listed by users. To the fullest extent permitted by law:
          </p>
          <ul className="list-disc ml-8 space-y-3 mt-4">
            <li>Siraa is not liable for the condition, safety, or legality of any vehicle listed on the platform.</li>
            <li>We are not responsible for any disputes, damages, or losses arising from transactions between users.</li>
            <li>Use of the platform and any resulting transactions are at your own risk.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Amendments</h2>
          <p>
            We may modify these Terms at any time. Your continued use of the platform after changes are posted constitutes your acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">7. Governing Law</h2>
          <p>
            These Terms and Conditions are governed by and construed in accordance with the laws of Sri Lanka.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">8. Contact Us</h2>
          <p>
            If you have questions about these Terms, please contact us at:
            <br />
            <span className="font-semibold text-blue-600">Email: {settingsData.supportMail}</span>
          </p>
        </section>
      </div>
    </div>
  );
}