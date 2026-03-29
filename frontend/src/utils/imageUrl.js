// Зургийн URL-г production болон development-д зөв үүсгэх
const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

export function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE}${url}`;
}
