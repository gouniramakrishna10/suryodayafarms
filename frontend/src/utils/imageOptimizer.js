export const DEFAULT_FALLBACK_IMAGE = 'https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png';

/**
 * Resolves full image URL by handling Cloudinary, absolute HTTPS URLs, base64 data URLs,
 * and prepending backend host if relative path (e.g. /uploads/...)
 */
export const resolveImageUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Data URLs, Blob URLs, or Absolute URLs (http:// or https:// or //)
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')) {
    return trimmed;
  }

  // Prepend backend URL for relative paths
  const backendHost = (import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://suryodayafarms.onrender.com')).replace(/\/api\/?$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${backendHost}${cleanPath}`;
};

/**
 * Dynamically scales and optimizes image URLs for Cloudinary and Unsplash.
 * Appends auto-format, auto-quality, and precise dimensions to prevent layout shifts and heavy payload transfers.
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  const resolved = resolveImageUrl(url);
  if (!resolved) return DEFAULT_FALLBACK_IMAGE;

  const { width, height, cropMode = 'fill', crop, quality = 'auto:good', format = 'auto' } = options;

  // Cloudinary URL Optimization
  if (resolved.includes('res.cloudinary.com')) {
    const uploadIndex = resolved.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const prefix = resolved.substring(0, uploadIndex + 8);
      const suffix = resolved.substring(uploadIndex + 8);

      const transformations = [];

      // Apply coordinates crop if supplied
      if (crop && crop.cropX !== undefined && crop.cropX !== null && crop.cropWidth) {
        transformations.push(`c_crop,x_${crop.cropX},y_${crop.cropY},w_${crop.cropWidth},h_${crop.cropHeight}`);
      }

      // Add sizing parameters
      if (width) {
        transformations.push(`w_${width}`);
      }
      if (height) {
        transformations.push(`h_${height}`);
      }
      if (width || height) {
        const finalCropMode = cropMode === 'fit' ? 'limit' : cropMode;
        transformations.push(`c_${finalCropMode}`);
      }

      // Force webp/auto format detection and modern lightweight compression
      transformations.push(`f_${format},q_${quality}`);

      return `${prefix}${transformations.join('/')}/${suffix}`;
    }
  }

  // Unsplash URL Optimization
  if (resolved.includes('unsplash.com')) {
    try {
      const parsedUrl = new URL(resolved);
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('fm', 'webp');
      parsedUrl.searchParams.set('q', '75');
      if (width) parsedUrl.searchParams.set('w', width.toString());
      if (height) parsedUrl.searchParams.set('h', height.toString());
      return parsedUrl.toString();
    } catch (e) {
      return resolved;
    }
  }

  return resolved;
};

/**
 * Generates a srcset string for Cloudinary images.
 */
export const getCloudinarySrcSet = (url, options = {}) => {
  const resolved = resolveImageUrl(url);
  if (!resolved || !resolved.includes('res.cloudinary.com')) return undefined;

  const { widths = [400, 800, 1500], cropMode = 'limit', crop, quality = 'auto:best' } = options;

  return widths
    .map(w => {
      const optUrl = getOptimizedImageUrl(resolved, {
        width: w,
        cropMode,
        crop,
        quality
      });
      return `${optUrl} ${w}w`;
    })
    .join(', ');
};

/**
 * Generates a srcset string for Unsplash images.
 */
export const getUnsplashSrcSet = (url, options = {}) => {
  const resolved = resolveImageUrl(url);
  if (!resolved || !resolved.includes('unsplash.com')) return undefined;

  const { widths = [400, 800, 1500] } = options;
  try {
    return widths
      .map(w => {
        const parsedUrl = new URL(resolved);
        parsedUrl.searchParams.set('auto', 'format');
        parsedUrl.searchParams.set('q', '80');
        parsedUrl.searchParams.set('w', w.toString());
        return `${parsedUrl.toString()} ${w}w`;
      })
      .join(', ');
  } catch (e) {
    return undefined;
  }
};

/**
 * Unified helper to generate a responsive srcset string.
 * Returns undefined when not applicable so React omits empty srcSet attributes.
 */
export const getImageSrcSet = (url, options = {}) => {
  const resolved = resolveImageUrl(url);
  if (!resolved) return undefined;
  if (resolved.includes('res.cloudinary.com')) {
    return getCloudinarySrcSet(resolved, options);
  }
  if (resolved.includes('unsplash.com')) {
    return getUnsplashSrcSet(resolved, options);
  }
  return undefined;
};

/**
 * Global image error handler helper
 */
export const handleImageError = (e, fallbackUrl = DEFAULT_FALLBACK_IMAGE) => {
  const failedUrl = e.target.src;
  console.warn(`[Image Render Audit]: Image failed to load -> "${failedUrl}". Replacing with fallback placeholder.`);
  if (e.target.src !== fallbackUrl) {
    e.target.src = fallbackUrl;
    e.target.srcset = '';
  }
};


