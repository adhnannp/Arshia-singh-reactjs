'use client';

export const runtime = "edge";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../components/AuthContext';
import { useWishlist } from '../../../components/WishlistContext';
import { fetchCollectionProducts } from '../../../lib/shopify/queries/products';

// Helper: Normalize Shopify product node
const normalizeProduct = (node, collectionCategory) => {
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
    category: collectionCategory || metafieldMap.category || 'Luxury Edit',
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
      return { sortKey: 'COLLECTION_DEFAULT', reverse: false };
  }
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.category || '';

  const { requireAuth } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Dynamic Shopify Collection State
  const [collectionInfo, setCollectionInfo] = useState({ title: '', description: '', image: null });
  const [productsList, setProductsList] = useState([]);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);  // Layout & Filter States
  const [layoutMode] = useState('studio'); // 'studio' (3-col)
  const [mobileGrid, setMobileGrid] = useState('1col'); // mobile: '1col' | '2col'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCrafts, setSelectedCrafts] = useState([]);
  const [selectedToggles, setSelectedToggles] = useState([]);
  const [sortBy, setSortBy] = useState('default');

  const sentinelRef = useRef(null);

  // Fetch initial collection data and products from Shopify
  const loadInitialProducts = useCallback(async () => {
    if (!slug) return;
    setLoading(true);

    const { sortKey, reverse } = getSortParams(sortBy);
    const res = await fetchCollectionProducts({
      handle: slug,
      first: 20,
      after: null,
      sortKey,
      reverse,
    });

    if (res.collection) {
      setCollectionInfo({
        title: res.collection.title,
        description: res.collection.description,
        image: res.collection.image?.url || null,
      });
    }

    const categoryKey = res.collection?.title || slug;
    const normalized = (res.products || []).map(p => normalizeProduct(p, categoryKey));
    setProductsList(normalized);
    setPageInfo(res.pageInfo || { hasNextPage: false, endCursor: null });
    setLoading(false);
  }, [slug, sortBy]);

  useEffect(() => {
    loadInitialProducts();
  }, [loadInitialProducts]);

  // Load next batch of products for auto-pagination with deduplication
  const loadMoreProducts = useCallback(async () => {
    if (loading || loadingMore || !pageInfo.hasNextPage || !pageInfo.endCursor) return;
    setLoadingMore(true);

    const { sortKey, reverse } = getSortParams(sortBy);
    const res = await fetchCollectionProducts({
      handle: slug,
      first: 20,
      after: pageInfo.endCursor,
      sortKey,
      reverse,
    });

    const categoryKey = collectionInfo.title || slug;
    const normalized = (res.products || []).map(p => normalizeProduct(p, categoryKey));
    setProductsList(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const newUnique = normalized.filter(p => !existingIds.has(p.id));
      return [...prev, ...newUnique];
    });
    setPageInfo(res.pageInfo || { hasNextPage: false, endCursor: null });
    setLoadingMore(false);
  }, [slug, sortBy, collectionInfo.title, pageInfo, loading, loadingMore]);

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

  const toggleFilter = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearAllFilters = () => {
    setSelectedPrices([]);
    setSelectedOccasions([]);
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedCrafts([]);
    setSelectedToggles([]);
    setSortBy('default');
  };

  const activeFiltersCount =
    selectedPrices.length +
    selectedOccasions.length +
    selectedCategories.length +
    selectedColors.length +
    selectedCrafts.length +
    selectedToggles.length;

  const displayTitle = collectionInfo.title || slug.replace(/-/g, ' ').toUpperCase();

  // Color option definitions
  const colorOptions = [
    { label: 'Neutral & Ivory', color: '#f5f2eb' },
    { label: 'Earthy Browns & Terracotta', color: '#8c593b' },
    { label: 'Deep Midnight / Raat Black', color: '#1a1a1a' },
    { label: 'Pastel Blues & Muted Greens', color: '#a3b899' },
    { label: 'Multi / Heritage Print', color: 'linear-gradient(135deg, #d4af37, #c85a32, #2c4a3e)' }
  ];

  // Client-side filter evaluation across all 6 luxury filter categories
  const displayProducts = productsList.filter(product => {
    // 1. Price Range evaluation
    if (selectedPrices.length > 0) {
      const price = product.rawPrice || 0;
      const matchesPrice = selectedPrices.some(range => {
        if (range === 'Under ₹10,000') return price < 10000;
        if (range === '₹10,000 – ₹25,000') return price >= 10000 && price <= 25000;
        if (range === '₹25,000 – ₹50,000') return price >= 25000 && price <= 50000;
        if (range === '₹50,000+') return price > 50000;
        return true;
      });
      if (!matchesPrice) return false;
    }

    // 2. Occasion & Mood
    if (selectedOccasions.length > 0) {
      const text = (product.name + ' ' + product.details + ' ' + product.category).toLowerCase();
      const matchesOccasion = selectedOccasions.some(occ => {
        const key = occ.toLowerCase();
        if (key.includes('resort')) return text.includes('kaftan') || text.includes('shirt') || text.includes('co-ord') || text.includes('print');
        if (key.includes('festive')) return text.includes('phulkari') || text.includes('embroidery') || text.includes('skirt') || text.includes('blazer');
        if (key.includes('cocktail')) return text.includes('jacket') || text.includes('blazer') || text.includes('kaftan') || text.includes('set');
        if (key.includes('everyday')) return text.includes('shirt') || text.includes('top') || text.includes('dhoti') || text.includes('co-ord');
        if (key.includes('office')) return text.includes('blazer') || text.includes('waistcoat') || text.includes('pant') || text.includes('shirt');
        return true;
      });
      if (!matchesOccasion) return false;
    }

    // 3. Silhouette & Category Type
    if (selectedCategories.length > 0) {
      const text = (product.name + ' ' + product.details + ' ' + product.category).toLowerCase();
      const matchesCategory = selectedCategories.some(cat => {
        const key = cat.toLowerCase();
        if (key.includes('co-ord')) return text.includes('co-ord') || text.includes('set');
        if (key.includes('cape')) return text.includes('cape') || text.includes('drape');
        if (key.includes('blazer')) return text.includes('blazer') || text.includes('waistcoat') || text.includes('jacket');
        if (key.includes('shirt')) return text.includes('shirt') || text.includes('top');
        if (key.includes('skirt')) return text.includes('skirt') || text.includes('dhoti') || text.includes('palazzo');
        if (key.includes('kaftan')) return text.includes('kaftan') || text.includes('dress');
        return true;
      });
      if (!matchesCategory) return false;
    }

    // 4. Color Palette Swatches
    if (selectedColors.length > 0) {
      const text = (product.name + ' ' + product.details).toLowerCase();
      const matchesColor = selectedColors.some(col => {
        const key = col.toLowerCase();
        if (key.includes('neutral') || key.includes('ivory')) return text.includes('white') || text.includes('ivory') || text.includes('cream') || text.includes('pastel');
        if (key.includes('earthy') || key.includes('brown') || key.includes('terracotta')) return text.includes('brown') || text.includes('gold') || text.includes('ravel');
        if (key.includes('midnight') || key.includes('black')) return text.includes('raat') || text.includes('black') || text.includes('dark');
        if (key.includes('blue') || key.includes('green')) return text.includes('rangrez') || text.includes('green') || text.includes('blue');
        if (key.includes('multi') || key.includes('print')) return text.includes('print') || text.includes('phulkari') || text.includes('bagh');
        return true;
      });
      if (!matchesColor) return false;
    }

    // 5. Artisanal Craft
    if (selectedCrafts.length > 0) {
      const text = (product.name + ' ' + product.details + ' ' + (product.fabric || '')).toLowerCase();
      const matchesCraft = selectedCrafts.some(craft => {
        const key = craft.toLowerCase();
        if (key.includes('embroidered') || key.includes('phulkari')) return text.includes('phulkari') || text.includes('embroidery');
        if (key.includes('block print') || key.includes('rangrez')) return text.includes('print') || text.includes('rangrez') || text.includes('block');
        if (key.includes('vegan silk')) return text.includes('silk') || text.includes('satin') || text.includes('vegan');
        if (key.includes('solid') || key.includes('minimalist')) return !text.includes('print') && !text.includes('phulkari');
        return true;
      });
      if (!matchesCraft) return false;
    }

    // 6. Availability & Quick Toggles
    if (selectedToggles.length > 0) {
      const matchesToggle = selectedToggles.every(tog => {
        if (tog === 'In Stock Only') return product.availableForSale !== false;
        if (tog === 'Ships Next Day (Ready to Ship)') return product.availableForSale !== false;
        if (tog === 'Custom Order Available') return true;
        return true;
      });
      if (!matchesToggle) return false;
    }

    return true;
  });

  // Animation triggers with GSAP
  useEffect(() => {
    const displayCategoryName = collectionInfo.title || slug.replace(/-/g, ' ').toUpperCase();
    document.title = `${displayCategoryName.toUpperCase()} | ARSHIA SINGH`;

    const { ScrollTrigger } = require('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);
    gsap.config({ force3D: true });

    const tl = gsap.timeline();
    tl.fromTo('.collection-hero-subtitle', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' })
      .fromTo('.collection-hero-title', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }, '-=0.6')
      .fromTo('.collection-hero-desc', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }, '-=0.8');

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
  }, [slug, collectionInfo.title, sortBy, productsList.length]);

  return (
    <>
      {/* ─── TYPOGRAPHIC HERO ─── */}
      <section className="collection-hero">
        <div className="collection-hero-container">
          <div className="collection-hero-content">
            <span className="collection-hero-subtitle">HERITAGE SILHOUETTES</span>
            <h1 className="collection-hero-title">{displayTitle}</h1>
            <p className="collection-hero-desc">
              {collectionInfo.description || 'Consciously handcrafted luxury silhouettes, celebrating age-old artisanal techniques with PETA-approved vegan textiles.'}
            </p>
          </div>
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

            {/* Thin separator — visible only when toggle is showing */}
            <div className="controls-sep" />

            {/* Sort — compact labels in the bar */}
            <div className="sort-select-wrapper">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="default">Featured</option>
                <option value="price-low">Price ↑</option>
                <option value="price-high">Price ↓</option>
                <option value="alphabetical">A – Z</option>
              </select>
            </div>

          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="active-filters-summary">
            {selectedPrices.map(p => (
              <div key={p} className="active-filter-pill">
                <span>{p}</span>
                <button onClick={() => toggleFilter(selectedPrices, setSelectedPrices, p)}>×</button>
              </div>
            ))}
            {selectedOccasions.map(o => (
              <div key={o} className="active-filter-pill">
                <span>{o}</span>
                <button onClick={() => toggleFilter(selectedOccasions, setSelectedOccasions, o)}>×</button>
              </div>
            ))}
            {selectedCategories.map(c => (
              <div key={c} className="active-filter-pill">
                <span>{c}</span>
                <button onClick={() => toggleFilter(selectedCategories, setSelectedCategories, c)}>×</button>
              </div>
            ))}
            {selectedColors.map(col => (
              <div key={col} className="active-filter-pill">
                <span>{col}</span>
                <button onClick={() => toggleFilter(selectedColors, setSelectedColors, col)}>×</button>
              </div>
            ))}
            {selectedCrafts.map(cr => (
              <div key={cr} className="active-filter-pill">
                <span>{cr}</span>
                <button onClick={() => toggleFilter(selectedCrafts, setSelectedCrafts, cr)}>×</button>
              </div>
            ))}
            {selectedToggles.map(t => (
              <div key={t} className="active-filter-pill">
                <span>{t}</span>
                <button onClick={() => toggleFilter(selectedToggles, setSelectedToggles, t)}>×</button>
              </div>
            ))}
            <button className="btn-clear-all" onClick={clearAllFilters}>Clear All</button>
          </div>
        )}
      </div>

      {/* ─── PRODUCTS GRID ─── */}
      <section className="collection-products-section">
        {loading ? (
          <div className="collection-loading-state">
            <div className="spinner"></div>
            <span>Curating Collection...</span>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="collection-empty-state">
            <h3>No Silhouettes Available</h3>
            <p>We couldn&apos;t find any items matching your selected criteria.</p>
            <button className="btn-primary" onClick={clearAllFilters}>Reset Filters</button>
          </div>
        ) : (
          <div className={`collection-products-grid grid-studio${mobileGrid === '2col' ? ' mobile-2col' : ''}`}>
            {displayProducts.map((product) => {
              const isWishlisted = isInWishlist(product.id);
              return (
                <div key={product.id} className="product-card">
                  <div className="product-card-image-wrap">
                    <Link href={`/products/${product.handle}`}>
                      <img src={product.img} alt={product.altText} />
                    </Link>
                    <button
                      className={`card-wishlist-icon ${isWishlisted ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        requireAuth(() => toggleWishlist(product));
                      }}
                      aria-label="Add to Wishlist"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "#b00" : "none"} stroke={isWishlisted ? "#b00" : "#111"} strokeWidth="1.5">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </div>
                  <div className="product-card-info">
                    <div className="product-card-category">{product.category}</div>
                    <h3 className="product-card-name">
                      <Link href={`/products/${product.handle}`}>{product.name}</Link>
                    </h3>
                    <div className="product-card-price">{product.price}</div>
                  </div>
                </div>
              );
            })}
          </div>
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
          <h2>Filter Collection</h2>
          <button className="btn-close-filters" onClick={() => setIsFilterOpen(false)}>×</button>
        </div>
        <div className="filters-body">
          {/* 1. Price Range Tiers */}
          <div className="filter-group">
            <div className="filter-group-title">1. Price Range</div>
            <div className="filter-options">
              {['Under ₹10,000', '₹10,000 – ₹25,000', '₹25,000 – ₹50,000', '₹50,000+'].map(price => (
                <label key={price} className="filter-label">
                  <input
                    type="checkbox"
                    checked={selectedPrices.includes(price)}
                    onChange={() => toggleFilter(selectedPrices, setSelectedPrices, price)}
                  />
                  <span>{price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Occasion & Mood */}
          <div className="filter-group">
            <div className="filter-group-title">2. Occasion & Mood</div>
            <div className="filter-options">
              {[
                'Resort & Vacation',
                'Festive & Wedding Guest',
                'Cocktail & Evening Statement',
                'Everyday Luxe & Casual',
                'Office / Formal Tailoring'
              ].map(occ => (
                <label key={occ} className="filter-label">
                  <input
                    type="checkbox"
                    checked={selectedOccasions.includes(occ)}
                    onChange={() => toggleFilter(selectedOccasions, setSelectedOccasions, occ)}
                  />
                  <span>{occ}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Silhouette & Category Type */}
          <div className="filter-group">
            <div className="filter-group-title">3. Silhouette & Category</div>
            <div className="filter-options">
              {[
                'Co-ord Sets',
                'Capes & Drapes',
                'Blazers & Waistcoats',
                'Shirts & Tops',
                'Skirts & Dhoti Skirts',
                'Kaftans & Dresses'
              ].map(cat => (
                <label key={cat} className="filter-label">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleFilter(selectedCategories, setSelectedCategories, cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Color Palette Swatches */}
          <div className="filter-group">
            <div className="filter-group-title">4. Color Palette</div>
            <div className="color-swatches-grid">
              {colorOptions.map(opt => {
                const isSelected = selectedColors.includes(opt.label);
                return (
                  <div
                    key={opt.label}
                    className={`color-swatch-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleFilter(selectedColors, setSelectedColors, opt.label)}
                  >
                    <span className="color-dot" style={{ background: opt.color }}></span>
                    <span>{opt.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Craft & Heritage Technique */}
          <div className="filter-group">
            <div className="filter-group-title">5. Artisanal Craft</div>
            <div className="filter-options">
              {[
                'Hand Embroidered (Phulkari)',
                'Block Print / Rangrez',
                'Vegan Silk Weave',
                'Solid / Minimalist'
              ].map(craft => (
                <label key={craft} className="filter-label">
                  <input
                    type="checkbox"
                    checked={selectedCrafts.includes(craft)}
                    onChange={() => toggleFilter(selectedCrafts, setSelectedCrafts, craft)}
                  />
                  <span>{craft}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 6. Availability & Sorting */}
          <div className="filter-group">
            <div className="filter-group-title">6. Availability & Sort</div>
            <div className="filter-options" style={{ marginBottom: '20px' }}>
              {[
                'In Stock Only',
                'Ships Next Day (Ready to Ship)',
                'Custom Order Available'
              ].map(tog => (
                <label key={tog} className="filter-label">
                  <input
                    type="checkbox"
                    checked={selectedToggles.includes(tog)}
                    onChange={() => toggleFilter(selectedToggles, setSelectedToggles, tog)}
                  />
                  <span>{tog}</span>
                </label>
              ))}
            </div>
            <div className="filter-group-title" style={{ marginTop: '15px' }}>Sort By</div>
            <div className="sort-select-wrapper" style={{ width: '100%' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
                style={{ width: '100%', padding: '10px' }}
              >
                <option value="default">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="alphabetical">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Controls Bar ── */
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
        .controls-sep {
          display: none;
          width: 1px;
          height: 18px;
          background: #d4d4d4;
          flex-shrink: 0;
        }

        /* ── Grid Toggle (hidden on desktop, shown on mobile) ── */
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

        /* ── Mobile breakpoint ── */
        @media (max-width: 768px) {
          .mobile-grid-toggle {
            display: flex;
          }
          .controls-sep {
            display: block;
          }

          /* 2-column grid */
          .collection-products-grid.mobile-2col {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: clamp(6px, 2vw, 12px) !important;
          }
          .collection-products-grid.mobile-2col .product-card-name {
            font-size: clamp(0.8rem, 3vw, 0.95rem);
            line-height: 1.3;
          }
          .collection-products-grid.mobile-2col .product-card-price {
            font-size: clamp(0.78rem, 2.8vw, 0.9rem);
            font-weight: 600;
          }
          .collection-products-grid.mobile-2col .product-card-category {
            font-size: clamp(0.52rem, 1.6vw, 0.6rem);
            letter-spacing: 0.08em;
            opacity: 0.55;
          }
        }

        /* ── Very small screens (320px) ── */
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
          .mobile-grid-btn {
            width: 26px;
            height: 26px;
          }
          .mobile-grid-btn svg {
            width: 13px;
            height: 13px;
          }
        }
      `}</style>
      <Footer />
    </>
  );
}
