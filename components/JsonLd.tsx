/**
 * Renders a JSON-LD structured-data block.
 *
 * Centralised so the escaping rule lives in exactly one place: a literal "<"
 * must become the < escape, otherwise a value containing "</script>"
 * would close the tag early and break the page.
 */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
