import { settingsData } from '@/settings';
import React from 'react';

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Refund & Cancellation Policy</h1>
      <p className="text-sm text-gray-500 mb-10 italic">Last Updated: May 5, 2026</p>

      <div className="prose prose-blue max-w-none space-y-8 text-lg leading-relaxed">
        <p>
          Thank you for using <strong>Renta.lk</strong>. We value your satisfaction and strive to provide a transparent and reliable marketplace for vehicle transactions. If you are not completely satisfied with a service or transaction, we are here to help.
        </p>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">1. Booking & Reservation Fees</h2>
          <p className="mb-4">
            Siraa allows users to book or reserve vehicles. The refund eligibility for these fees depends on the timing of the cancellation:
          </p>
          <ul className="list-disc ml-8 space-y-3">
            <li><strong>Full Refund:</strong> If a booking is cancelled at least 48 hours before the scheduled appointment or pickup.</li>
            <li><strong>Partial Refund (50%):</strong> If a booking is cancelled between 24 and 48 hours before the scheduled appointment or pickup.</li>
            <li><strong>No Refund:</strong> If a booking is cancelled less than 24 hours before the scheduled appointment or pickup, or in the case of a "No Show."</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">2. Seller Listing & "Bump" Fees</h2>
          <p className="mb-4">
            Fees paid for premium listings, "Bumps," or other promotional features on Siraa are generally <strong>non-refundable</strong> once the service has been activated. If a listing is rejected by our moderation team for violating our terms, a credit may be issued at our discretion.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">3. Owner/Seller Cancellations</h2>
          <p>
            In the event that a seller or vehicle owner cancels a confirmed booking or reservation, the buyer/renter will receive a <strong>100% refund</strong> of all charges paid online through Siraa.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">4. Refund Processing</h2>
          <p>
            Once a refund is approved, we will initiate the process through our payment partner, <strong>PayHere</strong>. Please note:
          </p>
          <ul className="list-disc ml-8 space-y-3 mt-4">
            <li>Refunds are credited back to the original method of payment.</li>
            <li>The processing time typically takes <strong>3 to 7 business days</strong>, depending on your bank or payment provider.</li>
            <li>Transaction fees incurred during the initial purchase may be non-refundable unless the cancellation was due to an error on our part or the seller's part.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">5. Dispute Resolution</h2>
          <p>
            If there is a disagreement between a buyer and a seller regarding a transaction, Siraa may act as a mediator but does not guarantee a specific outcome. Users are encouraged to resolve disputes amicably before requesting a refund. (We - Renta.lk Just act as a mediator. We do not involve in any disputes between buyers and sellers. )
          </p>
          <p>We Just link the Renter and the customer together. Users must select renters at their own convenience. and the renters must select their customers at their own risk.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">6. Contact Us</h2>
          <p>
            If you have any questions or concerns regarding our Refund & Cancellation Policy, please contact our support team at:
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-semibold text-blue-600">Email: {settingsData.supportMail}</p>
            <p>Hotline: {settingsData.phone3}</p>
          </div>
        </section>

        <p className="text-sm text-gray-400 mt-12 border-t pt-6">
          Note: This policy is subject to change. We encourage users to review it periodically.
        </p>
      </div>
    </div>
  );
}