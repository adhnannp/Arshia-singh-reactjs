'use client';

export const runtime = "edge";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '../../components/Footer';
import { fetchShopifyArticles } from '../../lib/shopify/queries/blogs';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadArticles() {
      try {
        setLoading(true);
        const articles = await fetchShopifyArticles({ blogHandle: 'news', first: 50 });
        if (isMounted) {
          setPosts(articles || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load blog posts from Shopify:', err);
        if (isMounted) setLoading(false);
      }
    }
    loadArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <div className="blog-page">
        <div className="blog-container">
          <header className="blog-header">
            <span className="blog-label">Journal</span>
            <h1 className="blog-title">The Journal</h1>
          </header>

          {loading ? (
            <div className="blog-rows-container">
              {[1, 2, 3].map((n) => (
                <div key={n} className="blog-row" style={{ opacity: 0.6 }}>
                  <div
                    className="blog-row-img"
                    style={{
                      backgroundColor: '#eae7e1',
                      minHeight: '260px',
                    }}
                  ></div>
                  <div className="blog-row-info">
                    <div style={{ width: '120px', height: '12px', backgroundColor: '#e2ded7', marginBottom: '20px' }}></div>
                    <div style={{ width: '80%', height: '32px', backgroundColor: '#e2ded7', marginBottom: '20px' }}></div>
                    <div style={{ width: '100%', height: '14px', backgroundColor: '#e2ded7', marginBottom: '10px' }}></div>
                    <div style={{ width: '90%', height: '14px', backgroundColor: '#e2ded7', marginBottom: '35px' }}></div>
                    <div style={{ width: '100px', height: '14px', backgroundColor: '#e2ded7' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0', fontFamily: 'var(--font-body)', color: '#777' }}>
              <p style={{ fontSize: '18px', marginBottom: '20px' }}>No stories published yet.</p>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>Check back soon for new journal entries.</p>
            </div>
          ) : (
            <div className="blog-rows-container">
              {posts.map((post) => (
                <Link
                  key={post.id || post.handle}
                  href={`/blogs/news/${post.handle}`}
                  className="blog-row group"
                >
                  <div className="blog-row-img">
                    <img
                      src={post.image || '/assets/placeholder.jpg'}
                      alt={post.imageAlt || post.title}
                      className="row-img"
                    />
                    <div className="row-img-overlay"></div>
                  </div>

                  <div className="blog-row-info">
                    <div className="blog-meta-row">
                      <span className="blog-meta-category">{post.category}</span>
                      {post.date && (
                        <>
                          <span className="blog-meta-dot"></span>
                          <span className="blog-meta-date">{post.date}</span>
                        </>
                      )}
                    </div>

                    <h2 className="row-title">{post.title}</h2>
                    {post.excerpt && <p className="row-excerpt">{post.excerpt}</p>}

                    <span className="blog-row-read-more">
                      Read Article
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
