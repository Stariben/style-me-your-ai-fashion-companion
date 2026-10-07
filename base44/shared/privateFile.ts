// Photos are stored privately (file_uri). Legacy records and AI results may still be public https URLs.
export function isValidImageRef(ref: unknown): ref is string {
  return typeof ref === 'string' && ref.length > 0 && ref.length <= 2048 && !ref.startsWith('http:');
}

// Copies a public image (e.g. an AI result) into private storage and returns its file_uri.
export async function privatize(base44: any, url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  if (!url.startsWith('https://')) return url;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`privatize fetch failed: ${r.status}`);
  const file = new File([await r.arrayBuffer()], 'image.png', { type: r.headers.get('content-type') || 'image/png' });
  const up = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });
  return up.file_uri;
}

export async function toFetchableUrl(base44: any, ref: string): Promise<string> {
  if (ref.startsWith('https://')) return ref;
  const res = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: ref, expires_in: 900 });
  return res.signed_url;
}