import Footer from '../../components/Footer';

export const metadata = {
  title: 'Shipping Policy | ARSHIA SINGH',
  description: 'Shipping Policy for ARSHIA SINGH orders.',
};

export default function ShippingPolicyPage() {
  return (
    <>
      <section className="policy-page">
        <div className="policy-container">
          <span className="policy-label">Policies</span>
          <h1 className="policy-title">Shipping Policy</h1>
          <div className="policy-body">
            <p>
              At ARSHIA SINGH, many of our garments are produced on a made-to-order basis, allowing us to create consciously crafted pieces while minimising waste.
            </p>

            <h2>Production & Delivery Timelines</h2>
            <p>
              The estimated production and delivery timeline for each garment is mentioned on the respective product page.
            </p>
            <p>
              As timelines vary depending on the design, craftsmanship, embroidery, customisation requirements, and production process, customers are advised to review the estimated dispatch and delivery timeline mentioned in the product description before placing an order.
            </p>

            <h2>Order Processing</h2>
            <p>
              Once an order is placed, customers will receive an order confirmation via email.
            </p>
            <p>
              Upon dispatch, tracking details will be shared via email and/or SMS.
            </p>

            <h2>Delivery Delays</h2>
            <p>
              While we strive to meet all estimated timelines, delays may occasionally occur due to circumstances beyond our control, including but not limited to:
            </p>
            <ul style={{ listStyleType: 'none', paddingLeft: '15px', marginBottom: '25px' }}>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Courier partner delays
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Weather conditions
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Public holidays
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Natural disasters
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Government restrictions
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Unforeseen production challenges
              </li>
            </ul>
            <p>
              ARSHIA SINGH shall not be held liable for delays arising from such circumstances.
            </p>

            <h2>Incorrect Shipping Information</h2>
            <p>
              Customers are responsible for ensuring that all shipping and contact details provided at checkout are accurate and complete.
            </p>
            <p>
              ARSHIA SINGH shall not be responsible for delays, failed deliveries, or additional shipping costs arising from incorrect information provided by the customer.
            </p>

            <h2>International Orders</h2>
            <p>
              For international orders, customers are responsible for any customs duties, import taxes, VAT, or additional charges imposed by their local authorities.
            </p>

            <h2>Contact Us</h2>
            <p>
              For any shipping-related queries, please contact:<br />
              Email: <a href="mailto:ordersarshiasingh@gmail.com">ordersarshiasingh@gmail.com</a>
            </p>
            <p>
              <strong>Customer Support Hours:</strong><br />
              Monday to Saturday: 10:00 AM – 19:00 PM IST<br />
              Sunday: 11:00 AM – 14:00 PM IST
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
