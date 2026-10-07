// Photos are stored privately (file_uri). Legacy records and AI results may still be public https URLs.
export function isValidImageRef(ref: unknown): ref is string {
  return typeof ref === 'string' && ref.length > 0 && ref.length <= 2048 && !ref.startsWith('http:');
}

export async function toFetchableUrl(base44: any, ref: string): Promise<string> {
  if (ref.startsWith('https://')) return ref;
  const res = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: ref, expires_in: 900 });
  return res.signed_url;
}