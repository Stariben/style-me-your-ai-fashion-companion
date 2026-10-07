import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const CACHE_MS = 50 * 60 * 1000;
const cache = new Map();

// Public URLs (legacy photos, AI results, blob previews) pass through; private file URIs get a signed URL.
const isDirectUrl = (ref) => /^(https?:|blob:|data:)/.test(ref);

export default function useSignedUrl(ref) {
  const [url, setUrl] = useState(() => {
    if (!ref) return null;
    if (isDirectUrl(ref)) return ref;
    const hit = cache.get(ref);
    return hit && hit.exp > Date.now() ? hit.url : null;
  });

  useEffect(() => {
    if (!ref) { setUrl(null); return; }
    if (isDirectUrl(ref)) { setUrl(ref); return; }
    const hit = cache.get(ref);
    if (hit && hit.exp > Date.now()) { setUrl(hit.url); return; }
    let cancelled = false;
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: ref, expires_in: 3600 })
      .then(({ signed_url }) => {
        cache.set(ref, { url: signed_url, exp: Date.now() + CACHE_MS });
        if (!cancelled) setUrl(signed_url);
      })
      .catch(() => { if (!cancelled) setUrl(null); });
    return () => { cancelled = true; };
  }, [ref]);

  return url;
}