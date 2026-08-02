/**
 * Injects JSON-LD structured data (SEO). The data object is serialized
 * server-side; React never touches it, so no hydration risk.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
