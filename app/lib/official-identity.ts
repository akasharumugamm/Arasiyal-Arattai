/**
 * Stable identity key shared by every role held by the same public person.
 * Keep role/category out of this key: one person may be a minister, MLA, or CM.
 */
const identityAliases: Record<string, string> = {
  cjosephvijay: "joseph-vijay",
  josephvijay: "joseph-vijay",
};

export function getOfficialIdentityKey(name: string): string {
  const withoutTitles = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/^(?:(?:honou?rable|thiru|thirumathi|thirumagan|mr|mrs|ms|dr|justice)\s+)+/i, "");
  const normalized = withoutTitles.toLowerCase().replace(/[^a-z0-9]/g, "");
  return identityAliases[normalized] ?? normalized;
}
