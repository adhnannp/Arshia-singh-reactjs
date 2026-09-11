import Footer from '../../components/Footer';

export const metadata = {
  title: 'Privacy Policy | ARSHIA SINGH',
  description: 'Privacy Policy for ARSHIA SINGH.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="policy-page">
        <div className="policy-container">
          <span className="policy-label">Policies</span>
          <h1 className="policy-title">Privacy Policy</h1>
          <div className="policy-body">
            <p>
              At ARSHIA SINGH, we value your privacy and are committed to protecting your personal information.
            </p>

            <h2>Information We Collect</h2>
            <p>When you place an order, subscribe to our newsletter, or contact us, we may collect:</p>
            <ul style={{ listStyleType: 'none', paddingLeft: '15px', marginBottom: '25px' }}>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Full name
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Email address
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Phone number
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Billing and shipping address
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Payment information
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Order history
              </li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>Your information may be used to:</p>
            <ul style={{ listStyleType: 'none', paddingLeft: '15px', marginBottom: '25px' }}>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Process and fulfil orders
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Provide customer support
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Share order updates and shipping information
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Improve our products and services
              </li>
              <li style={{ marginBottom: '8px', position: 'relative', paddingLeft: '15px' }}>
                <span style={{ position: 'absolute', left: '0', color: 'var(--color-accent)' }}>•</span>
                Send promotional communications, offers, and updates (where permitted)
              </li>
            </ul>

            <h2>Information Sharing</h2>
            <p>
              We do not sell, rent, or trade your personal information to third parties.
            </p>
            <p>
              Your information may be shared only with trusted service providers involved in operating our business, including payment gateways, logistics partners, and website service providers.
            </p>

            <h2>Data Security</h2>
            <p>
              We take reasonable measures to safeguard your personal information against unauthorised access, misuse, or disclosure.
            </p>

            <h2>Marketing Communications</h2>
            <p>
              You may unsubscribe from promotional emails at any time by using the unsubscribe link provided in our communications or by contacting us directly.
            </p>

            <h2>Policy Updates</h2>
            <p>
              ARSHIA SINGH reserves the right to modify this Privacy Policy at any time. Changes will become effective immediately upon publication on our website.
            </p>

            <h2>Contact Us</h2>
            <p>
              For any questions regarding this Privacy Policy, please contact:<br />
              Email: <a href="mailto:ordersarshiasingh@gmail.com">ordersarshiasingh@gmail.com</a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
