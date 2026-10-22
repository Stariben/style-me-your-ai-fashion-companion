import { base44 } from '@/api/base44Client';

export async function brandAdmin(action, payload = {}) {
  try {
    const res = await base44.functions.invoke('brandAdmin', { action, ...payload });
    return res.data;
  } catch (e) {
    throw new Error(e?.response?.data?.error || 'Une erreur est survenue');
  }
}

export function notifyError(toast) {
  return (e) => toast({ title: e.message, variant: 'destructive' });
}