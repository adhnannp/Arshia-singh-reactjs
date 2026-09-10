'use client';

import { useState } from 'react';

export default function InquiriesClient() {
  const [waHover, setWaHover] = useState(false);
  const [igHover, setIgHover] = useState(false);

  return (
    <div style={{
      width: '100%',
      minHeight: 'calc(100vh - var(--nav-height))',
      background: '#FAFAF8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(48px, 10vw, 96px) clamp(20px, 6vw, 72px)',
      boxSizing: 'border-box',
      overflowX: 'hidden',
      textAlign: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}>

        {/* Eyebrow label */}
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 'clamp(9px, 2vw, 11px)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#a0a0a8',
          marginBottom: '18px',
          display: 'block',
        }}>
          Connect
        </span>

        {/* Decorative line */}
        <div style={{
          width: '32px',
          height: '1px',
          background: '#c4c4c8',
          marginBottom: '26px',
          flexShrink: 0,
        }} />

        {/* Heading */}
        <h1 style={{
          margin: '0 0 clamp(16px, 4vw, 28px)',
          fontSize: 'clamp(2rem, 9vw, 4.6rem)',
          fontWeight: '300',
          fontFamily: 'var(--font-display, Georgia, serif)',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          lineHeight: '0.95',
          color: '#1d1d1f',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}>
          Let&apos;s Create<br />Together
        </h1>

        {/* Description */}
        <p style={{
          margin: '0 0 clamp(32px, 6vw, 52px)',
          fontSize: 'clamp(0.82rem, 2.8vw, 1rem)',
          lineHeight: '1.9',
          color: '#5c5c62',
          fontStyle: 'italic',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          For bespoke orders, custom design inquiries, bridal collections,
          and collaborations — reach out directly via WhatsApp or Instagram.
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          boxSizing: 'border-box',
        }}>

          {/* WhatsApp — Primary solid */}
          <a
            href="https://wa.me/919953275142"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setWaHover(true)}
            onMouseLeave={() => setWaHover(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '11px',
              width: '100%',
              boxSizing: 'border-box',
              padding: 'clamp(14px, 3vw, 17px) 20px',
              background: waHover ? '#2e2e2e' : '#1d1d1f',
              color: '#ffffff',
              border: '1.5px solid #1d1d1f',
              borderRadius: '3px',
              textDecoration: 'none',
              fontSize: 'clamp(0.75rem, 2.4vw, 0.88rem)',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              boxShadow: waHover ? '0 10px 24px rgba(0,0,0,0.2)' : '0 3px 10px rgba(0,0,0,0.08)',
              transform: waHover ? 'translateY(-2px)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <svg style={{ width: '17px', height: '17px', fill: 'currentColor', flexShrink: 0 }} viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.446L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.623-1.023-5.086-2.884-6.948C16.636 2.005 14.193.987 11.599.987c-5.45 0-9.873 4.374-9.877 9.805a9.61 9.61 0 0 0 1.488 5.091l-.98 3.58 3.69-.958zm12.352-7.39c-.322-.16-1.9-1.096-2.222-1.255-.322-.159-.557-.24-.792.112-.236.353-.913 1.155-1.118 1.393-.205.238-.41.266-.732.106-.322-.16-1.36-.503-2.594-1.602-.96-.856-1.607-1.912-1.796-2.23-.19-.317-.02-.49.141-.649.145-.143.322-.374.483-.562.161-.188.215-.322.322-.536.107-.215.053-.403-.027-.563-.08-.16-.792-1.912-1.085-2.616-.285-.685-.572-.593-.792-.604-.204-.01-.439-.012-.674-.012-.235 0-.618.088-.94.439-.322.352-1.23 1.203-1.23 2.933 0 1.73 1.256 3.4 1.433 3.635.176.235 2.472 3.775 5.989 5.29.837.362 1.49.578 2.001.74.84.267 1.606.23 2.21.14.675-.1 2.223-.908 2.535-1.785.312-.877.312-1.63.218-1.786-.093-.157-.343-.252-.665-.412z" />
            </svg>
            <span>WhatsApp Concierge</span>
          </a>

          {/* Instagram — Secondary outlined */}
          <a
            href="https://www.instagram.com/arshia.singh.official"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setIgHover(true)}
            onMouseLeave={() => setIgHover(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '11px',
              width: '100%',
              boxSizing: 'border-box',
              padding: 'clamp(14px, 3vw, 17px) 20px',
              background: igHover ? '#1d1d1f' : 'transparent',
              color: igHover ? '#ffffff' : '#1d1d1f',
              border: '1.5px solid #1d1d1f',
              borderRadius: '3px',
              textDecoration: 'none',
              fontSize: 'clamp(0.75rem, 2.4vw, 0.88rem)',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              boxShadow: igHover ? '0 10px 24px rgba(0,0,0,0.14)' : 'none',
              transform: igHover ? 'translateY(-2px)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <svg style={{ width: '17px', height: '17px', fill: 'currentColor', flexShrink: 0 }} viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
            <span>Instagram Direct</span>
          </a>
        </div>

        {/* Response footnote */}
        <p style={{
          marginTop: 'clamp(24px, 5vw, 40px)',
          fontSize: 'clamp(0.65rem, 1.8vw, 0.72rem)',
          color: '#b0b0b8',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          Response within 24 hours
        </p>

      </div>
    </div>
  );
}
