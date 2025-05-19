export function normalizeTags(tags: string | string[]): string[] {
  return Array.isArray(tags) ? tags : [tags];
}
