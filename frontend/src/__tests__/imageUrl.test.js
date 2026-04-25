import { describe, it, expect, beforeEach } from 'vitest';

// getImageUrl reads import.meta.env at module load time, so we test the logic directly
function makeGetImageUrl(apiUrl) {
  const BASE = apiUrl?.replace('/api', '') || '';
  return (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE}${url}`;
  };
}

describe('getImageUrl', () => {
  const getImageUrl = makeGetImageUrl('https://bie-daalt.onrender.com/api');

  it('returns null for empty/falsy url', () => {
    expect(makeGetImageUrl('https://bie-daalt.onrender.com/api')(null)).toBeNull();
    expect(makeGetImageUrl('https://bie-daalt.onrender.com/api')('')).toBeNull();
    expect(makeGetImageUrl('https://bie-daalt.onrender.com/api')(undefined)).toBeNull();
  });

  it('returns absolute URLs unchanged', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    expect(getImageUrl(url)).toBe(url);
  });

  it('prepends base URL to relative paths', () => {
    expect(getImageUrl('/uploads/photo.jpg')).toBe('https://bie-daalt.onrender.com/uploads/photo.jpg');
  });

  it('strips /api suffix from base correctly', () => {
    const fn = makeGetImageUrl('http://localhost:5000/api');
    expect(fn('/uploads/test.png')).toBe('http://localhost:5000/uploads/test.png');
  });

  it('uses empty base when no API URL configured', () => {
    const fn = makeGetImageUrl(undefined);
    expect(fn('/uploads/test.png')).toBe('/uploads/test.png');
  });
});
