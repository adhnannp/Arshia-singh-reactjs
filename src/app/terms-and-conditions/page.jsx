import Footer from '../../components/Footer';

export const metadata = {
  title: 'Terms & Conditions | ARSHIA SINGH',
  description: 'Terms & Conditions for ARSHIA SINGH website.',
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <section className="policy-page">
        <div className="policy-container">
          <span className="policy-label">Policies</span>
          <h1 className="policy-title">Terms & Conditions</h1>
          <div className="policy-body">
            <p>
              By accessing and using the ARSHIA SINGH website, you agree to be bound by the following Terms & Conditions.
            </p>

            <h2>Products</h2>
            <p>
              We make every effort to ensure that product descriptions, images, colours, and details are displayed accurately. However, actual colours may vary due to differences in device displays and screen settings.
            </p>

            <h2>Made-to-Order Products</h2>
            <p>
              Most ARSHIA SINGH garments are produced on a made-to-order basis. By placing an order, customers acknowledge that products are specifically produced for them and are subject to our Alteration, Exchange & Refund Policy.
            </p>

            <h2>Pricing</h2>
            <p>
              All prices displayed on the website are listed in Indian Rupees (INR) unless otherwise stated.
            </p>
            <p>
              We reserve the right to modify prices without prior notice.
            </p>

            <h2>Order Acceptance</h2>
            <p>
              ARSHIA SINGH reserves the right to accept, decline, or cancel any order at its discretion, including in cases of pricing errors, stock discrepancies, suspected fraud, or unforeseen circumstances.
            </p>

            <h2>Order Cancellation</h2>
            <p>
              Orders may only be cancelled before production has commenced. Once production has begun, cancellation requests cannot be accommodated.
            </p>

            <h2>Intellectual Property</h2>
            <p>
              All content on this website, including but not limited to photographs, artwork, graphics, designs, logos, text, prints, and product images, is the intellectual property of ARSHIA SINGH and may not be copied, reproduced, distributed, or used without prior written consent.
            </p>

            <h2>Product Care</h2>
            <p>
              Customers are advised to follow the care instructions provided with each garment. ARSHIA SINGH shall not be responsible for damage resulting from improper washing, ironing, storage, or handling after delivery.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              ARSHIA SINGH shall not be liable for any indirect, incidental, consequential, or special damages arising from the use of our products or website.
            </p>

            <h2>Policy Changes</h2>
            <p>
              We reserve the right to update or modify these Terms & Conditions at any time without prior notice.
            </p>

            <h2>Contact Information</h2>
            <p>
              For any questions regarding these Terms & Conditions, please contact:<br />
              Email: <a href="mailto:ordersarshiasingh@gmail.com">ordersarshiasingh@gmail.com</a><br />
              Phone: <a href="tel:+918329672516">+91 8329672516</a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
