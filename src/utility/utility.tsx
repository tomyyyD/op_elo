// Utility function to get proxied image URL
export const getProxiedImageUrl = (originalUrl: string | null): string => {
  if (!originalUrl) return '';
  
  // If it's already a local URL, return as-is
  if (originalUrl.startsWith('/') || originalUrl.startsWith(window.location.origin)) {
    return originalUrl;
  }
  
  // Use query parameter to match backend implementation
  const encodedUrl = encodeURIComponent(originalUrl);
  
  // Environment-aware URL construction
  if (import.meta.env.DEV) {
    // In development, use relative URLs (proxy will handle it)
    return `/api/image-proxy?url=${encodedUrl}`;
  } else {
    // In production, use the full API host URL
    const apiHost = import.meta.env.VITE_API_HOST || 'https://op-elo-backend.onrender.com';
    return `${apiHost}/image-proxy?url=${encodedUrl}`;
  }
};
