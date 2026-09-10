'use client';

export const runtime = "edge";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '../../../../components/Footer';
import { fetchArticleByHandle } from '../../../../lib/shopify/queries/blogs';

export default function ArticlePage() {
  const params = useParams();
  const handle = params?.id || '';
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!handle) return;

    async function loadArticle() {
      try {
        setLoading(true);
        const data = await fetchArticleByHandle(handle, 'news');
        if (isMounted) {
          setArticle(data);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Error loading article [${handle}]:`, err);
        if (isMounted) setLoading(false);
      }
    }

    loadArticle();
    return () => {
      isMounted = false;
    };
  }, [handle]);

  if (loading) {
    return (
      <>
        <article className="article-page">
          <div className="article-container">
            <Link href="/blogs" className="article-back-link">
              &lt; Back to Journal
            </Link>
            <div style={{ width: '70%', height: '48px', backgroundColor: '#eae7e1', marginBottom: '45px' }}></div>
            <div className="article-meta-grid" style={{ opacity: 0.5 }}>
              <div className="meta-item">
                <span className="meta-label">Published</span>
                <div style={{ width: '100px', height: '14px', backgroundColor: '#eae7e1', marginTop: '6px' }}></div>
              </div>
              <div className="meta-item">
                <span className="meta-label">Written By</span>
                <div style={{ width: '140px', height: '14px', backgroundColor: '#eae7e1', marginTop: '6px' }}></div>
              </div>
            </div>
            <div className="article-hero-image-wrapper" style={{ backgroundColor: '#eae7e1' }}></div>
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
              <div style={{ width: '100%', height: '16px', backgroundColor: '#eae7e1', marginBottom: '14px' }}></div>
              <div style={{ width: '95%', height: '16px', backgroundColor: '#eae7e1', marginBottom: '14px' }}></div>
              <div style={{ width: '90%', height: '16px', backgroundColor: '#eae7e1', marginBottom: '24px' }}></div>
              <div style={{ width: '100%', height: '16px', backgroundColor: '#eae7e1', marginBottom: '14px' }}></div>
            </div>
          </div>
        </article>
        <Footer />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <section className="article-not-found">
          <div className="article-container text-center" style={{ textAlign: 'center' }}>
            <h1 className="article-not-found-title">Article Not Found</h1>
            <p style={{ color: '#777', marginBottom: '30px', fontFamily: 'var(--font-body)' }}>
              The article you are looking for does not exist or may have been moved.
            </p>
            <Link href="/blogs" className="article-back-link" style={{ alignSelf: 'center', display: 'inline-block' }}>
              &lt; Back to Journal
            </Link>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <article className="article-page">
        <div className="article-container">
          <Link href="/blogs" className="article-back-link">
            &lt; Back to Journal
          </Link>

          <h1 className="article-title">{article.title}</h1>

          <div className="article-meta-grid">
            <div className="meta-item">
              <span className="meta-label">Published</span>
              <span className="meta-value">{article.date || 'Editorial'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Written By</span>
              <span className="meta-value">{article.author || 'Arshia Singh Editorial'}</span>
            </div>
            {article.category && (
              <div className="meta-item">
                <span className="meta-label">Category</span>
                <span className="meta-value">{article.category}</span>
              </div>
            )}
          </div>

          {article.image && (
            <div className="article-hero-image-wrapper">
              <img
                src={article.image}
                alt={article.imageAlt || article.title}
                className="article-hero-image"
              />
            </div>
          )}

          {article.contentHtml ? (
            <div
              className="article-content font-body"
              dangerouslySetInnerHTML={{ __html: article.contentHtml }}
            />
          ) : article.content ? (
            <div className="article-content font-body">
              {article.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className={index === 0 ? "article-lead" : "article-paragraph"}>
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </article>
      <Footer />
    </>
  );
}
