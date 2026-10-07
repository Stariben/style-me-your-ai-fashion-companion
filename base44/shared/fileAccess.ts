// Ownership of private files: a file_uri may only be read/used by the user it belongs to.
const items = (r: any) => (Array.isArray(r) ? r : r?.items ?? []);

export async function recordOwner(base44: any, userId: string, fileUri: string) {
  await base44.asServiceRole.entities.UserFile.create({ user_id: userId, file_uri: fileUri });
}

export async function ownsFile(base44: any, userId: string, fileUri: string): Promise<boolean> {
  if (typeof fileUri !== 'string' || !fileUri || fileUri.length > 2048) return false;
  const db = base44.asServiceRole.entities;
  if (items(await db.UserFile.filter({ user_id: userId, file_uri: fileUri })).length > 0) return true;
  // Files created before ownership tracking: owned if they appear in the user's own history / style profile
  const pattern = fileUri.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hist = items(await db.AnalysisHistory.filter({
    $and: [
      { $or: [{ user_id: userId }, { created_by_id: userId }] },
      { $or: [
        { person_image: fileUri }, { outfit_image: fileUri }, { generated_image: fileUri },
        { result_json: { $regex: pattern } },
      ] },
    ],
  }));
  if (hist.length > 0) return true;
  const prof = items(await db.StyleProfile.filter({ user_id: userId, profile_json: { $regex: pattern } }));
  return prof.length > 0;
}