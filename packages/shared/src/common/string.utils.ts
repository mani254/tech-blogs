/**
 * Converts any text string into a URL- and database-safe slug.
 * E.g., "Vintage Cars #1!" -> "vintage-cars-1"
 */
export function generateSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
