import client from '../client';

export const GET_BLOG_ARTICLES_QUERY = `#graphql
  query GetBlogArticles($blogHandle: String = "news", $first: Int = 50) {
    blog(handle: $blogHandle) {
      id
      title
      handle
      articles(first: $first, reverse: true, sortKey: PUBLISHED_AT) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          title
          handle
          excerpt
          excerptHtml
          content
          contentHtml
          publishedAt
          tags
          authorV2 {
            name
          }
          image {
            url
            altText
            width
            height
          }
          blog {
            handle
            title
          }
        }
      }
    }
  }
`;

export const GET_ARTICLE_BY_HANDLE_QUERY = `#graphql
  query GetArticleByHandle($blogHandle: String = "news", $handle: String!) {
    blog(handle: $blogHandle) {
      id
      title
      handle
      articleByHandle(handle: $handle) {
        id
        title
        handle
        excerpt
        excerptHtml
        content
        contentHtml
        publishedAt
        tags
        authorV2 {
          name
        }
        image {
          url
          altText
          width
          height
        }
        blog {
          handle
          title
        }
        seo {
          title
          description
        }
      }
    }
  }
`;

export const GET_ALL_ARTICLES_QUERY = `#graphql
  query GetAllArticles($first: Int = 50) {
    articles(first: $first, reverse: true, sortKey: PUBLISHED_AT) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        handle
        excerpt
        excerptHtml
        content
        contentHtml
        publishedAt
        tags
        authorV2 {
          name
        }
        image {
          url
          altText
          width
          height
        }
        blog {
          handle
          title
        }
      }
    }
  }
`;

export function formatArticleDate(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function normalizeArticle(node, defaultBlogHandle = 'news') {
  if (!node) return null;
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    excerpt: node.excerpt || node.excerptHtml?.replace(/<[^>]+>/g, '') || '',
    excerptHtml: node.excerptHtml || '',
    content: node.content || '',
    contentHtml: node.contentHtml || '',
    publishedAt: node.publishedAt,
    date: formatArticleDate(node.publishedAt),
    tags: node.tags || [],
    category: node.tags?.[0] || 'Journal',
    author: node.authorV2?.name || 'Arshia Singh Editorial',
    image: node.image?.url || '/assets/placeholder.jpg',
    imageAlt: node.image?.altText || node.title,
    blogHandle: node.blog?.handle || defaultBlogHandle,
    seo: node.seo || null,
  };
}

export async function fetchShopifyArticles({ blogHandle = 'news', first = 50 } = {}) {
  try {
    // 1. First attempt: Query the specific blog handle (e.g. 'news' or 'journal')
    const response = await client.request(GET_BLOG_ARTICLES_QUERY, {
      variables: { blogHandle, first },
    });

    const blogNodes = response?.data?.blog?.articles?.nodes;
    if (Array.isArray(blogNodes) && blogNodes.length > 0) {
      return blogNodes.map((node) => normalizeArticle(node, blogHandle));
    }

    // 2. Fallback: Query all articles across the store
    const fallbackResponse = await client.request(GET_ALL_ARTICLES_QUERY, {
      variables: { first },
    });

    const allNodes = fallbackResponse?.data?.articles?.nodes;
    if (Array.isArray(allNodes) && allNodes.length > 0) {
      return allNodes.map((node) => normalizeArticle(node, blogHandle));
    }

    return [];
  } catch (error) {
    console.error('Error fetching articles from Shopify:', error);
    try {
      // Fallback query if blog query failed
      const fallbackResponse = await client.request(GET_ALL_ARTICLES_QUERY, {
        variables: { first },
      });
      const allNodes = fallbackResponse?.data?.articles?.nodes;
      if (Array.isArray(allNodes)) {
        return allNodes.map((node) => normalizeArticle(node, blogHandle));
      }
    } catch (fallbackError) {
      console.error('Fallback fetch all articles also failed:', fallbackError);
    }
    return [];
  }
}

export async function fetchArticleByHandle(handle, blogHandle = 'news') {
  if (!handle) return null;

  try {
    // 1. Try fetching directly via blog articleByHandle
    const response = await client.request(GET_ARTICLE_BY_HANDLE_QUERY, {
      variables: { blogHandle, handle },
    });

    const article = response?.data?.blog?.articleByHandle;
    if (article) {
      return normalizeArticle(article, blogHandle);
    }

    // 2. Fallback: Search in all articles by handle or matching slug
    const fallbackResponse = await client.request(GET_ALL_ARTICLES_QUERY, {
      variables: { first: 50 },
    });

    const allNodes = fallbackResponse?.data?.articles?.nodes || [];
    const matched = allNodes.find(
      (n) =>
        n.handle === handle ||
        n.handle?.toLowerCase() === handle.toLowerCase() ||
        n.id === handle ||
        n.id?.endsWith(`/${handle}`)
    );

    if (matched) {
      return normalizeArticle(matched, matched.blog?.handle || blogHandle);
    }

    return null;
  } catch (error) {
    console.error(`Error fetching article [${handle}] from Shopify:`, error);
    try {
      // Fallback: search in all articles
      const fallbackResponse = await client.request(GET_ALL_ARTICLES_QUERY, {
        variables: { first: 50 },
      });
      const allNodes = fallbackResponse?.data?.articles?.nodes || [];
      const matched = allNodes.find(
        (n) =>
          n.handle === handle ||
          n.handle?.toLowerCase() === handle.toLowerCase() ||
          n.id === handle ||
          n.id?.endsWith(`/${handle}`)
      );
      if (matched) {
        return normalizeArticle(matched, matched.blog?.handle || blogHandle);
      }
    } catch (fallbackError) {
      console.error('Fallback article search failed:', fallbackError);
    }
    return null;
  }
}
