// API utility to handle URLs in both development and production
const getApiUrl = (endpoint: string): string => {
  // In development, use relative URLs (proxy will handle it)
  if (import.meta.env.DEV) {
    return `/api${endpoint}`
  }
  
  // In production, use the full API host URL
  const apiHost = import.meta.env.VITE_API_HOST || 'https://op-elo-backend.onrender.com'
  return `${apiHost}${endpoint}`
}

export { getApiUrl }
