'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from './CartContext';
import { createShopifyCheckout } from '../lib/shopify/mutations/cart';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart, revalidateCartItems, isValidatingCart } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutNotice, setCheckoutNotice] = useState(null);

  // Trigger inventory re-validation whenever cart drawer is opened & check for openCart query param
  useEffect(() => {
    if (isCartOpen) {
      setCheckoutError(null);
      setCheckoutNotice(null);
      setCheckoutLoading(false);
      revalidateCartItems();
    }
  }, [isCartOpen, revalidateCartItems]);

  // Handle pageshow event (e.g. browser back button restoration from BFCache)
  useEffect(() => {
    const handlePageShow = () => {
      setCheckoutLoading(false);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('openCart') === 'true') {
        setIsCartOpen(true);
        params.delete('openCart');
        const newSearch = params.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, [setIsCartOpen]);

  const hasUnavailableItems = cartItems.some((item) => item.isUnavailable || item.availableForSale === false);
  const hasStockAdjustedItems = cartItems.some((item) => Boolean(item.stockNotice));

  const total = cartItems.reduce((acc, item) => {
    // Only sum price for available items
    if (item.isUnavailable || item.availableForSale === false) return acc;
    const priceNum = parseInt(String(item.price || '').replace(/[^0-9]/g, '')) || 0;
    const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
    return acc + (priceNum * qty);
  }, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0 || checkoutLoading) return;

    setCheckoutError(null);
    setCheckoutNotice(null);

    // Filter available vs unavailable products
    const availableItems = cartItems.filter((item) => !item.isUnavailable && item.availableForSale !== false);
    const unavailableItems = cartItems.filter((item) => item.isUnavailable || item.availableForSale === false);

    if (availableItems.length === 0) {
      setCheckoutError('⚠️ All products in your cart are currently unavailable or out of stock.');
      return;
    }

    if (unavailableItems.length > 0) {
      setCheckoutNotice(
        `⚠️ ${unavailableItems.length} item(s) in your cart are unavailable and were excluded from checkout.`
      );
    }

    setCheckoutLoading(true);

    try {
      const { checkoutUrl, error } = await createShopifyCheckout(availableItems);

      if (error) {
        setCheckoutError(`Checkout error: ${error}`);
        setCheckoutLoading(false);
        return;
      }

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        setTimeout(() => setCheckoutLoading(false), 2000);
      } else {
        setCheckoutError('Could not generate Shopify checkout URL. Please try again.');
        setCheckoutLoading(false);
      }
    } catch (err) {
      console.error('[CartDrawer Checkout] Exception during checkout:', err);
      setCheckoutError('An unexpected error occurred. Please try again.');
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h3>Your Collection</h3>
          <button className="cart-drawer-close" onClick={() => setIsCartOpen(false)}>
            &times;
          </button>
        </div>

        {/* Global Unavailable Warning Notice */}
        {hasUnavailableItems && (
          <div className="cart-drawer-notice warning">
            <span>⚠️ Note: Some items in your collection are currently unavailable or out of stock. Unavailable items will be excluded at checkout.</span>
          </div>
        )}

        {/* Global Stock Adjustment Warning Notice */}
        {hasStockAdjustedItems && (
          <div className="cart-drawer-notice warning">
            <span>⚠️ Live Inventory Update: Some item quantities in your collection were automatically adjusted to match currently available stock.</span>
          </div>
        )}

        {checkoutNotice && (
          <div className="cart-drawer-notice info">
            <span>{checkoutNotice}</span>
          </div>
        )}

        {checkoutError && (
          <div className="cart-drawer-notice error">
            <span>{checkoutError}</span>
          </div>
        )}

        <div className="cart-drawer-items">
          {cartItems.length === 0 ? (
            <div className="cart-empty-msg">Your collection is empty.</div>
          ) : (
            cartItems.map((item, index) => {
              const isItemUnavailable = item.isUnavailable || item.availableForSale === false;
              const unitPriceNum = parseInt(String(item.price || '').replace(/[^0-9]/g, '')) || 0;
              const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
              const itemTotal = unitPriceNum * qty;
              const productHandle = item.handle || (item.name ? item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '');
              const productUrl = productHandle ? `/products/${productHandle}` : null;

              return (
                <div className={`cart-item ${isItemUnavailable ? 'unavailable' : ''}`} key={item.id || `${item.handle || item.name}_${item.size}_${index}`}>
                  {productUrl ? (
                    <Link
                      href={productUrl}
                      onClick={() => setIsCartOpen(false)}
                      className="cart-item-img-link"
                      title={`View ${item.name}`}
                    >
                      <img src={item.img} alt={item.name} className="cart-item-img" />
                    </Link>
                  ) : (
                    <img src={item.img} alt={item.name} className="cart-item-img" />
                  )}

                  <div className="cart-item-details">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        {productUrl ? (
                          <Link
                            href={productUrl}
                            onClick={() => setIsCartOpen(false)}
                            className="cart-item-name-link"
                            title={`View ${item.name}`}
                          >
                            <h4 className="cart-item-name">{item.name}</h4>
                          </Link>
                        ) : (
                          <h4 className="cart-item-name">{item.name}</h4>
                        )}
                        {isItemUnavailable && (
                          <span className="cart-item-badge unavailable">
                            {item.unlisted ? 'UNLISTED' : 'OUT OF STOCK'}
                          </span>
                        )}
                      </div>
                      <div className="cart-item-meta">
                        <span>Size: <strong>{item.size}</strong></span>
                        {qty > 1 && <span className="cart-item-qty-badge">x{qty}</span>}
                      </div>
                    </div>

                    <div className="cart-item-price-row">
                      <div className="cart-item-pricing">
                        <span className={`cart-item-price ${isItemUnavailable ? 'line-through opacity-50' : ''}`}>
                          ₹{itemTotal > 0 ? itemTotal.toLocaleString('en-IN') : String(item.price || '0').replace('/-', '').replace('₹', '').trim()}
                        </span>
                        {qty > 1 && unitPriceNum > 0 && (
                          <span className="cart-item-unit-price">
                            (₹{unitPriceNum.toLocaleString('en-IN')} each)
                          </span>
                        )}
                      </div>
                      <div className="cart-item-actions">
                        {qty > 1 && (
                          <div className="cart-qty-stepper">
                            <button
                              type="button"
                              className="cart-qty-btn minus"
                              onClick={() => updateQuantity(index, qty - 1)}
                              title="Decrease quantity"
                            >
                              –
                            </button>
                            <span className="cart-qty-val">Qty: {qty}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          className="cart-item-remove"
                          onClick={() => removeFromCart(index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {item.stockNotice && (
                      <div className="cart-item-stock-notice">
                        ⚠️ {item.stockNotice}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="cart-drawer-footer">
          <div className="cart-total">
            Total: <span className="cart-total-price">₹{total.toLocaleString('en-IN')}</span>
          </div>
          <button
            className={`cart-checkout-btn ${checkoutLoading ? 'loading' : ''}`}
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || checkoutLoading}
          >
            {checkoutLoading ? 'Redirecting to Shopify...' : 'Complete Purchase'}
          </button>
        </div>
      </div>
      <div className={`cart-overlay-bg ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
    </>
  );
}
