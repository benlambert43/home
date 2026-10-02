import { SITE_NAME } from "@/app/lib/metadata";
import {
  PERSON_JOB_TITLE,
  PERSON_NAME,
  PERSON_PORTRAIT_PATH,
  PROFILE_URLS,
} from "@/app/lib/person";
import { siteUrl } from "@/app/lib/siteUrl";

const PERSON_ID = siteUrl("/#person");

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: PERSON_NAME,
      url: siteUrl("/"),
      image: siteUrl(PERSON_PORTRAIT_PATH),
      jobTitle: PERSON_JOB_TITLE,
      homeLocation: {
        "@type": "Place",
        name: "Denver, CO",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Denver",
          addressRegion: "CO",
          addressCountry: "US",
        },
      },
      sameAs: PROFILE_URLS,
    },
    {
      "@type": "WebSite",
      "@id": siteUrl("/#website"),
      name: SITE_NAME,
      url: siteUrl("/"),
      inLanguage: "en",
      author: { "@id": PERSON_ID },
    },
  ],
};

const PersonJsonLd = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c"),
    }}
  />
);

export default PersonJsonLd;
