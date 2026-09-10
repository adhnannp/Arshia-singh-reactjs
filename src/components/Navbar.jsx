'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useWishlist } from './WishlistContext';
import gsap from 'gsap';
import { fetchShopifyCollections } from '../lib/shopify/queries/collections';

const WOMEN_HANDLES = ['matching-moods', 'flow-state', 'power-layers', 'six-yards-of-good'];
const MEN_HANDLES = ['natural-luxury', 'printed-stories', 'modern-classics'];

const CONNECT_LINKS = [
  { label: 'Discover', href: '/discover', external: false },
  { label: 'Blog', href: '/blogs', external: false },
  { label: 'Our Story', href: '/story', external: false },
  { label: 'Get in touch', href: '/inquiries', external: false },
  { label: 'Instagram', href: 'https://www.instagram.com/arshia.singh.official?igsh=bWN5cXd1M2txNmsx', external: true },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const { cartItems, setIsCartOpen } = useCart();
  const { user, logout, setLoginModalOpen, setModalView } = useAuth();
  const { wishlistItems, moveToCart, toggleWishlist } = useWishlist();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const overlayRef = useRef(null);

  // Dynamic collections API integration (100% dynamic, no static link fallbacks)
  const [womenLinks, setWomenLinks] = useState([]);
  const [menLinks, setMenLinks] = useState([]);
  const [madeForMomentsHref, setMadeForMomentsHref] = useState('/collections/custom-made-for-moments');

  useEffect(() => {
    async function loadCollections() {
      try {
        const nodes = await fetchShopifyCollections();
        if (nodes && nodes.length > 0) {
          const fetchedWomen = [];
          const fetchedMen = [];
          let customMomentsLink = '/collections/custom-made-for-moments';

          nodes.forEach((node) => {
            const metafieldVal = node.metafield?.value?.trim()?.toLowerCase() || '';
            const handle = node.handle?.toLowerCase() || '';
            const title = node.title?.toLowerCase() || '';
            const item = {
              label: node.title,
              href: `/collections/${node.handle}`,
              img: node.image?.url || '/assets/new_coll_3.png',
            };

            if (handle === 'custom-made-for-moments' || title.includes('custom made')) {
              customMomentsLink = `/collections/${node.handle}`;
            } else if (metafieldVal === 'women' || WOMEN_HANDLES.includes(handle)) {
              fetchedWomen.push(item);
            } else if (metafieldVal === 'men' || MEN_HANDLES.includes(handle)) {
              fetchedMen.push(item);
            }
          });

          setWomenLinks(fetchedWomen);
          setMenLinks(fetchedMen);
          setMadeForMomentsHref(customMomentsLink);
        }
      } catch (err) {
        console.error('Error loading collections from Shopify API:', err);
      }
    }
    loadCollections();
  }, []);

  // Live clock
  useEffect(() => {
    const tick = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Animate menu open/close
  useEffect(() => {
    if (!overlayRef.current) return;
    if (menuOpen) {
      gsap.set('.nav-section-title, .nav-section-links li a, .connect-links li a, .karigar-title a', { opacity: 0, y: 30 });
      gsap.to('.nav-section-title', { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'power3.out', delay: 0.25 });
      gsap.to('.nav-section-links li a, .connect-links li a, .karigar-title a', { y: 0, opacity: 1, duration: 1.0, stagger: 0.02, ease: 'power4.out', delay: 0.35 });
    }
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* NAVIGATION BAR */}
      <nav className="nav">
        <div className="nav-left">
          <Link href="/" className="logo">
            <img src="/assets/logo2.png" alt="Arshia Singh Logo" className="brand-logo" />
          </Link>
        </div>
        <div className="nav-links">
          <Link href="/story" className="nav-link-item">Our Story</Link>
          <Link href="/blogs" className="nav-link-item">Blog</Link>
          <Link href="/discover" className="nav-link-item">Discover</Link>
        </div>
        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* PROFILE BUTTON & POPUP */}
          <div className="profile-container">
            <button
              className="profile-toggle"
              onClick={() => {
                if (user) {
                  setModalView('profile');
                  setLoginModalOpen(true);
                } else {
                  setModalView('login');
                  setLoginModalOpen(true);
                }
              }}
              aria-label="Profile"
            >
              {user ? (
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#111',
                  color: '#FAF9F6',
                  fontSize: '11px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="profile-icon-svg" style={{ display: 'block' }}>
                  <path d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21M12 12C9.79086 12 8 10.2091 8 8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8C16 10.2091 14.2091 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {user && profileDropdownOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <img src={user.avatar} alt={user.name} className="dropdown-avatar" />
                  <div className="dropdown-user-info">
                    <span className="dropdown-user-name">{user.name}</span>
                    <span className="dropdown-user-email">{user.email}</span>
                  </div>
                </div>

                <div className="profile-dropdown-wishlist">
                  <span className="wishlist-header">Wishlist ({wishlistItems.length})</span>
                  {wishlistItems.length === 0 ? (
                    <p className="wishlist-empty-text">Your wishlist is empty</p>
                  ) : (
                    <ul className="dropdown-wishlist-list">
                      {wishlistItems.map((item) => (
                        <li key={item.name} className="dropdown-wishlist-item">
                          <img src={item.img} alt={item.name} className="wishlist-item-img" />
                          <div className="wishlist-item-details">
                            <span className="wishlist-item-name">{item.name}</span>
                            <span className="wishlist-item-price">₹{item.price}</span>
                          </div>
                          <div className="wishlist-item-actions">
                            <button className="wishlist-item-add" onClick={() => moveToCart(item)} title="Add to Cart">
                              +
                            </button>
                            <button className="wishlist-item-remove" onClick={() => toggleWishlist(item)} title="Remove">
                              &times;
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  className="logout-btn"
                  onClick={() => {
                    logout();
                    setProfileDropdownOpen(false);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            className="cart-toggle"
            onClick={() => setIsCartOpen(true)}
          >
            CART{cartItems.reduce((acc, item) => acc + (typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1), 0) > 0 && (
              <span className="cart-count-badge">
                {cartItems.reduce((acc, item) => acc + (typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1), 0)}
              </span>
            )}
          </button>
          <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open Menu">
            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="menu-icon-svg">
              <path d="M1.5 2H20.5M1.5 7H20.5M1.5 12H20.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </nav>

      {/* FULLSCREEN MENU OVERLAY */}
      <div ref={overlayRef} className={`menu-overlay ${menuOpen ? 'open' : ''}`}>
        <div className="menu-close-btn" onClick={closeMenu}>&times;</div>
        <div className="menu-container">
          <div className="menu-visual-showcase">
            <div className="showcase-img-wrapper">
              <img src="/assets/new_coll_3.png" alt="Editorial Showcase" id="menu-showcase-img" className="showcase-img" />
            </div>
          </div>

          <div className="menu-navigation-grid">
            {/* Women */}
            <div className="nav-section">
              <span className="nav-section-num">01</span>
              <span className="nav-section-title">Women</span>
              <ul className="nav-section-links">
                {womenLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} data-img={link.img} onClick={closeMenu}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Men */}
            <div className="nav-section">
              <span className="nav-section-num">02</span>
              <span className="nav-section-title">Men</span>
              <ul className="nav-section-links">
                {menLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} data-img={link.img} onClick={closeMenu}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Explore & Connect */}
            <div className="nav-section connect-section">
              <span className="nav-section-num">03</span>
              <span className="nav-section-title">Explore & Connect</span>
              <ul className="nav-section-links connect-links">
                {CONNECT_LINKS.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} onClick={closeMenu}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ornate Buttons Section - Cleanly positioned between grid and footer */}
          <div className="karigar-section-custom">
            <span className="nav-section-title karigar-title karigar-title-custom">
              <Link href="/karigar-of-as" onClick={closeMenu}>Karigar of AS</Link>
            </span>
            <span className="nav-section-title karigar-title karigar-title-custom">
              <Link href={madeForMomentsHref} onClick={closeMenu}>Made for Moments</Link>
            </span>
            <style>{`
              .karigar-section-custom {
                display: flex !important;
                flex-direction: row !important;
                justify-content: center !important;
                align-items: center !important;
                gap: 20px 30px !important;
                flex-wrap: wrap !important;
                width: 100% !important;
                margin: 20px 0 !important;
              }
              .karigar-title-custom {
                display: inline-block !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
              }
              .karigar-title-custom a {
                font-size: 1.3rem !important;
                padding: 12px 30px !important;
                letter-spacing: 0.1em !important;
                opacity: 1 !important;
                color: #ffffff !important;
              }
              @media (max-width: 768px) {
                .karigar-section-custom {
                  flex-direction: column !important;
                  gap: 15px !important;
                }
                .karigar-title-custom a {
                  font-size: 1.05rem !important;
                  padding: 10px 20px !important;
                }
              }
            `}</style>
          </div>

          {/* Menu Footer */}
          <div className="menu-footer-info">
            <div className="m-footer-left">ARSHIA SINGH © 2026 / CONSCIOUS LUXURY</div>
            <div className="m-footer-links">
              <Link href="/shipping-policy" onClick={closeMenu}>Shipping Policy</Link>
              <Link href="/privacy-policy" onClick={closeMenu}>Privacy Policy</Link>
              <Link href="/exchange-policy" onClick={closeMenu}>Exchange Policy</Link>
              <Link href="/returns-and-refunds" onClick={closeMenu}>Returns and Refunds</Link>
              <Link href="/terms-and-conditions" onClick={closeMenu}>Terms &amp; Conditions</Link>
            </div>
            <div className="m-footer-right">LOCAL TIME <span className="menu-local-time">{currentTime}</span></div>
          </div>
        </div>
      </div>
    </>
  );
}

