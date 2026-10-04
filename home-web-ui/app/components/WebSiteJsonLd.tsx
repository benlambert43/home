import JsonLd from "@/app/components/JsonLd";
import { WEBSITE_ID } from "@/app/lib/jsonLd";
import { SITE_NAME } from "@/app/lib/metadata";
import { siteUrl } from "@/app/lib/siteUrl";

const GRAPH = [
  {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: siteUrl("/"),
    inLanguage: "en",
  },
];

const WebSiteJsonLd = () => <JsonLd graph={GRAPH} />;

export default WebSiteJsonLd;
