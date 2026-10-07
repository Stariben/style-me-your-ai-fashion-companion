// Credits live in a server-only entity (writes are admin/service-role only).
// Callers must hold the per-user AnalysisLock so the get-or-create cannot race.
export async function getCreditsRecord(db: any, userId: string) {
  const res = await db.UserCredits.filter({ user_id: userId });
  const list = Array.isArray(res) ? res : res?.items ?? [];
  list.sort((a: any, b: any) => String(a.created_date).localeCompare(String(b.created_date)) || String(a.id).localeCompare(String(b.id)));
  if (list[0]) return list[0];
  return await db.UserCredits.create({ user_id: userId, analysis_credits: 0, free_analyses_used: 0 });
}