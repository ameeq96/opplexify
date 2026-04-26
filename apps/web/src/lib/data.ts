import {
  BadgeDollarSign,
  Boxes,
  BrainCircuit,
  ChartNoAxesCombined,
  Code2,
  DatabaseZap,
  LayoutDashboard,
  MonitorSmartphone,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles
} from "lucide-react";

export type ProjectType = "Website" | "Web App" | "SaaS" | "Mobile App" | "Mobile + Web App";
export type Timeline = "Standard" | "Fast Delivery";

export type PricingPackage = {
  id: string;
  name: string;
  price: number;
  label: string;
  description: string;
  timeline: string;
  features: string[];
};

export type PortfolioProject = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  problem: string;
  solution: string;
  result: string;
  image: string;
  tech: string[];
  features: string[];
  liveUrl: string;
  githubUrl: string;
};

export const pricingPackages: PricingPackage[] = [
  {
    id: "simple-website",
    name: "Simple Website",
    price: 149,
    label: "5 page presence",
    description: "A concise, responsive business website designed for credibility, lead capture, and clear service presentation.",
    timeline: "4-7 days",
    features: ["5 responsive pages", "Contact form", "Foundational SEO", "Performance-focused structure"]
  },
  {
    id: "complete-web-app",
    name: "Complete Web Application",
    price: 499,
    label: "Full-stack app",
    description: "A full-stack web application with authentication, dashboards, APIs, and structured data workflows.",
    timeline: "2-3 weeks",
    features: ["Authentication", "User dashboard", "Backend API", "Database integration"]
  },
  {
    id: "complete-saas",
    name: "Complete SaaS Solution",
    price: 999,
    label: "Subscription-ready",
    description: "A scalable SaaS foundation with product workflows, admin controls, and subscription-ready architecture.",
    timeline: "3-5 weeks",
    features: ["SaaS platform", "Admin dashboard", "Subscription-ready structure", "Database and API"]
  },
  {
    id: "mobile-admin",
    name: "Mobile App with Admin Dashboard",
    price: 1200,
    label: "App plus control room",
    description: "A mobile application connected to a secure API and an operational admin dashboard.",
    timeline: "4-6 weeks",
    features: ["Mobile app", "Admin dashboard", "Backend API", "Push notification-ready"]
  },
  {
    id: "mobile-web",
    name: "Complete Mobile App + Web App",
    price: 1699,
    label: "Complete product suite",
    description: "A coordinated mobile, web, API, database, and admin system for a complete digital product launch.",
    timeline: "6-8 weeks",
    features: ["Mobile app", "Web app", "Admin dashboard", "Complete full-stack solution"]
  }
];

export const services = [
  {
    title: "Web Applications",
    description: "Custom portals, dashboards, booking systems, internal tools, and business workflow applications.",
    icon: MonitorSmartphone
  },
  {
    title: "Business Websites",
    description: "Responsive brand websites built to communicate trust, services, and conversion paths clearly.",
    icon: Sparkles
  },
  {
    title: "SaaS Platforms",
    description: "Product foundations with authentication, database models, admin views, and scalable API architecture.",
    icon: Boxes
  },
  {
    title: "Mobile Apps",
    description: "Mobile experiences connected to secure APIs, admin workflows, and notification-ready foundations.",
    icon: Smartphone
  },
  {
    title: "Admin Dashboards",
    description: "Operational dashboards for managing content, users, requests, orders, and business reporting.",
    icon: LayoutDashboard
  },
  {
    title: "Backend Systems",
    description: "NestJS APIs, Prisma schemas, relational databases, JWT authentication, and maintainable backend structure.",
    icon: DatabaseZap
  }
];

export const labSignals = [
  { label: "Products shipped", value: "35+" },
  { label: "Starting packages", value: "$149" },
  { label: "Core stack", value: "Next + Nest" },
  { label: "Delivery path", value: "Scope -> Build" }
];

export const process = [
  {
    title: "Discovery",
    description: "Project goals, user flows, core screens, data requirements, and delivery priorities are defined before development begins.",
    icon: BrainCircuit
  },
  {
    title: "Development",
    description: "Frontend, backend, database, admin tools, and integrations are implemented as one cohesive product system.",
    icon: Code2
  },
  {
    title: "Launch",
    description: "The final product is reviewed across devices, connected to real data, and prepared for a confident handoff.",
    icon: Rocket
  }
];

export { portfolioProjects } from "./portfolio-data";

export const testimonials = [
  {
    name: "Ayan Malik",
    role: "Founder, CareDesk",
    quote: "The project scope was clear from the beginning, and the dashboard was structured around the way our team actually works."
  },
  {
    name: "Sara Khan",
    role: "Operations Lead",
    quote: "The final system gave our operations team a cleaner way to manage daily work and reduce manual coordination."
  },
  {
    name: "Hamza R.",
    role: "Startup Owner",
    quote: "The visual quality was strong, and the backend structure made the handoff straightforward and easy to maintain."
  }
];

export const featureOptions = [
  "Authentication",
  "Admin Dashboard",
  "Payment Integration",
  "Booking System",
  "Chat",
  "Notifications",
  "API Integration"
];

export function estimateProject(projectType: ProjectType, features: string[], timeline: Timeline) {
  const basePackage =
    projectType === "Website"
      ? pricingPackages[0]
      : projectType === "Web App"
        ? pricingPackages[1]
        : projectType === "SaaS"
          ? pricingPackages[2]
          : projectType === "Mobile App"
            ? pricingPackages[3]
            : pricingPackages[4];

  const featureLift = features.length * 55;
  const fastLift = timeline === "Fast Delivery" ? Math.round(basePackage.price * 0.2) : 0;
  const startingPrice = basePackage.price + featureLift + fastLift;

  const suggested = Array.from(
    new Set([
      ...basePackage.features,
      ...features,
      projectType === "Website" ? "Lead generation flow" : "Product analytics"
    ])
  ).slice(0, 7);

  return {
    packageName: basePackage.name,
    startingPrice,
    timeline: timeline === "Fast Delivery" ? "Priority delivery window" : basePackage.timeline,
    suggested
  };
}

export const trustStack = [
  { label: "Secure architecture", icon: ShieldCheck },
  { label: "Clear pricing", icon: BadgeDollarSign },
  { label: "Measurable delivery", icon: ChartNoAxesCombined }
];
