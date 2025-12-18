import api from '../api/api';

const BACKEND_ORIGIN = (api.defaults.baseURL || '').replace(/\/api\/?$/, '') || 'http://localhost:5000';

export function resolveImage(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // If url already starts with '/', assume it's hosted on backend origin
  if (url.startsWith('/')) return BACKEND_ORIGIN + url;
  // Otherwise, join with backend origin
  return BACKEND_ORIGIN + '/' + url;
}

export default resolveImage;
