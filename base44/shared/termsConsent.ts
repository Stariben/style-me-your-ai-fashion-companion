export const TERMS_VERSION = '2026-04';

// Returns true when the user has an accepted consent record for the current terms version.
export async function hasAcceptedTerms(base44: any, userId: string): Promise<boolean> {
  const records = await base44.asServiceRole.entities.TermsConsent.filter({
    user_id: userId,
    terms_version: TERMS_VERSION,
  });
  return records.length > 0;
}