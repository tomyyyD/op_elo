// Utility function to get proxied image URL
export const getProxiedImageUrl = (originalUrl: string | null): string => {
  if (!originalUrl) return '';
  
  // If it's already a local URL, return as-is
  if (originalUrl.startsWith('/') || originalUrl.startsWith(window.location.origin)) {
    return originalUrl;
  }
  
  // Use query parameter to match backend implementation
  const encodedUrl = encodeURIComponent(originalUrl);
  return `/api/image-proxy?url=${encodedUrl}`;
};
