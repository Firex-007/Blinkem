const API_BASE = '';

function headers() {
  const h = { 'Content-Type': 'application/json' };
  const userId = typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : null;
  if (userId) h['X-User-Id'] = userId;
  return h;
}

async function request(method, path, body, form) {
  const opts = { method, headers: form ? {} : headers() };
  if (form) {
    opts.body = body;
    if (typeof localStorage !== 'undefined') {
      const userId = localStorage.getItem('userId');
      if (userId) opts.headers['X-User-Id'] = userId;
    }
  } else if (body) {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${path}`, opts);
  let data;
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  postForm: (path, formData) => request('POST', path, formData, true),
};
