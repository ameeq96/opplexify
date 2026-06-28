# Opplexify — Schema Markup Reference (JSON-LD)

> The exact `application/ld+json` blocks emitted by each route, generated from the live code
> (`lib/seo.ts`, `lib/pricing.ts`, and the per-route `page.tsx` files). `[slug]` examples use
> representative sample data; real values come from the API at request time.
>
> **Validate:** paste any block into [validator.schema.org](https://validator.schema.org) or test a
> live URL with the [Rich Results Test](https://search.google.com/test/rich-results?url=https://opplexify.com).

---

## Global — emitted on every page (from `app/layout.tsx`)

### Organization

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Opplexify",
  "legalName": "Opplexify LLC",
  "url": "https://opplexify.com",
  "logo": "https://opplexify.com/template-assets/dark/assets/imgs/logo/opplexify-logo-full.png",
  "email": "admin@opplexify.com",
  "telephone": "+1 (307) 443-5144",
  "foundingDate": "2026-05-28",
  "description": "Opplexify LLC helps businesses plan, design, and build websites, SaaS platforms, dashboards, backend systems, APIs, mobile apps, and workflow automations.",
  "sameAs": [
    "https://www.linkedin.com/company/opplexify-llc/"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "525 Randall Ave Ste 100 PMB 1203",
    "addressLocality": "Cheyenne",
    "addressRegion": "WY",
    "postalCode": "82001",
    "addressCountry": "US"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "business verification and project inquiries",
    "email": "admin@opplexify.com",
    "telephone": "+1 (307) 443-5144",
    "areaServed": "Worldwide",
    "availableLanguage": [
      "English"
    ]
  },
  "knowsAbout": [
    "custom website development",
    "SaaS platform development",
    "mobile app development",
    "dashboard and admin panel development",
    "backend API development",
    "workflow automation"
  ],
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Custom website development"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "SaaS platform development"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Dashboard and admin panel development"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Mobile app development"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Backend API development"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Automation and integrations"
      }
    }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Opplexify software development packages",
    "url": "https://opplexify.com/pricing",
    "itemListElement": [
      {
        "@type": "Offer",
        "position": 1,
        "name": "Simple Website",
        "description": "A concise, responsive, SEO-friendly business website designed for credibility, lead capture, and clear service presentation. Starting from $150; typical timeline 1-3 weeks.",
        "category": "5 Page Presence",
        "url": "https://opplexify.com/pricing",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "priceCurrency": "USD",
          "minPrice": 150
        },
        "itemOffered": {
          "@type": "Service",
          "name": "Simple Website",
          "serviceType": "Software development",
          "provider": {
            "@type": "Organization",
            "name": "Opplexify",
            "url": "https://opplexify.com"
          }
        }
      },
      {
        "@type": "Offer",
        "position": 2,
        "name": "Complete Web Application",
        "description": "A full-stack web application with authentication, dashboards, APIs, database integration, and structured workflows. Starting from $500; typical timeline 3-8 weeks.",
        "category": "Full-Stack App",
        "url": "https://opplexify.com/pricing",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "priceCurrency": "USD",
          "minPrice": 500
        },
        "itemOffered": {
          "@type": "Service",
          "name": "Complete Web Application",
          "serviceType": "Software development",
          "provider": {
            "@type": "Organization",
            "name": "Opplexify",
            "url": "https://opplexify.com"
          }
        }
      },
      {
        "@type": "Offer",
        "position": 3,
        "name": "Complete SaaS Solution",
        "description": "A scalable SaaS development foundation with product workflows, admin controls, database models, and subscription-ready architecture. Starting from $1,000; typical timeline 6-12 weeks.",
        "category": "Subscription-Ready",
        "url": "https://opplexify.com/pricing",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "priceCurrency": "USD",
          "minPrice": 1000
        },
        "itemOffered": {
          "@type": "Service",
          "name": "Complete SaaS Solution",
          "serviceType": "Software development",
          "provider": {
            "@type": "Organization",
            "name": "Opplexify",
            "url": "https://opplexify.com"
          }
        }
      },
      {
        "@type": "Offer",
        "position": 4,
        "name": "Mobile App with Admin Dashboard",
        "description": "A mobile application connected to a secure backend API and an operational admin dashboard for real business workflows. Starting from $1,500; typical timeline 5-10 weeks.",
        "category": "App Plus Control Room",
        "url": "https://opplexify.com/pricing",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "priceCurrency": "USD",
          "minPrice": 1500
        },
        "itemOffered": {
          "@type": "Service",
          "name": "Mobile App with Admin Dashboard",
          "serviceType": "Software development",
          "provider": {
            "@type": "Organization",
            "name": "Opplexify",
            "url": "https://opplexify.com"
          }
        }
      },
      {
        "@type": "Offer",
        "position": 5,
        "name": "Complete Mobile App + Web App",
        "description": "A coordinated mobile app, web app, API, database, and admin dashboard system for a complete digital product launch. Starting from $2,000; typical timeline 8-16 weeks.",
        "category": "Complete Product Suite",
        "url": "https://opplexify.com/pricing",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "priceCurrency": "USD",
          "minPrice": 2000
        },
        "itemOffered": {
          "@type": "Service",
          "name": "Complete Mobile App + Web App",
          "serviceType": "Software development",
          "provider": {
            "@type": "Organization",
            "name": "Opplexify",
            "url": "https://opplexify.com"
          }
        }
      }
    ]
  }
}
```

### WebSite

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Opplexify",
  "url": "https://opplexify.com",
  "description": "Opplexify LLC helps businesses plan, design, and build websites, SaaS platforms, dashboards, backend systems, APIs, mobile apps, and workflow automations.",
  "inLanguage": "en"
}
```

---

## Per-route blocks

### Home — WebPage

`/`

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Custom Websites, SaaS Platforms & Business Software Development",
  "url": "https://opplexify.com",
  "image": "https://opplexify.com/portfolio/thumbs/portfolio-001.webp",
  "description": "Opplexify LLC helps businesses plan, design, and build websites, SaaS platforms, dashboards, backend systems, APIs, mobile apps, and workflow automations.",
  "about": {
    "@type": "Organization",
    "name": "Opplexify",
    "legalName": "Opplexify LLC",
    "url": "https://opplexify.com",
    "email": "admin@opplexify.com",
    "telephone": "+1 (307) 443-5144",
    "sameAs": [
      "https://www.linkedin.com/company/opplexify-llc/"
    ],
    "address": "Business mailing address: 525 Randall Ave Ste 100 PMB 1203, Cheyenne, WY 82001, United States"
  }
}
```

### Services list — ItemList + BreadcrumbList

`/services`

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Opplexify LLC software development services",
  "url": "https://opplexify.com/services",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Service",
        "name": "Custom website development",
        "provider": {
          "@type": "Organization",
          "name": "Opplexify",
          "url": "https://opplexify.com"
        },
        "url": "https://opplexify.com/services"
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "Service",
        "name": "SaaS platform development",
        "provider": {
          "@type": "Organization",
          "name": "Opplexify",
          "url": "https://opplexify.com"
        },
        "url": "https://opplexify.com/services"
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "Service",
        "name": "Dashboard and admin panel development",
        "provider": {
          "@type": "Organization",
          "name": "Opplexify",
          "url": "https://opplexify.com"
        },
        "url": "https://opplexify.com/services"
      }
    },
    {
      "@type": "ListItem",
      "position": 4,
      "item": {
        "@type": "Service",
        "name": "Mobile app development",
        "provider": {
          "@type": "Organization",
          "name": "Opplexify",
          "url": "https://opplexify.com"
        },
        "url": "https://opplexify.com/services"
      }
    },
    {
      "@type": "ListItem",
      "position": 5,
      "item": {
        "@type": "Service",
        "name": "Backend/API development",
        "provider": {
          "@type": "Organization",
          "name": "Opplexify",
          "url": "https://opplexify.com"
        },
        "url": "https://opplexify.com/services"
      }
    },
    {
      "@type": "ListItem",
      "position": 6,
      "item": {
        "@type": "Service",
        "name": "Automation and integrations",
        "provider": {
          "@type": "Organization",
          "name": "Opplexify",
          "url": "https://opplexify.com"
        },
        "url": "https://opplexify.com/services"
      }
    }
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://opplexify.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Services",
      "item": "https://opplexify.com/services"
    }
  ]
}
```

### Service detail — Service + BreadcrumbList

`/services/[slug]`

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Custom Website Development",
  "description": "Responsive business websites with clear service pages, contact paths, and SEO foundations.",
  "url": "https://opplexify.com/services/custom-website-development",
  "provider": {
    "@type": "Organization",
    "name": "Opplexify",
    "url": "https://opplexify.com"
  },
  "serviceType": "Custom Website Development",
  "areaServed": "Worldwide"
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://opplexify.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Services",
      "item": "https://opplexify.com/services"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Custom Website Development",
      "item": "https://opplexify.com/services/custom-website-development"
    }
  ]
}
```

### Pricing — OfferCatalog + BreadcrumbList

`/pricing`

```json
{
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  "name": "Opplexify development packages",
  "url": "https://opplexify.com/pricing",
  "itemListElement": [
    {
      "@type": "Offer",
      "position": 1,
      "name": "Simple Website",
      "description": "A concise, responsive, SEO-friendly business website designed for credibility, lead capture, and clear service presentation. Starting from $150; typical timeline 1-3 weeks.",
      "category": "5 Page Presence",
      "url": "https://opplexify.com/pricing",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "USD",
        "minPrice": 150
      },
      "itemOffered": {
        "@type": "Service",
        "name": "Simple Website",
        "serviceType": "Software development",
        "provider": {
          "@type": "Organization",
          "name": "Opplexify",
          "url": "https://opplexify.com"
        }
      }
    },
    {
      "@type": "Offer",
      "position": 2,
      "name": "Complete Web Application",
      "description": "A full-stack web application with authentication, dashboards, APIs, database integration, and structured workflows. Starting from $500; typical timeline 3-8 weeks.",
      "category": "Full-Stack App",
      "url": "https://opplexify.com/pricing",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "USD",
        "minPrice": 500
      },
      "itemOffered": {
        "@type": "Service",
        "name": "Complete Web Application",
        "serviceType": "Software development",
        "provider": {
          "@type": "Organization",
          "name": "Opplexify",
          "url": "https://opplexify.com"
        }
      }
    },
    {
      "@type": "Offer",
      "position": 3,
      "name": "Complete SaaS Solution",
      "description": "A scalable SaaS development foundation with product workflows, admin controls, database models, and subscription-ready architecture. Starting from $1,000; typical timeline 6-12 weeks.",
      "category": "Subscription-Ready",
      "url": "https://opplexify.com/pricing",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "USD",
        "minPrice": 1000
      },
      "itemOffered": {
        "@type": "Service",
        "name": "Complete SaaS Solution",
        "serviceType": "Software development",
        "provider": {
          "@type": "Organization",
          "name": "Opplexify",
          "url": "https://opplexify.com"
        }
      }
    },
    {
      "@type": "Offer",
      "position": 4,
      "name": "Mobile App with Admin Dashboard",
      "description": "A mobile application connected to a secure backend API and an operational admin dashboard for real business workflows. Starting from $1,500; typical timeline 5-10 weeks.",
      "category": "App Plus Control Room",
      "url": "https://opplexify.com/pricing",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "USD",
        "minPrice": 1500
      },
      "itemOffered": {
        "@type": "Service",
        "name": "Mobile App with Admin Dashboard",
        "serviceType": "Software development",
        "provider": {
          "@type": "Organization",
          "name": "Opplexify",
          "url": "https://opplexify.com"
        }
      }
    },
    {
      "@type": "Offer",
      "position": 5,
      "name": "Complete Mobile App + Web App",
      "description": "A coordinated mobile app, web app, API, database, and admin dashboard system for a complete digital product launch. Starting from $2,000; typical timeline 8-16 weeks.",
      "category": "Complete Product Suite",
      "url": "https://opplexify.com/pricing",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "USD",
        "minPrice": 2000
      },
      "itemOffered": {
        "@type": "Service",
        "name": "Complete Mobile App + Web App",
        "serviceType": "Software development",
        "provider": {
          "@type": "Organization",
          "name": "Opplexify",
          "url": "https://opplexify.com"
        }
      }
    }
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://opplexify.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Pricing",
      "item": "https://opplexify.com/pricing"
    }
  ]
}
```

### Blog list — Blog + BreadcrumbList

`/blog`

```json
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Opplexify Web Development Blog",
  "url": "https://opplexify.com/blog",
  "description": "Articles about SEO-friendly websites, SaaS development, web applications, mobile apps, admin dashboards, backend APIs, and product launches.",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Opplexify",
    "url": "https://opplexify.com"
  }
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://opplexify.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://opplexify.com/blog"
    }
  ]
}
```

### Blog detail — BlogPosting + BreadcrumbList

`/blog/[slug]`

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "How to Build an SEO-Friendly Business Website That Converts",
  "description": "A practical guide to service pages, headings, metadata, internal links, page speed, and lead capture for a business website.",
  "image": "https://opplexify.com/portfolio/thumbs/portfolio-001.webp",
  "datePublished": "2026-05-30T00:00:00.000Z",
  "dateModified": "2026-06-20T00:00:00.000Z",
  "inLanguage": "en",
  "author": {
    "@type": "Person",
    "name": "Opplexify LLC",
    "url": "https://opplexify.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Opplexify",
    "url": "https://opplexify.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://opplexify.com/template-assets/dark/assets/imgs/logo/opplexify-logo-full.png"
    }
  },
  "mainEntityOfPage": "https://opplexify.com/blog/seo-friendly-business-website-guide"
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://opplexify.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://opplexify.com/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "How to Build an SEO-Friendly Business Website That Converts",
      "item": "https://opplexify.com/blog/seo-friendly-business-website-guide"
    }
  ]
}
```

### Work list — CollectionPage + BreadcrumbList

`/work`

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Opplexify LLC private project work",
  "url": "https://opplexify.com/work",
  "description": "Private client work summaries for websites, SaaS platforms, mobile apps, dashboards, backend APIs, and automation projects. Details are available upon request.",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Opplexify",
    "url": "https://opplexify.com"
  }
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://opplexify.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Work",
      "item": "https://opplexify.com/work"
    }
  ]
}
```

### Work detail — CreativeWork + BreadcrumbList

`/work/[slug]`

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Private SaaS UI Sample",
  "description": "A private SaaS product interface sample.",
  "image": "https://opplexify.com/portfolio/thumbs/portfolio-001.webp",
  "url": "https://opplexify.com/work/private-saas-ui-sample",
  "creator": {
    "@type": "Organization",
    "name": "Opplexify",
    "url": "https://opplexify.com"
  },
  "keywords": [
    "website development",
    "SaaS development",
    "web app development",
    "mobile app development",
    "admin dashboard"
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://opplexify.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Work",
      "item": "https://opplexify.com/work"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Private SaaS UI Sample",
      "item": "https://opplexify.com/work/private-saas-ui-sample"
    }
  ]
}
```

### Team list — CollectionPage + BreadcrumbList

`/team`

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Opplexify LLC founder",
  "url": "https://opplexify.com/team",
  "description": "Founder and ownership information for Opplexify LLC, a Wyoming-formed software development company.",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Opplexify",
    "url": "https://opplexify.com"
  }
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://opplexify.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Team",
      "item": "https://opplexify.com/team"
    }
  ]
}
```

### Team detail — Person + BreadcrumbList

`/team/[slug]`

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Muhammad Emmad Khan",
  "jobTitle": "Founder and Owner",
  "description": "Founder and owner of Opplexify LLC.",
  "image": "https://opplexify.com/team/emmad-khan.webp",
  "worksFor": {
    "@type": "Organization",
    "name": "Opplexify",
    "legalName": "Opplexify LLC",
    "url": "https://opplexify.com"
  },
  "url": "https://opplexify.com/team/muhammad-emmad-khan"
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://opplexify.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Team",
      "item": "https://opplexify.com/team"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Muhammad Emmad Khan",
      "item": "https://opplexify.com/team/muhammad-emmad-khan"
    }
  ]
}
```

### Portfolio — CollectionPage + BreadcrumbList

`/portfolio`

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Opplexify web development portfolio",
  "url": "https://opplexify.com/portfolio",
  "description": "Selected Opplexify LLC portfolio visuals for websites, SaaS interfaces, mobile app screens, dashboards, and business software. Private client details are available upon request.",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Opplexify",
    "url": "https://opplexify.com"
  }
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://opplexify.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Portfolio",
      "item": "https://opplexify.com/portfolio"
    }
  ]
}
```

### About — AboutPage + BreadcrumbList

`/about`

```json
{
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Opplexify LLC",
  "url": "https://opplexify.com/about",
  "description": "Opplexify LLC helps businesses plan, design, and build websites, SaaS platforms, dashboards, backend systems, APIs, mobile apps, and workflow automations.",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Opplexify",
    "url": "https://opplexify.com"
  },
  "about": {
    "@type": "Organization",
    "name": "Opplexify",
    "legalName": "Opplexify LLC",
    "url": "https://opplexify.com",
    "sameAs": [
      "https://www.linkedin.com/company/opplexify-llc/"
    ],
    "address": "Business mailing address: 525 Randall Ave Ste 100 PMB 1203, Cheyenne, WY 82001, United States"
  }
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://opplexify.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "About",
      "item": "https://opplexify.com/about"
    }
  ]
}
```

### Contact — ContactPage + BreadcrumbList

`/contact`

```json
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Opplexify",
  "url": "https://opplexify.com/contact",
  "description": "Contact Opplexify LLC for custom website, SaaS, mobile app, dashboard, backend API, and automation development inquiries.",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Opplexify",
    "url": "https://opplexify.com"
  },
  "mainEntity": {
    "@type": "Organization",
    "name": "Opplexify",
    "legalName": "Opplexify LLC",
    "url": "https://opplexify.com",
    "email": "admin@opplexify.com",
    "telephone": "+1 (307) 443-5144",
    "sameAs": [
      "https://www.linkedin.com/company/opplexify-llc/"
    ],
    "address": "Business mailing address: 525 Randall Ave Ste 100 PMB 1203, Cheyenne, WY 82001, United States"
  }
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://opplexify.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Contact",
      "item": "https://opplexify.com/contact"
    }
  ]
}
```

### FAQ — FAQPage + BreadcrumbList

`/faq`

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "url": "https://opplexify.com/faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What services does Opplexify LLC provide?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Opplexify LLC provides custom website development, SaaS platform development, dashboard and admin panel development, mobile app development, backend/API development, and automation and integration services."
      }
    },
    {
      "@type": "Question",
      "name": "Is Opplexify LLC a registered US company?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Opplexify LLC is a Wyoming-formed limited liability company. For business verification or compliance inquiries, contact admin@opplexify.com."
      }
    },
    {
      "@type": "Question",
      "name": "How does a project start?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A project usually starts with a short discovery discussion, written scope, estimated timeline, and proposal. Work begins after the scope, deposit, and billing terms are confirmed."
      }
    }
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://opplexify.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "FAQ",
      "item": "https://opplexify.com/faq"
    }
  ]
}
```

---

## Coverage summary

| Schema type | Where |
|---|---|
| Organization (with hasOfferCatalog) | every page |
| WebSite | every page |
| WebPage | / |
| ItemList | /services |
| Service | /services/[slug] |
| OfferCatalog (priced) | /pricing + Organization |
| Blog | /blog |
| BlogPosting | /blog/[slug] |
| CollectionPage | /work, /team, /portfolio |
| CreativeWork | /work/[slug] |
| Person | /team/[slug] |
| AboutPage | /about |
| ContactPage | /contact |
| FAQPage | /faq |
| BreadcrumbList | all detail routes + 9 list/static pages |

_Note: sitelinks are generated by Google from site structure & internal links — schema cannot force them. Google has retired the Sitelinks Searchbox and limits FAQ/HowTo rich results to a narrow set of sites; this markup still drives breadcrumbs, entity understanding, and AI/answer-engine visibility._
