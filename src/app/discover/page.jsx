'use client';

export const runtime = "edge";
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import Footer from '../../components/Footer';
import { useAuth } from '../../components/AuthContext';
import { useWishlist } from '../../components/WishlistContext';
import { fetchShopifyProducts } from '../../lib/shopify/queries/products';
import { fetchShopifyCollections } from '../../lib/shopify/queries/collections';

// Helper: Normalize Shopify product node
const normalizeDiscoverProduct = (node) => {
  const metafieldMap = {};
  if (Array.isArray(node.metafields)) {
    node.metafields.forEach(m => {
      if (m && m.key) {
        metafieldMap[m.key] = m.value;
      }
    });
  }

  const rawPrice = parseFloat(node.priceRange?.minVariantPrice?.amount || '0');
  const formattedPrice = rawPrice > 0
    ? `₹${Math.round(rawPrice).toLocaleString('en-IN')}`
    : 'Price on Request';

  const categoryKey = (metafieldMap.category || '').toLowerCase();

  return {
    id: node.id,
    name: node.title,
    title: node.title,
    handle: node.handle,
    price: formattedPrice,
    rawPrice: rawPrice,
    img: node.featuredImage?.url || '/assets/placeholder.jpg',
    altText: node.featuredImage?.altText || node.title,
    availableForSale: node.availableForSale,
    fabric: metafieldMap.fabric || '',
    components: metafieldMap.components || '',
    category: categoryKey,
    category2: metafieldMap.category2 || '',
    details: node.description || '',
    is_couple_set:
      metafieldMap.is_couple_set === true ||
      metafieldMap.is_couple_set === 'true' ||
      metafieldMap.is_couple_set === '1' ||
      metafieldMap.is_couple_set === 'yes' ||
      (typeof metafieldMap.is_couple_set === 'string' && metafieldMap.is_couple_set.toLowerCase() === 'true'),
    tags: Array.isArray(node.tags) ? node.tags : [],
    metafields: metafieldMap,
  };
};

// Helper: Map sort selection to Storefront API parameters
const getSortParams = (sortBy) => {
  switch (sortBy) {
    case 'price-low':
      return { sortKey: 'PRICE', reverse: false };
    case 'price-high':
      return { sortKey: 'PRICE', reverse: true };
    case 'alphabetical':
      return { sortKey: 'TITLE', reverse: false };
    case 'default':
    default:
      return { sortKey: 'RELEVANCE', reverse: false };
  }
};

export default function DiscoverPage() {
  const { requireAuth } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Dynamic Collections & Products States
  const [collectionsList, setCollectionsList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Search & Debounce States
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Layout & Filter States
  const [layoutMode] = useState('studio'); // 'studio' (3-col)
  const [mobileGrid, setMobileGrid] = useState('1col'); // mobile: '1col' | '2col'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [sortBy, setSortBy] = useState('default');

  const sentinelRef = useRef(null);

  // Fetch collections list dynamically from Shopify API
  useEffect(() => {
    fetchShopifyCollections().then(nodes => {
      setCollectionsList(nodes || []);
    });
  }, []);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch initial batch of products when debouncedSearchQuery or sortBy changes
  const loadInitialProducts = useCallback(async () => {
    setLoading(true);
    const { sortKey, reverse } = getSortParams(sortBy);
    const res = await fetchShopifyProducts({
      query: debouncedSearchQuery,
      first: 250,
      after: null,
      sortKey,
      reverse,
    });

    const normalized = (res.products || []).map(normalizeDiscoverProduct);
    setProductsList(normalized);
    setPageInfo(res.pageInfo || { hasNextPage: false, endCursor: null });
    setLoading(false);
  }, [debouncedSearchQuery, sortBy]);

  useEffect(() => {
    loadInitialProducts();
  }, [loadInitialProducts]);

  // Load next batch of products for auto-pagination with deduplication
  const loadMoreProducts = useCallback(async () => {
    if (loading || loadingMore || !pageInfo.hasNextPage || !pageInfo.endCursor) return;
    setLoadingMore(true);

    const { sortKey, reverse } = getSortParams(sortBy);
    const res = await fetchShopifyProducts({
      query: debouncedSearchQuery,
      first: 250,
      after: pageInfo.endCursor,
      sortKey,
      reverse,
    });

    const normalized = (res.products || []).map(normalizeDiscoverProduct);
    setProductsList(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const newUnique = normalized.filter(p => !existingIds.has(p.id));
      return [...prev, ...newUnique];
    });
    setPageInfo(res.pageInfo || { hasNextPage: false, endCursor: null });
    setLoadingMore(false);
  }, [debouncedSearchQuery, sortBy, pageInfo, loading, loadingMore]);

  // Intersection Observer for endless scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pageInfo.hasNextPage && !loading && !loadingMore) {
          loadMoreProducts();
        }
      },
      { rootMargin: '300px' }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [pageInfo.hasNextPage, loading, loadingMore, loadMoreProducts]);

  // Helper to determine gender section for product
  const isMensProduct = (p) => {
    const cat = (p.category || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    return cat.includes('natural luxury') || cat.includes('printed stories') || cat.includes('modern classics') || cat.includes('men') || cat.includes('him') || title.includes('groom') || title.includes('men');
  };

  // Dynamically extract option lists from fetched products for filters
  const fabricsList = Array.from(new Set(productsList.map(p => p.fabric?.trim()).filter(Boolean))).sort();
  const componentsList = Array.from(new Set(productsList.map(p => p.components?.trim()).filter(Boolean))).sort();

  // Client-side filter application for Gender, Category, Fabric, Pieces
  const displayProducts = productsList.filter(product => {
    // Gender / Section

    // Gender / Section
    if (selectedGenders.length > 0) {
      const section = isMensProduct(product) ? 'men' : 'women';
      if (!selectedGenders.includes(section)) return false;
    }

    // Category / Collection
    if (selectedCategories.length > 0) {
      const prodCat = product.category.toLowerCase();
      const matchesCategory = selectedCategories.some(selectedCat => {
        const s = selectedCat.toLowerCase();
        return prodCat.includes(s) || s.includes(prodCat);
      });
      if (!matchesCategory) return false;
    }

    // Fabric
    if (selectedFabrics.length > 0 && !selectedFabrics.includes(product.fabric?.trim())) return false;

    // Garment Pieces (Components)
    if (selectedComponents.length > 0 && !selectedComponents.includes(product.components?.trim())) return false;

    return true;
  });

  // Animation triggers with GSAP
  useEffect(() => {
    document.title = "DISCOVER SILHOUETTES | ARSHIA SINGH";

    const { ScrollTrigger } = require('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);
    gsap.config({ force3D: true });

    // Entrance animation for hero elements
    const tl = gsap.timeline();
    tl.fromTo('.discover-hero-subtitle', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
      .fromTo('.discover-hero-title', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }, '-=0.6')
      .fromTo('.discover-hero-desc', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }, '-=0.8')
      .fromTo('.search-input-container', { scale: 0.98, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.0, ease: 'power3.out' }, '-=0.8');

    // Staggered load for product cards
    const cards = document.querySelectorAll('.product-card');
    if (cards.length > 0) {
      gsap.fromTo(cards,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.collection-products-grid',
            start: 'top 95%',
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [selectedGenders, selectedCategories, selectedFabrics, selectedComponents, sortBy, productsList.length]);

  const toggleFilter = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearAllFilters = () => {
    setSelectedGenders([]);
    setSelectedCategories([]);
    setSelectedFabrics([]);
    setSelectedComponents([]);
    setSortBy('default');
    setSearchInput('');
  };

  const activeFiltersCount =
    selectedGenders.length +
    selectedCategories.length +
    selectedFabrics.length +
    selectedComponents.length +
    (searchInput ? 1 : 0);

  return (
    <>
      {/* ─── TYPOGRAPHIC DISCOVER HERO ─── */}
      <section className="collection-hero" style={{ background: '#FAF9F6' }}>
        <div className="collection-hero-container">
          <div className="collection-hero-content">
            <span className="collection-hero-subtitle discover-hero-subtitle">THE FULL ARCHIVE</span>
            <h1 className="collection-hero-title discover-hero-title">DISCOVER</h1>
            <p className="collection-hero-desc discover-hero-desc">
              Explore our complete collections of luxury conscious silhouettes for men and women. Meticulously handcrafted using vegan, PETA-approved textiles, honoring age-old heritage craftsmanship.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SEARCH SECTION ─── */}
      <section className="discover-search-section" style={{ padding: '0 clamp(16px, 5vw, 48px)', background: '#fff', marginTop: '-30px', marginBottom: '30px', boxSizing: 'border-box', width: '100%', overflowX: 'hidden' }}>
        <div className="search-input-container" style={{ position: 'relative', maxWidth: '600px', margin: '0 auto', zIndex: 10, width: '100%', boxSizing: 'border-box' }}>
          <input
            type="text"
            placeholder="SEARCH SILHOUETTES, FABRICS, OR PRINTS..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px 16px 50px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              borderRadius: '40px',
              outline: 'none',
              background: '#FAF9F6',
              color: '#111',
              transition: 'border-color 0.3s, box-shadow 0.3s'
            }}
            className="search-input-field"
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#888'
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#888',
                lineHeight: 1
              }}
            >
              &times;
            </button>
          )}
        </div>
      </section>

      {/* ─── DYNAMIC UTILITY CONTROLS BAR ─── */}
      <div className="collection-controls-bar">
        <div className="controls-top-row">

          {/* LEFT: Filters button */}
          <button className="btn-filter-trigger" onClick={() => setIsFilterOpen(true)}>
            <span>Filters</span>
            {activeFiltersCount > 0 ? (
              <span className="filter-count">{activeFiltersCount}</span>
            ) : (
              <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                <path d="M1 2.5H13M3.5 6H10.5M5.5 9.5H8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            )}
          </button>

          {/* RIGHT: grid toggle + sort grouped */}
          <div className="controls-right">

            {/* Mobile-only grid view toggle */}
            <div className="mobile-grid-toggle">
              <button
                className={`mobile-grid-btn${mobileGrid === '1col' ? ' active' : ''}`}
                onClick={() => setMobileGrid('1col')}
                aria-label="Single column view"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="12" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="2" y="9" width="12" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
              <button
                className={`mobile-grid-btn${mobileGrid === '2col' ? ' active' : ''}`}
                onClick={() => setMobileGrid('2col')}
                aria-label="Two column grid view"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
            </div>

            <div className="controls-sep" />

            <div className="sort-select-wrapper">
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Featured</option>
                <option value="price-low">Price ↑</option>
                <option value="price-high">Price ↓</option>
                <option value="alphabetical">A – Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active filter pills — below the top row */}
        {activeFiltersCount > 0 && (
          <div className="active-filters-summary">
            {searchInput && (
              <div className="active-filter-pill">
                <span>Search: &quot;{searchInput}&quot;</span>
                <button onClick={() => setSearchInput('')}>×</button>
              </div>
            )}
            {selectedGenders.map(g => (
              <div key={g} className="active-filter-pill">
                <span>{g === 'women' ? 'Womens wear' : 'Mens wear'}</span>
                <button onClick={() => toggleFilter(selectedGenders, setSelectedGenders, g)}>×</button>
              </div>
            ))}
            {selectedCategories.map(c => (
              <div key={c} className="active-filter-pill">
                <span>{c}</span>
                <button onClick={() => toggleFilter(selectedCategories, setSelectedCategories, c)}>×</button>
              </div>
            ))}
            {selectedFabrics.map(f => (
              <div key={f} className="active-filter-pill">
                <span>{f}</span>
                <button onClick={() => toggleFilter(selectedFabrics, setSelectedFabrics, f)}>×</button>
              </div>
            ))}
            {selectedComponents.map(c => (
              <div key={c} className="active-filter-pill">
                <span>{c} Components</span>
                <button onClick={() => toggleFilter(selectedComponents, setSelectedComponents, c)}>×</button>
              </div>
            ))}
            <button className="btn-clear-all" onClick={clearAllFilters}>Clear All</button>
          </div>
        )}
      </div>

      {/* ─── PRODUCT GRID ─── */}
      <section className={`collection-products-grid grid-${layoutMode}${mobileGrid === '2col' ? ' mobile-2col' : ''}`}>
        {loading ? (
          <div className="collection-loading-state" style={{ gridColumn: '1 / -1', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', padding: '100px 0', fontSize: '13px', color: '#666' }}>
            Searching Archive...
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="collection-empty" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
            <p style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
              No silhouettes match your current search or filter selections.
            </p>
            <button className="btn-primary" onClick={clearAllFilters} style={{ padding: '12px 24px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              Reset Filters
            </button>
          </div>
        ) : (
          displayProducts.map((product, idx) => (
            <Link
              href={`/products/${product.handle}`}
              key={product.id ? `${product.id}-${idx}` : `${product.handle}-${idx}`}
              className="product-card"
            >
              <div className="product-card-image-wrap">
                <img src={product.img} alt={product.altText || product.name} loading="lazy" />
                <div className="product-card-overlay">
                  <span className="btn-card-quick-view">
                    View Silhouette
                  </span>
                </div>
              </div>
              <div className="product-card-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 className="product-card-name" style={{ margin: 0 }}>{product.name.toUpperCase()}</h3>
                  <button
                    className={`wishlist-heart-btn ${isInWishlist(product.name) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      requireAuth(() => {
                        toggleWishlist(product);
                      });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isInWishlist(product.name) ? '#b00' : 'inherit',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist(product.name) ? '#b00' : 'none'} stroke={isInWishlist(product.name) ? '#b00' : 'currentColor'} strokeWidth="2">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>
                <div className="product-card-price">{product.price}</div>
              </div>
            </Link>
          ))
        )}
      </section>

      {/* ─── ENDLESS SCROLL SENTINEL & AUTO-PAGINATION LOADER ─── */}
      <div ref={sentinelRef} style={{ height: '20px', margin: '20px 0' }} />
      {loadingMore && (
        <div style={{ textAlign: 'center', padding: '20px 0', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '11px', color: '#888' }}>
          Loading More Silhouettes...
        </div>
      )}

      {/* ─── LUXURY FILTERS SIDE DRAWER ─── */}
      <div className={`drawer-backdrop ${isFilterOpen ? 'show' : ''}`} onClick={() => setIsFilterOpen(false)}></div>
      <div className={`filters-drawer ${isFilterOpen ? 'open' : ''}`}>
        <div className="filters-header">
          <h2>Filter Archive</h2>
          <button className="btn-close-filters" onClick={() => setIsFilterOpen(false)}>×</button>
        </div>
        <div className="filters-body">
          {/* Gender Filter */}
          <div className="filter-group">
            <div className="filter-group-title">Gender / Section</div>
            <div className="filter-options">
              <label className="filter-label">
                <input
                  type="checkbox"
                  checked={selectedGenders.includes('women')}
                  onChange={() => toggleFilter(selectedGenders, setSelectedGenders, 'women')}
                />
                <span>Womens wear</span>
              </label>
              <label className="filter-label">
                <input
                  type="checkbox"
                  checked={selectedGenders.includes('men')}
                  onChange={() => toggleFilter(selectedGenders, setSelectedGenders, 'men')}
                />
                <span>Mens wear</span>
              </label>
            </div>
          </div>

          {/* Dynamic Collection Categories Filter from Shopify API */}
          {collectionsList.length > 0 && (
            <div className="filter-group">
              <div className="filter-group-title">Collections</div>
              <div className="filter-options">
                {collectionsList.map(col => {
                  const colTitle = col.title || '';
                  const colKey = colTitle.toLowerCase();
                  return (
                    <label key={col.id || col.handle} className="filter-label">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(colKey)}
                        onChange={() => toggleFilter(selectedCategories, setSelectedCategories, colKey)}
                      />
                      <span>{colTitle}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fabrics Filter */}
          {fabricsList.length > 0 && (
            <div className="filter-group">
              <div className="filter-group-title">Fabrics</div>
              <div className="filter-options">
                {fabricsList.map(fabric => (
                  <label key={fabric} className="filter-label">
                    <input
                      type="checkbox"
                      checked={selectedFabrics.includes(fabric)}
                      onChange={() => toggleFilter(selectedFabrics, setSelectedFabrics, fabric)}
                    />
                    <span>{fabric}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Components Filter */}
          {componentsList.length > 0 && (
            <div className="filter-group">
              <div className="filter-group-title">Garment Pieces</div>
              <div className="filter-options">
                {componentsList.map(comp => (
                  <label key={comp} className="filter-label">
                    <input
                      type="checkbox"
                      checked={selectedComponents.includes(comp)}
                      onChange={() => toggleFilter(selectedComponents, setSelectedComponents, comp)}
                    />
                    <span>{comp} Piece set</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* ── Controls bar layout ── */
        .collection-controls-bar {
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }
        .controls-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
          flex-wrap: nowrap;
          overflow: hidden;
        }
        .controls-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        /* ── Grid toggle buttons ── */
        .mobile-grid-toggle {
          display: none;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
        }
        .mobile-grid-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border: 1px solid #d4d4d4;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          color: #999;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
          flex-shrink: 0;
          padding: 0;
        }
        .mobile-grid-btn.active {
          border-color: #1d1d1f;
          color: #1d1d1f;
          background: #f0f0f0;
        }
        .controls-sep {
          display: none;
          width: 1px;
          height: 18px;
          background: #d4d4d4;
          flex-shrink: 0;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .mobile-grid-toggle { display: flex; }
          .controls-sep { display: block; }
          .collection-products-grid.mobile-2col {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: clamp(6px, 2vw, 12px) !important;
          }
          .collection-products-grid.mobile-2col .product-card-name {
            font-size: clamp(0.72rem, 2.6vw, 0.88rem);
            line-height: 1.3;
          }
          .collection-products-grid.mobile-2col .product-card-price {
            font-size: clamp(0.7rem, 2.4vw, 0.85rem);
            font-weight: 600;
          }
        }

        /* ── Very small screens ── */
        @media (max-width: 380px) {
          .btn-filter-trigger {
            padding: 7px 10px !important;
            font-size: 10px !important;
            gap: 5px !important;
          }
          .sort-select {
            font-size: 10px !important;
            padding: 7px 20px 7px 8px !important;
          }
          .mobile-grid-btn { width: 26px; height: 26px; }
          .mobile-grid-btn svg { width: 13px; height: 13px; }
        }
      `}</style>
      <Footer />
    </>
  );
}
