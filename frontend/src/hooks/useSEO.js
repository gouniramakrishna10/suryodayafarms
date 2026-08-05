import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BRAND_NAME = "Suryodaya Farms";
const BRAND_TAGLINE = "Nature's Superfoods for Modern Living";

// Default client-approved SEO constants
export const DEFAULT_SEO = {
  title: `Suryodaya Farms | Nature's Superfoods for Modern Living`,
  description: `Suryodaya Farms brings you Pure, Natural and Nutritious superfoods inspired by nature. Discover our carefully crafted range of quality products and experience nutrition you can trust.`
};

// Route-specific client-approved metadata dictionary
export const ROUTE_SEO_MAP = {
  '/': {
    title: `Suryodaya Farms | Nature's Superfoods for Modern Living`,
    description: `Suryodaya Farms brings you Pure, Natural and Nutritious superfoods inspired by nature. Discover our carefully crafted range of quality products and experience nutrition you can trust.`
  },
  '/about': {
    title: `About Suryodaya Farms | Nature's Superfoods for Modern Living`,
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
    description: `Review your selected natural superfood products and proceed securely to checkout with Suryodaya Farms.`
  },
  '/checkout': {
    title: `Secure Checkout | Suryodaya Farms`,
    description: `Complete your order safely and securely with Suryodaya Farms.`
  },
  '/wishlist': {
    title: `My Saved Superfoods | Suryodaya Farms`,
    description: `View your saved Suryodaya Farms natural superfood items.`
  },
  '/profile': {
    title: `My Account | Suryodaya Farms`,
    description: `Manage your orders, profile details, and account preferences with Suryodaya Farms.`
  }
};

/**
 * Dynamically updates document title and meta elements in document head.
 */
export function updateSEO({ title, description }) {
  const finalTitle = title || DEFAULT_SEO.title;
  const finalDesc = description || DEFAULT_SEO.description;

  // 1. Update Document Title
  document.title = finalTitle;

  // 2. Update Standard Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', finalDesc);

  // 3. Update Open Graph Meta Tags
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', finalTitle);

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  ogDesc.setAttribute('content', finalDesc);

  // 4. Update Twitter Meta Tags
  let twTitle = document.querySelector('meta[name="twitter:title"]');
  if (!twTitle) {
    twTitle = document.createElement('meta');
    twTitle.setAttribute('name', 'twitter:title');
    document.head.appendChild(twTitle);
  }
  twTitle.setAttribute('content', finalTitle);

  let twDesc = document.querySelector('meta[name="twitter:description"]');
  if (!twDesc) {
    twDesc = document.createElement('meta');
    twDesc.setAttribute('name', 'twitter:description');
    document.head.appendChild(twDesc);
  }
  twDesc.setAttribute('content', finalDesc);
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
      updateSEO(ROUTE_SEO_MAP[pathname]);
      return;
    }

    // Generic fallback for unmapped static routes (product/category pages manage their own dynamic SEO)
    if (!pathname.startsWith('/products/') && !pathname.startsWith('/category/')) {
      updateSEO(DEFAULT_SEO);
    }
  }, [location.pathname]);
}
