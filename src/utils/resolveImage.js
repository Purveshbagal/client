const BACKEND_ORIGIN = import.meta.env.VITE_API_URL.replace('/api', '');

export function resolveImage(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // If url already starts with '/', assume it's hosted on backend origin
  if (url.startsWith('/')) return BACKEND_ORIGIN + url;
  // Otherwise, join with backend origin
  return BACKEND_ORIGIN + '/' + url;
}

export default resolveImage;
