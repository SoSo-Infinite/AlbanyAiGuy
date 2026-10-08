/** Site-wide Organization / LocalBusiness JSON-LD (honest: no fake phone, ratings, or customers). */
export const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "ProfessionalService", "LocalBusiness"],
      "@id": "https://albanyaiguy.com/#org",
      name: "Albany AI Guy",
      url: "https://albanyaiguy.com/",
      logo: "https://albanyaiguy.com/logo.png",
      image: "https://albanyaiguy.com/og.jpg",
      email: "hello@albanyaiguy.com",
      founder: {
        "@type": "Person",
        name: "Chad Lenseth",
        url: "https://www.linkedin.com/in/chad-lenseth-26b55938",
      },
      description:
        "Albany trunk-line concierge and AI voice receptionist for Capital Region local businesses. Coming soon — join the pilot.",
      areaServed: [
        { "@type": "AdministrativeArea", name: "Albany County, NY" },
        { "@type": "AdministrativeArea", name: "Schenectady County, NY" },
        { "@type": "AdministrativeArea", name: "Rensselaer County, NY" },
        { "@type": "AdministrativeArea", name: "Saratoga County, NY" },
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Albany",
        addressRegion: "NY",
        addressCountry: "US",
      },
      // Only URLs found in Chad's own files. Add GBP / LinkedIn company / X once confirmed.
      sameAs: ["https://www.linkedin.com/in/chad-lenseth-26b55938"],
      makesOffer: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Trunk-line concierge (coming soon)",
            serviceType: "Concierge booking by phone",
            description:
              "One local number that finds and books vetted Capital Region shops. Pilot stage — number not live yet.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "AI phone receptionist for local shops",
            serviceType: "AI receptionist",
            description:
              "An AI front desk on the shop phone that answers missed calls and books appointments. Demo live at /shop-line; full rollout coming soon.",
          },
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://albanyaiguy.com/#site",
      url: "https://albanyaiguy.com/",
      name: "Albany AI Guy",
      publisher: { "@id": "https://albanyaiguy.com/#org" },
    },
  ],
} as const;
