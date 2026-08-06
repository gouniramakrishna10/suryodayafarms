import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const BASE_URL = "https://suryodayafarms.com";
export const BRAND_NAME = "Suryodaya Farms";
export const DEFAULT_OG_IMAGE = "https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png";

export const DEFAULT_SEO = {
  title: `Suryodaya Farms | Nature's Superfoods for Modern Living`,
  description: `Suryodaya Farms brings you Pure, Natural and Nutritious superfoods inspired by nature. Discover our carefully crafted range of quality products and experience nutrition you can trust.`
};

// Route-specific metadata dictionary
export const ROUTE_SEO_MAP = {
  '/': {
    title: `Suryodaya Farms | Nature's Superfoods for Modern Living`,
    description: `Suryodaya Farms brings you Pure, Natural and Nutritious superfoods inspired by nature. Discover our carefully crafted range of quality products and experience nutrition you can trust.`
  },
  '/about': {
    title: `About Us | Suryodaya Farms`,
    description: `Learn about Suryodaya Farms, our journey, values, commitment to quality, research-driven approach, and our vision of bringing Pure, Natural and Nutritious superfoods to every family.`
  },
  '/products': {
    title: `Our Natural Superfoods | Suryodaya Farms`,
    description: `Explore pure, natural and nutritious superfoods from Suryodaya Farms. Developed with scientific care to support your family's daily wellness.`
  },
  '/become-a-partner': {
    title: `Partner with Suryodaya Farms | Nature's Superfoods for Modern Living`,
    description: `Join Suryodaya Farms as a business partner. Explore distribution, wholesale, retail, and corporate supply opportunities built on trust, quality, and mutual success.`
  },
  '/contact': {
    title: `Contact Us | Suryodaya Farms`,
    description: `Get in touch with Suryodaya Farms. Contact our team for inquiries, product questions, order support, and customer assistance.`
  },
  '/faq': {
    title: `Frequently Asked Questions | Suryodaya Farms`,
    description: `Find answers to common questions about Suryodaya Farms superfoods, quality standards, ordering, shipping, and customer support.`
  },
  '/privacy': {
    title: `Privacy Policy & Terms | Suryodaya Farms`,
    description: `Read Suryodaya Farms' privacy policy, terms of service, and quality policies. Learn how we handle data and protect your trust.`
  },
  '/cart': {
    title: `Shopping Cart | Suryodaya Farms`,
    description: `Review your selected natural superfood products and proceed securely to checkout with Suryodaya Farms.`,
    noindex: true
  },
  '/checkout': {
    title: `Secure Checkout | Suryodaya Farms`,
    description: `Complete your order safely and securely with Suryodaya Farms.`,
    noindex: true
  },
  '/wishlist': {
    title: `My Saved Superfoods | Suryodaya Farms`,
    description: `View your saved Suryodaya Farms natural superfood items.`,
    noindex: true
  },
  '/profile': {
    title: `My Account | Suryodaya Farms`,
    description: `Manage your orders, profile details, and account preferences with Suryodaya Farms.`,
    noindex: true
  }
};

/**
 * Computes canonical URL according to Google Search Console best practices.
 * - Enforces https://suryodayafarms.com
 * - Normalizes trailing slashes (only root / has trailing slash)
 * - Strips query parameters (?sort=..., ?utm_source=..., ?page=...)
 * - Normalizes route aliases (/product/:slug -> /products/:slug)
 */
export function getCanonicalUrl(pathname = '/') {
  let cleanPath = pathname.split('?')[0].split('#')[0];
  
  // Normalize alias /product/:slug to /products/:slug
  if (cleanPath.startsWith('/product/')) {
    cleanPath = cleanPath.replace('/product/', '/products/');
  }

  // Remove trailing slashes (except root)
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  // Lowercase normalization
  cleanPath = cleanPath.toLowerCase();

  return cleanPath === '/' ? `${BASE_URL}/` : `${BASE_URL}${cleanPath}`;
}

/**
 * Helper to create or update head meta tags safely
 */
function setMetaTag(selector, attrName, attrValue, content) {
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to inject or update JSON-LD script tags
 */
export function setJsonLd(id, data) {
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
}

/**
 * Main updateSEO function
 */
export function updateSEO({
  title,
  description,
  image,
  ogType = 'website',
  canonicalUrl,
  noindex = false,
  productData,
  categoryData,
  breadcrumbs
}) {
  const currentPath = window.location.pathname;
  const isUnindexable = noindex || 
    currentPath.startsWith('/cart') ||
    currentPath.startsWith('/checkout') ||
    currentPath.startsWith('/profile') ||
    currentPath.startsWith('/admin') ||
    currentPath.startsWith('/wishlist');

  const finalTitle = title || DEFAULT_SEO.title;
  const finalDesc = description || DEFAULT_SEO.description;
  const finalImage = image || DEFAULT_OG_IMAGE;
  const finalCanonical = canonicalUrl || getCanonicalUrl(currentPath);

  // 1. Title
  document.title = finalTitle;

  // 2. Meta Description
  setMetaTag('meta[name="description"]', 'name', 'description', finalDesc);

  // 3. Robots Meta Tag (Google Indexing control)
  setMetaTag(
    'meta[name="robots"]',
    'name',
    'robots',
    isUnindexable
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  );

  // 4. Canonical Link Tag (PERMANENT FIX FOR SEARCH CONSOLE)
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', finalCanonical);

  // Clean up any extra duplicate canonical tags if present
  const allCanonicals = document.querySelectorAll('link[rel="canonical"]');
  if (allCanonicals.length > 1) {
    allCanonicals.forEach((el, index) => {
      if (index > 0) el.remove();
    });
  }

  // 5. Open Graph Meta Tags
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', finalCanonical);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', BRAND_NAME);
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', finalTitle);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', finalDesc);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', finalImage);

  // 6. Twitter Card Meta Tags
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', finalTitle);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', finalDesc);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', finalImage);

  // 7. Structured Data Schemas
  // Organization Schema
  setJsonLd('schema-organization', {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": BRAND_NAME,
    "url": BASE_URL,
    "logo": DEFAULT_OG_IMAGE,
    "slogan": "Nature's Superfoods for Modern Living",
    "description": DEFAULT_SEO.description,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+919100422140",
      "contactType": "customer service",
      "email": "care@suryodayafarms.com",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi", "Telugu"]
    }
  });

  // WebSite Schema
  setJsonLd('schema-website', {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": BRAND_NAME,
    "url": BASE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${BASE_URL}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  });

  // BreadcrumbList Schema
  const breadcrumbList = breadcrumbs || generateBreadcrumbs(currentPath, title);
  if (breadcrumbList && breadcrumbList.length > 0) {
    setJsonLd('schema-breadcrumb', {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbList.map((item, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": item.name,
        "item": item.url
      }))
    });
  }

  // Product Schema (when productData is provided)
  if (productData) {
    const rawPrice = productData.price || productData.basePrice || 0;
    const numericPrice = typeof rawPrice === 'string'
      ? parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0
      : rawPrice;

    setJsonLd('schema-product', {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": productData.name,
      "image": [productData.image || finalImage],
      "description": productData.description || productData.shortDescription || finalDesc,
      "sku": productData.sku || productData.id || `SF-${productData.slug || 'ITEM'}`,
      "brand": {
        "@type": "Brand",
        "name": BRAND_NAME
      },
      "offers": {
        "@type": "Offer",
        "url": finalCanonical,
        "priceCurrency": "INR",
        "price": numericPrice > 0 ? numericPrice : undefined,
        "priceValidUntil": "2027-12-31",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": productData.inStock !== false && !productData.isComingSoon
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": BRAND_NAME
        }
      }
    });
  } else {
    // Remove product schema if not on product page
    const prodScript = document.getElementById('schema-product');
    if (prodScript) prodScript.remove();
  }

  // CollectionPage Schema (when on /products or /category/*)
  if (currentPath.startsWith('/products') || currentPath.startsWith('/category')) {
    setJsonLd('schema-collection', {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title || "Superfoods Collection",
      "description": finalDesc,
      "url": finalCanonical
    });
  } else {
    const collScript = document.getElementById('schema-collection');
    if (collScript) collScript.remove();
  }
}

/**
 * Generate Breadcrumbs hierarchy based on path
 */
function generateBreadcrumbs(pathname, pageTitle) {
  const parts = pathname.split('/').filter(Boolean);
  const items = [{ name: 'Home', url: `${BASE_URL}/` }];

  let currentAccPath = '';
  parts.forEach((part, index) => {
    currentAccPath += `/${part}`;
    const isLast = index === parts.length - 1;
    let label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');

    if (isLast && pageTitle) {
      label = pageTitle.split('|')[0].trim();
    }

    items.push({
      name: label,
      url: getCanonicalUrl(currentAccPath)
    });
  });

  return items;
}

/**
 * Global SEO Hook used in MainLayout to sync meta tags automatically on route changes.
 */
export function useSEO() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;

    // Direct route lookup
    if (ROUTE_SEO_MAP[pathname]) {
      updateSEO({
        ...ROUTE_SEO_MAP[pathname],
        canonicalUrl: getCanonicalUrl(pathname)
      });
      return;
    }

    // Generic fallback for unmapped static routes (product/category pages manage their own dynamic SEO)
    if (!pathname.startsWith('/products/') && !pathname.startsWith('/product/') && !pathname.startsWith('/category/')) {
      updateSEO({
        ...DEFAULT_SEO,
        canonicalUrl: getCanonicalUrl(pathname)
      });
    }
  }, [location.pathname, location.search]);
}
