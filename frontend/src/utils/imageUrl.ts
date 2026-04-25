const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? '';

export function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE}${url}`;
}
