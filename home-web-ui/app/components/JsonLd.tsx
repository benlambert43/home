const JsonLd = ({ graph }: { graph: object[] }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": graph,
      }).replace(/</g, "\\u003c"),
    }}
  />
);

export default JsonLd;
