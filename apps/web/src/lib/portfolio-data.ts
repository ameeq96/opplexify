import type { PortfolioProject } from "./data";

type PortfolioEntry = {
  slug: string;
  title: string;
  category: string;
  image: string;
  focus: string;
};

const portfolioEntries: PortfolioEntry[] = [
  {
    slug: "tess7-career-transition",
    title: "Tess7 Career Transition Website",
    category: "Service Website",
    image: "/portfolio/upwork/01-001.png",
    focus: "lead capture, service explanation, and credibility-focused page structure"
  },
  {
    slug: "you-fill-dumpster-rental",
    title: "You-Fill Dumpster Rental",
    category: "Service Website",
    image: "/portfolio/upwork/01-002.png",
    focus: "local service positioning, quote flow, and location-based customer trust"
  },
  {
    slug: "xuma-social-networking-app",
    title: "Xuma Social Networking App",
    category: "Mobile App",
    image: "/portfolio/upwork/01-003.png",
    focus: "app landing presentation, feature storytelling, and download conversion"
  },
  {
    slug: "wec-civil-engineering-website",
    title: "WEC Civil Engineering Website",
    category: "Business Website",
    image: "/portfolio/upwork/02-004.png",
    focus: "professional company positioning, service clarity, and inquiry generation"
  },
  {
    slug: "vintage-and-vibes-gallery",
    title: "Vintage and Vibes Gallery",
    category: "Portfolio Website",
    image: "/portfolio/upwork/02-005.png",
    focus: "visual gallery presentation, brand mood, and collection browsing"
  },
  {
    slug: "vitals-immigration-consultant",
    title: "Vitals Immigration Consultant",
    category: "Business Website",
    image: "/portfolio/upwork/02-006.png",
    focus: "consultation paths, service credibility, and conversion-ready content"
  },
  {
    slug: "run-a-vin-check",
    title: "Run A VIN Check",
    category: "Web Application",
    image: "/portfolio/upwork/03-007.png",
    focus: "vehicle lookup presentation, user guidance, and result-oriented flow"
  },
  {
    slug: "energy-utilities-service-provider",
    title: "Energy and Utilities Service Provider",
    category: "Business Website",
    image: "/portfolio/upwork/03-008.png",
    focus: "enterprise service communication, technical trust, and structured pages"
  },
  {
    slug: "dancing-light-show",
    title: "Dancing Light Show",
    category: "Entertainment Website",
    image: "/portfolio/upwork/03-009.png",
    focus: "event visuals, media discovery, and audience engagement"
  },
  {
    slug: "tiny-tot-screen-lock",
    title: "Tiny Tot Screen Lock",
    category: "Mobile App",
    image: "/portfolio/upwork/04-010.png",
    focus: "product benefits, mobile screens, and parent-focused onboarding"
  },
  {
    slug: "luxury-spa-website",
    title: "Luxury Spa Website",
    category: "Service Website",
    image: "/portfolio/upwork/04-011.png",
    focus: "wellness service presentation, calm browsing, and booking-ready sections"
  },
  {
    slug: "the-angry-baker",
    title: "The Angry Baker",
    category: "Restaurant Website",
    image: "/portfolio/upwork/04-012.png",
    focus: "food brand identity, menu presentation, and location-focused conversion"
  },
  {
    slug: "professional-office-organization",
    title: "Professional Office Organization",
    category: "Service Website",
    image: "/portfolio/upwork/05-013.png",
    focus: "service packages, visual proof, and inquiry-oriented page design"
  },
  {
    slug: "wellness-care-website",
    title: "Wellness Care Website",
    category: "Healthcare Website",
    image: "/portfolio/upwork/05-014.png",
    focus: "care services, patient trust, and clear consultation pathways"
  },
  {
    slug: "personalized-pet-tags-store",
    title: "Personalized Pet Tags Store",
    category: "E-commerce",
    image: "/portfolio/upwork/05-015.png",
    focus: "product catalog clarity, pet-owner trust, and purchase-ready layout"
  },
  {
    slug: "sidz-automotive-website",
    title: "Sidz Automotive Website",
    category: "Automotive Website",
    image: "/portfolio/upwork/06-016.png",
    focus: "automotive services, product highlights, and high-contrast conversion design"
  },
  {
    slug: "stemworld-educational-services",
    title: "Stemworld Educational Services",
    category: "Education Website",
    image: "/portfolio/upwork/06-017.png",
    focus: "program presentation, education pathways, and student-focused sections"
  },
  {
    slug: "sir-travons-gourmet-cuisine",
    title: "Sir Travon's Gourmet Cuisine",
    category: "Restaurant Website",
    image: "/portfolio/upwork/06-018.png",
    focus: "culinary storytelling, menu discovery, and premium food presentation"
  },
  {
    slug: "second-chance-sanitizer",
    title: "Second Chance Sanitizer",
    category: "Service Website",
    image: "/portfolio/upwork/07-019.png",
    focus: "sanitizing services, safety messaging, and clear inquiry flow"
  },
  {
    slug: "app-landing-page-design",
    title: "App Landing Page Design",
    category: "Landing Page",
    image: "/portfolio/upwork/08-020.png",
    focus: "mobile app value proposition, screen previews, and app-store conversion"
  },
  {
    slug: "smart-choice-home-healthcare",
    title: "Smart Choice Home Healthcare",
    category: "Healthcare Website",
    image: "/portfolio/upwork/08-021.png",
    focus: "home-care services, trust signals, and family-focused consultation flow"
  },
  {
    slug: "fitness-motivation-app",
    title: "Fitness Motivation App",
    category: "Mobile App",
    image: "/portfolio/upwork/10-022.png",
    focus: "fitness app positioning, motivation features, and subscription-ready sections"
  },
  {
    slug: "puppy-pooper-pick-up",
    title: "Puppy Pooper Pick Up",
    category: "Pet Service Website",
    image: "/portfolio/upwork/10-023.png",
    focus: "pet service explanation, local trust, and booking-oriented content"
  },
  {
    slug: "global-business-awards",
    title: "Global Business Awards",
    category: "Event Website",
    image: "/portfolio/upwork/10-024.png",
    focus: "award showcase, event credibility, and sponsor-ready presentation"
  },
  {
    slug: "dream-body-fitness-website",
    title: "Dream Body Fitness Website",
    category: "Fitness Website",
    image: "/portfolio/upwork/11-025.png",
    focus: "fitness transformation messaging, program sections, and visual proof"
  },
  {
    slug: "hospitality-property-website",
    title: "Hospitality Property Website",
    category: "Business Website",
    image: "/portfolio/upwork/11-026.png",
    focus: "property presentation, service confidence, and professional content hierarchy"
  },
  {
    slug: "financial-services-website",
    title: "Financial Services Website",
    category: "Finance Website",
    image: "/portfolio/upwork/11-027.png",
    focus: "financial expertise, service breakdowns, and trust-building content"
  },
  {
    slug: "ohana-cleaning-services",
    title: "Ohana Cleaning Services",
    category: "Service Website",
    image: "/portfolio/upwork/12-028.png",
    focus: "cleaning service packages, quote capture, and friendly brand presentation"
  },
  {
    slug: "towing-services-website",
    title: "Towing Services Website",
    category: "Service Website",
    image: "/portfolio/upwork/12-029.png",
    focus: "emergency service messaging, phone-led conversion, and service area clarity"
  },
  {
    slug: "haiti-book-landing-page",
    title: "Haiti Book Landing Page",
    category: "Landing Page",
    image: "/portfolio/upwork/12-030.png",
    focus: "book promotion, author credibility, and focused sales-page flow"
  },
  {
    slug: "community-organization-website",
    title: "Community Organization Website",
    category: "Nonprofit Website",
    image: "/portfolio/upwork/13-031.png",
    focus: "mission storytelling, community programs, and donation-ready structure"
  },
  {
    slug: "dry-bones-academics",
    title: "Dry Bones Academics",
    category: "Education Website",
    image: "/portfolio/upwork/13-032.png",
    focus: "learning programs, enrollment guidance, and academic credibility"
  },
  {
    slug: "dougherty-engraving-services",
    title: "Dougherty Engraving Services",
    category: "Service Website",
    image: "/portfolio/upwork/13-033.png",
    focus: "engraving services, product examples, and quote-ready presentation"
  },
  {
    slug: "digi-puzzle-game-app",
    title: "DIGI Puzzle Game App",
    category: "Mobile App",
    image: "/portfolio/upwork/14-034.png",
    focus: "game landing visuals, feature explanation, and playful conversion design"
  },
  {
    slug: "compliance-services-website",
    title: "Compliance Services Website",
    category: "Business Website",
    image: "/portfolio/upwork/14-035.png",
    focus: "regulated-service credibility, profile sections, and lead generation"
  },
  {
    slug: "executive-speaker-website",
    title: "Executive Speaker Website",
    category: "Personal Brand Website",
    image: "/portfolio/upwork/14-036.png",
    focus: "authority positioning, speaking profile, and conversion-focused sections"
  },
  {
    slug: "house-call-massage-website",
    title: "House Call Massage Website",
    category: "Healthcare Website",
    image: "/portfolio/upwork/15-037.png",
    focus: "therapy services, appointment intent, and calm mobile-friendly layout"
  },
  {
    slug: "blue-star-digitalis",
    title: "Blue Star Digitalis",
    category: "Creative Agency Website",
    image: "/portfolio/upwork/15-038.png",
    focus: "digital service positioning, portfolio visuals, and agency-grade structure"
  },
  {
    slug: "pet-junkies-website",
    title: "Pet Junkies Website",
    category: "Pet Brand Website",
    image: "/portfolio/upwork/15-039.png",
    focus: "brand storytelling, product-style sections, and pet-owner engagement"
  },
  {
    slug: "black-jeep-bandit",
    title: "Black Jeep Bandit",
    category: "Automotive Website",
    image: "/portfolio/upwork/16-040.png",
    focus: "vehicle lifestyle branding, media sections, and community-focused design"
  },
  {
    slug: "tv-cable-packages-website",
    title: "TV Cable Packages Website",
    category: "Service Website",
    image: "/portfolio/upwork/16-041.png",
    focus: "package comparison, provider trust, and conversion-ready service pages"
  },
  {
    slug: "bane-industries-llc",
    title: "Bane Industries LLC",
    category: "Industrial Website",
    image: "/portfolio/upwork/16-042.png",
    focus: "industrial capability presentation, credentials, and vendor trust"
  },
  {
    slug: "washington-ballet",
    title: "Washington Ballet",
    category: "Arts Website",
    image: "/portfolio/upwork/17-043.png",
    focus: "program visibility, registration content, and elegant visual presentation"
  },
  {
    slug: "auto-top-design",
    title: "Auto Top Design",
    category: "Automotive Website",
    image: "/portfolio/upwork/17-044.png",
    focus: "auto service branding, dark visual system, and quote-ready sections"
  },
  {
    slug: "window-treatment-services",
    title: "Window Treatment Services",
    category: "Home Services Website",
    image: "/portfolio/upwork/17-045.png",
    focus: "home service education, product categories, and consultation conversion"
  },
  {
    slug: "fast-home-sale-landing-page",
    title: "Fast Home Sale Landing Page",
    category: "Real Estate Website",
    image: "/portfolio/upwork/18-046.png",
    focus: "seller lead capture, property value messaging, and trust-building layout"
  },
  {
    slug: "next-door-property-management",
    title: "Next Door Property Management",
    category: "Real Estate Website",
    image: "/portfolio/upwork/18-047.png",
    focus: "property management services, owner trust, and organized content sections"
  },
  {
    slug: "mts-demolition-contractor",
    title: "MTS Demolition Contractor",
    category: "Construction Website",
    image: "/portfolio/upwork/18-048.png",
    focus: "contractor credibility, project services, and direct inquiry paths"
  },
  {
    slug: "mommakers-tv",
    title: "MomMakers TV",
    category: "Media Website",
    image: "/portfolio/upwork/19-0001.png",
    focus: "media content presentation, audience trust, and episode discovery"
  },
  {
    slug: "matt-nelson-sports-portfolio",
    title: "Matt Nelson Sports Portfolio",
    category: "Personal Brand Website",
    image: "/portfolio/upwork/19-0002.png",
    focus: "sports media profile, highlight galleries, and personal brand authority"
  },
  {
    slug: "american-immigration-services",
    title: "American Immigration Services",
    category: "Legal Service Website",
    image: "/portfolio/upwork/19-0003.png",
    focus: "immigration service clarity, attorney credibility, and contact conversion"
  },
  {
    slug: "travel-course-alerts-website",
    title: "Travel Course Alerts Website",
    category: "Travel Website",
    image: "/portfolio/upwork/20-0004.png",
    focus: "destination content, trip discovery, and alert-driven user engagement"
  },
  {
    slug: "wooden-interior-installation",
    title: "Wooden Interior Installation",
    category: "Interior Website",
    image: "/portfolio/upwork/20-0005.png",
    focus: "interior service visuals, project proof, and lead-focused sections"
  },
  {
    slug: "industrial-company-website",
    title: "Industrial Company Website",
    category: "Industrial Website",
    image: "/portfolio/upwork/20-0006.png",
    focus: "industrial capability, service sectors, and corporate trust"
  },
  {
    slug: "traffic-management-consulting",
    title: "Traffic Management Consulting",
    category: "Consulting Website",
    image: "/portfolio/upwork/21-0007.png",
    focus: "consulting expertise, service programs, and structured inquiry paths"
  },
  {
    slug: "fast-internet-provider",
    title: "Fast Internet Provider",
    category: "Telecom Website",
    image: "/portfolio/upwork/21-0008.png",
    focus: "provider services, plan comparison, and residential lead generation"
  },
  {
    slug: "tattoo-artist-portfolio",
    title: "Tattoo Artist Portfolio",
    category: "Portfolio Website",
    image: "/portfolio/upwork/21-0009.png",
    focus: "artist identity, image galleries, and appointment-focused storytelling"
  },
  {
    slug: "gourmet-popcorn-store",
    title: "Gourmet Popcorn Store",
    category: "E-commerce",
    image: "/portfolio/upwork/22-0010.png",
    focus: "seasonal products, catalog discovery, and purchase-ready presentation"
  },
  {
    slug: "security-access-control-website",
    title: "Security Access Control Website",
    category: "Security Website",
    image: "/portfolio/upwork/22-0011.png",
    focus: "security service trust, technical capability, and consultation conversion"
  },
  {
    slug: "hubble-app-landing-page",
    title: "Hubble App Landing Page",
    category: "Mobile App",
    image: "/portfolio/upwork/22-0012.png",
    focus: "app value proposition, product screens, and pricing-ready presentation"
  },
  {
    slug: "interior-design-website",
    title: "Interior Design Website",
    category: "Interior Website",
    image: "/portfolio/upwork/23-0013.png",
    focus: "interior portfolio browsing, project highlights, and consultation intent"
  },
  {
    slug: "bible-app-landing-page",
    title: "Bible App Landing Page",
    category: "Mobile App",
    image: "/portfolio/upwork/23-0014.png",
    focus: "faith-based app positioning, screen previews, and download conversion"
  },
  {
    slug: "creative-app-showcase",
    title: "Creative App Showcase",
    category: "Mobile App",
    image: "/portfolio/upwork/23-0015.png",
    focus: "mobile product visuals, feature explanation, and modern app marketing"
  },
  {
    slug: "good-shepherd-transportation",
    title: "Good Shepherd Transportation",
    category: "Transportation Website",
    image: "/portfolio/upwork/24-0016.png",
    focus: "fleet services, route confidence, and contact-ready layout"
  },
  {
    slug: "cleaning-services-website",
    title: "Cleaning Services Website",
    category: "Service Website",
    image: "/portfolio/upwork/24-0017.png",
    focus: "cleaning packages, residential trust, and quote-focused presentation"
  },
  {
    slug: "better-tomorrow-agriculture",
    title: "Better Tomorrow Agriculture Website",
    category: "Agriculture Website",
    image: "/portfolio/upwork/24-0018.png",
    focus: "sustainable product storytelling, farm visuals, and brand credibility"
  },
  {
    slug: "fitness-arena-app",
    title: "Fitness Arena App",
    category: "Mobile App",
    image: "/portfolio/upwork/25-0019.png",
    focus: "fitness app presentation, training features, and download conversion"
  },
  {
    slug: "healthcare-it-solution",
    title: "Healthcare IT Solution",
    category: "Healthcare Website",
    image: "/portfolio/upwork/25-0020.png",
    focus: "healthcare platform trust, service explanation, and technical clarity"
  },
  {
    slug: "lively-consulting-website",
    title: "Lively Consulting Website",
    category: "Consulting Website",
    image: "/portfolio/upwork/25-0021.png",
    focus: "consultant profile, service structure, and professional lead capture"
  },
  {
    slug: "best-design-practices-book",
    title: "Best Design Practices Book",
    category: "Landing Page",
    image: "/portfolio/upwork/26-0022.png",
    focus: "book promotion, author profile, and single-goal conversion design"
  },
  {
    slug: "event-design-website",
    title: "Event Design Website",
    category: "Event Website",
    image: "/portfolio/upwork/26-0023.png",
    focus: "event visuals, service packages, and celebration-focused storytelling"
  },
  {
    slug: "remodeling-services-website",
    title: "Remodeling Services Website",
    category: "Home Services Website",
    image: "/portfolio/upwork/26-0024.png",
    focus: "home improvement services, project categories, and inquiry flow"
  },
  {
    slug: "ashleigh-rental-properties",
    title: "Ashleigh Rental Properties",
    category: "Real Estate Website",
    image: "/portfolio/upwork/27-0025.png",
    focus: "rental listings, property gallery, and leasing inquiry paths"
  },
  {
    slug: "dental-assistant-academy",
    title: "Dental Assistant Academy",
    category: "Education Website",
    image: "/portfolio/upwork/27-0026.png",
    focus: "program explanation, student trust, and enrollment-focused sections"
  },
  {
    slug: "pet-cbd-store",
    title: "Pet CBD Store",
    category: "E-commerce",
    image: "/portfolio/upwork/27-0027.png",
    focus: "wellness product browsing, trust content, and shop-ready product sections"
  },
  {
    slug: "fashion-boutique-quick-shop",
    title: "Fashion Boutique Quick Shop",
    category: "E-commerce",
    image: "/portfolio/upwork/28-0028.png",
    focus: "fashion catalog browsing, quick shop behavior, and collection highlights"
  },
  {
    slug: "soul-tailored-store",
    title: "Soul Tailored Store",
    category: "E-commerce",
    image: "/portfolio/upwork/28-0029.png",
    focus: "apparel catalog layout, category discovery, and polished shopping flow"
  },
  {
    slug: "apparel-storefront",
    title: "Apparel Storefront",
    category: "E-commerce",
    image: "/portfolio/upwork/28-0030.png",
    focus: "new arrivals, product grids, and retail brand presentation"
  },
  {
    slug: "motorcycle-apparel-store",
    title: "Motorcycle Apparel Store",
    category: "E-commerce",
    image: "/portfolio/upwork/29-0031.png",
    focus: "lifestyle product browsing, apparel categories, and strong campaign visuals"
  },
  {
    slug: "new-style-collection",
    title: "New Style Collection",
    category: "E-commerce",
    image: "/portfolio/upwork/29-0032.png",
    focus: "fashion collection launches, product tiles, and editorial shopping design"
  },
  {
    slug: "nishane-perfume-store",
    title: "Nishane Perfume Store",
    category: "E-commerce",
    image: "/portfolio/upwork/29-0033.png",
    focus: "premium product presentation, fragrance catalog, and clean purchase paths"
  },
  {
    slug: "street-fashion-store",
    title: "Street Fashion Store",
    category: "E-commerce",
    image: "/portfolio/upwork/30-0034.png",
    focus: "streetwear campaign design, product galleries, and collection browsing"
  },
  {
    slug: "milaa-fashion-store",
    title: "Milaa Fashion Store",
    category: "E-commerce",
    image: "/portfolio/upwork/30-0035.png",
    focus: "fashion storefront structure, brand mood, and shopping-ready product grids"
  },
  {
    slug: "mna-marketplace",
    title: "MNA Marketplace",
    category: "Marketplace",
    image: "/portfolio/upwork/30-0036.png",
    focus: "multi-category browsing, marketplace navigation, and promotion-led layout"
  },
  {
    slug: "fashion-sale-store",
    title: "Fashion Sale Store",
    category: "E-commerce",
    image: "/portfolio/upwork/31-0037.png",
    focus: "discount campaign design, apparel categories, and conversion-focused grids"
  },
  {
    slug: "asian-ginger-delights-store",
    title: "Asian Ginger Delights Store",
    category: "E-commerce",
    image: "/portfolio/upwork/31-0038.png",
    focus: "food product catalog, brand storytelling, and purchase-ready product pages"
  },
  {
    slug: "skincare-product-store",
    title: "Skincare Product Store",
    category: "E-commerce",
    image: "/portfolio/upwork/31-0039.png",
    focus: "beauty product merchandising, catalog clarity, and premium shopping flow"
  },
  {
    slug: "clothing-for-every-occasion",
    title: "Clothing For Every Occasion",
    category: "E-commerce",
    image: "/portfolio/upwork/32-0040.png",
    focus: "apparel category browsing, promotional content, and responsive shopping design"
  },
  {
    slug: "friends-portal",
    title: "Friends Portal",
    category: "Web Application",
    image: "/portfolio/upwork/33-0041.jpg",
    focus: "social portal structure, user-facing modules, and clean application navigation"
  },
  {
    slug: "report-management-dashboard",
    title: "Report Management Dashboard",
    category: "Admin Dashboard",
    image: "/portfolio/upwork/33-0042.jpg",
    focus: "report organization, admin workflows, and structured operational screens"
  },
  {
    slug: "product-video-walkthrough-1",
    title: "Product Video Walkthrough 1",
    category: "Video Showcase",
    image: "/portfolio/videos/portfolio-video-1.mp4",
    focus: "interactive product presentation, motion preview, and delivery walkthrough"
  },
  {
    slug: "product-video-walkthrough-2",
    title: "Product Video Walkthrough 2",
    category: "Video Showcase",
    image: "/portfolio/videos/portfolio-video-2.mp4",
    focus: "interactive product presentation, motion preview, and delivery walkthrough"
  },
  {
    slug: "product-video-walkthrough-3",
    title: "Product Video Walkthrough 3",
    category: "Video Showcase",
    image: "/portfolio/videos/portfolio-video-3.mp4",
    focus: "interactive product presentation, motion preview, and delivery walkthrough"
  },
  {
    slug: "product-video-walkthrough-4",
    title: "Product Video Walkthrough 4",
    category: "Video Showcase",
    image: "/portfolio/videos/portfolio-video-4.mp4",
    focus: "interactive product presentation, motion preview, and delivery walkthrough"
  }
];

const categoryStacks: Record<string, string[]> = {
  "Admin Dashboard": ["Next.js", "TypeScript", "Dashboard UI", "Data Workflows"],
  "Mobile App": ["Mobile UI", "App Landing", "Product UX", "Responsive Design"],
  "Web Application": ["Next.js", "TypeScript", "Application UI", "User Flows"],
  "E-commerce": ["Storefront UI", "Product Catalog", "Checkout-ready UX", "Responsive Design"],
  Marketplace: ["Marketplace UI", "Category Navigation", "Product Discovery", "Responsive Design"],
  "Video Showcase": ["Product Demo", "UI Motion", "Responsive Experience", "Client Presentation"]
};

function stackFor(category: string) {
  return categoryStacks[category] ?? ["Responsive UI", "Lead-focused UX", "SEO-ready Structure", "Professional Branding"];
}

function featuresFor(category: string) {
  if (category === "E-commerce" || category === "Marketplace") {
    return ["Product catalog", "Category browsing", "Conversion-focused layout", "Responsive storefront"];
  }

  if (category === "Mobile App") {
    return ["App screen showcase", "Feature sections", "Download-focused CTA", "Responsive landing page"];
  }

  if (category === "Web Application" || category === "Admin Dashboard") {
    return ["Application layout", "Structured navigation", "Dashboard-ready sections", "Responsive interface"];
  }

  if (category === "Video Showcase") {
    return ["Video walkthrough", "Product interaction preview", "Motion-based presentation", "Portfolio media showcase"];
  }

  return ["Professional page structure", "Service sections", "Lead capture path", "Responsive design"];
}

const orderedPortfolioEntries = [
  ...portfolioEntries.filter((entry) => entry.category === "Video Showcase"),
  ...portfolioEntries.filter((entry) => entry.category !== "Video Showcase")
];

export const portfolioProjects: PortfolioProject[] = orderedPortfolioEntries.map((entry) => ({
  slug: entry.slug,
  title: entry.title,
  category: entry.category,
  summary: `A real portfolio project for ${entry.title}, focused on ${entry.focus}.`,
  problem: "The project needed a polished digital presence that could communicate value quickly and make the next action clear for visitors.",
  solution: "The interface was structured with clear sections, responsive layouts, professional visuals, and conversion-focused calls to action.",
  result: "The final presentation gives the brand a cleaner, more credible portfolio presence with a layout clients can understand quickly.",
  image: entry.image,
  tech: stackFor(entry.category),
  features: featuresFor(entry.category),
  liveUrl: "",
  githubUrl: ""
}));
