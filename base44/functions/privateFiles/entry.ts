import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { ownsFile, recordOwner } from '../../shared/fileAccess.ts';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES_PER_USER = 300;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isForm = (req.headers.get('content-type') || '').includes('multipart/form-data');

    // Upload: stored privately and recorded as belonging to the caller
    if (isForm) {
      const form = await req.formData();
      const file = form.get('file');
      if (!(file instanceof File)) return Response.json({ error: 'Fichier requis' }, { status: 400 });
      if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_BYTES) {
        return Response.json({ error: 'Fichier invalide' }, { status: 400 });
      }
      const owned = await base44.asServiceRole.entities.UserFile.filter({ user_id: user.id }, '-created_date', MAX_FILES_PER_USER);
      if ((Array.isArray(owned) ? owned : owned?.items ?? []).length >= MAX_FILES_PER_USER) {
        return Response.json({ error: 'Limite de fichiers atteinte' }, { status: 429 });
      }
      const up = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });
      await recordOwner(base44, user.id, up.file_uri);
      return Response.json({ file_uri: up.file_uri });
    }

    // Sign: only for files that belong to the caller
    const { action, file_uri } = await req.json();
    if (action !== 'sign') return Response.json({ error: 'Invalid action' }, { status: 400 });
    if (!(await ownsFile(base44, user.id, file_uri))) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const res = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 3600 });
    return Response.json({ signed_url: res.signed_url });
  } catch (error) {
    console.error('privateFiles error:', error);
    return Response.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
});