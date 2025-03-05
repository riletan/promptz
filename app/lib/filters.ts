export type FilterCondition = Record<string, unknown>;

// Utility function for case variations
export function getCaseVariations(text: string): string[] {
  return [
    text.toLowerCase(),
    text.toUpperCase(),
    text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(),
  ];
}

// Handle text search conditions
export function buildTextSearchFilter(query: string): FilterCondition {
  const variations = getCaseVariations(query);
  return {
    or: variations.flatMap((variant) => [
      { name: { contains: variant } },
      { description: { contains: variant } },
    ]),
  };
}

// Handle tag-based filtering
export function buildTagFilter(tags: string | string[]): FilterCondition[] {
  const tagArray = Array.isArray(tags) ? tags : [tags];
  return tagArray.map((tag) => ({ tags: { contains: tag } }));
}
