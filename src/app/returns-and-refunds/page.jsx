import Footer from '../../components/Footer';

export const metadata = {
  title: 'Alteration, Exchange & Refund Policy | ARSHIA SINGH',
  description: 'Alteration, Exchange & Refund Policy for ARSHIA SINGH garments.',
};

export default function AlterationExchangeRefundPolicyPage() {
  return (
    <>
      <section className="policy-page">
        <div className="policy-container">
          <span className="policy-label">Policies</span>
          <h1 className="policy-title">Alteration, Exchange & Refund Policy</h1>
          <div className="policy-body">
            <p>
              At ARSHIA SINGH, every garment is thoughtfully crafted with care, attention to detail, and a commitment to conscious luxury. As most of our products are made-to-order, we encourage customers to carefully review product descriptions, size guides, and measurements before placing an order.
            </p>

            <h2>Alterations</h2>
            <p>
              If the fit of your garment requires minor adjustments, we are happy to assist with alterations.
            </p>
            <p>
              Customers must notify us within 14 days of delivery by emailing <a href="mailto:ordersarshiasingh@gmail.com
">ordersarshiasingh@gmail.com
</a> with their order number and details of the required alteration.
            </p>
            <p>To be eligible for alterations:</p>
            <ul style={{ listStyleType: 'none', paddingLeft: '15px', marginBottom: '25px' }}>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                The garment must be unused, unworn, and unwashed.
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                All original tags must remain attached.
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                The alteration request must be raised within 14 days of delivery.
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                The garment must be returned in its original condition.
              </li>
            </ul>
            <p>
              Once received, our team will assess the requested alteration and confirm the feasibility of the changes.
            </p>
            <p>
              Customers are responsible for shipping the garment back to our studio. ARSHIA SINGH will bear the cost of shipping the altered garment back to the customer.
            </p>
            <p>
              Please note that substantial design changes, style modifications, or requests that differ from the original order may not be accommodated.
            </p>

            <h2>Exchanges</h2>
            <p>
              As all garments are produced on demand, we do not offer exchanges for sizing, fit preferences, change of mind, or personal preference.
            </p>
            <p>Exchanges may only be considered in the following circumstances:</p>
            <ul style={{ listStyleType: 'none', paddingLeft: '15px', marginBottom: '25px' }}>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                A defective product has been received.
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                An incorrect product has been delivered.
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                The product received materially differs from the item ordered.
              </li>
            </ul>
            <p>
              Any approved exchange request will be subject to product availability.
            </p>

            <h2>No Refund Policy</h2>
            <p>
              As all ARSHIA SINGH garments are produced on demand, we do not offer refunds under any circumstances.
            </p>
            <p>
              In the event that a product is found to be defective, damaged, incorrect, or materially different from the order placed, ARSHIA SINGH reserves the right to provide an alteration, repair, replacement, exchange, or store credit at its sole discretion.
            </p>

            <h2>Made-to-Order Acknowledgement</h2>
            <p>
              By placing an order with ARSHIA SINGH, the customer acknowledges and agrees that most garments are produced on a made-to-order basis specifically for them. As production begins after an order is placed, orders are not eligible for refunds, and customers are encouraged to carefully review all product details, measurements, and specifications before completing their purchase.
            </p>

            <h2>Sale, Customised & Made-to-Measure Orders</h2>
            <p>
              All discounted, promotional, customised, altered, personalised, and made-to-measure garments are final sale and are not eligible for exchange or refund.
            </p>

            <h2>Colour Disclaimer</h2>
            <p>
              We make every effort to display product colours as accurately as possible. However, colours may vary slightly due to differences in screen displays, device settings, and lighting conditions.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
