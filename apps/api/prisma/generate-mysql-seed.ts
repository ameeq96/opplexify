import { writeFileSync } from "node:fs";
import { join } from "node:path";
import * as bcrypt from "bcryptjs";
import { portfolioProjects } from "./portfolio-data";

const now = "2026-01-01 00:00:00.000";
const adminPassword = "ChangeMe123!";

const pricing = [
  {
    id: "pricing-simple-website",
    key: "simple-website",
    name: "Simple Website",
    price: 149,
    label: "5 page presence",
    description: "A concise, responsive business website designed for credibility, lead capture, and clear service presentation.",
    timeline: "4-7 days",
    features: ["5 responsive pages", "Contact form", "Foundational SEO", "Performance-focused structure"]
  },
  {
    id: "pricing-complete-web-app",
    key: "complete-web-app",
    name: "Complete Web Application",
    price: 499,
    label: "Full-stack app",
    description: "A full-stack web application with authentication, dashboards, APIs, and structured data workflows.",
    timeline: "2-3 weeks",
    features: ["Authentication", "User dashboard", "Backend API", "Database integration"]
  },
  {
    id: "pricing-complete-saas",
    key: "complete-saas",
    name: "Complete SaaS Solution",
    price: 999,
    label: "Subscription-ready",
    description: "A scalable SaaS foundation with product workflows, admin controls, and subscription-ready architecture.",
    timeline: "3-5 weeks",
    features: ["SaaS platform", "Admin dashboard", "Subscription-ready structure", "Database and API"]
  },
  {
    id: "pricing-mobile-admin",
    key: "mobile-admin",
    name: "Mobile App with Admin Dashboard",
    price: 1200,
    label: "App plus control room",
    description: "A mobile application connected to a secure API and an operational admin dashboard.",
    timeline: "4-6 weeks",
    features: ["Mobile app", "Admin dashboard", "Backend API", "Push notification-ready"]
  },
  {
    id: "pricing-mobile-web",
    key: "mobile-web",
    name: "Complete Mobile App + Web App",
    price: 1699,
    label: "Complete product suite",
    description: "A coordinated mobile, web, API, database, and admin system for a complete digital product launch.",
    timeline: "6-8 weeks",
    features: ["Mobile app", "Web app", "Admin dashboard", "Complete full-stack solution"]
  }
];

const testimonials = [
  {
    id: "testimonial-ayan-malik",
    name: "Ayan Malik",
    role: "Founder, CareDesk",
    quote: "The project scope was clear from the beginning, and the dashboard was structured around the way our team actually works."
  },
  {
    id: "testimonial-sara-khan",
    name: "Sara Khan",
    role: "Operations Lead",
    quote: "The final system gave our operations team a cleaner way to manage daily work and reduce manual coordination."
  },
  {
    id: "testimonial-hamza-r",
    name: "Hamza R.",
    role: "Startup Owner",
    quote: "The visual quality was strong, and the backend structure made the handoff straightforward and easy to maintain."
  }
];

function sqlString(value: string) {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
}

function sqlValue(value: unknown) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value) || typeof value === "object") {
    return sqlString(JSON.stringify(value));
  }

  return sqlString(String(value));
}

function insert(table: string, row: Record<string, unknown>) {
  const columns = Object.keys(row);
  const values = columns.map((column) => sqlValue(row[column]));
  const updates = columns
    .filter((column) => column !== "id" && column !== "createdAt")
    .map((column) => `\`${column}\` = VALUES(\`${column}\`)`);

  return [
    `INSERT INTO \`${table}\` (${columns.map((column) => `\`${column}\``).join(", ")})`,
    `VALUES (${values.join(", ")})`,
    `ON DUPLICATE KEY UPDATE ${updates.join(", ")};`
  ].join("\n");
}

const adminPasswordHash = bcrypt.hashSync(adminPassword, 12);

const statements = [
  "-- Opplexify seed data",
  "-- Import apps/api/prisma/mysql-schema.sql first, then import this file.",
  "-- Demo admin email: admin@opplexify.dev",
  "-- Demo admin password: ChangeMe123!",
  "SET NAMES utf8mb4;",
  "START TRANSACTION;",
  insert("User", {
    id: "user-admin",
    email: "admin@opplexify.dev",
    passwordHash: adminPasswordHash,
    name: "Opplexify Admin",
    role: "admin",
    createdAt: now,
    updatedAt: now
  }),
  ...pricing.map((item) =>
    insert("PricingPackage", {
      ...item,
      createdAt: now,
      updatedAt: now
    })
  ),
  ...portfolioProjects.map((project) =>
    insert("PortfolioProject", {
      id: `portfolio-${project.slug}`,
      ...project,
      createdAt: now,
      updatedAt: now
    })
  ),
  ...testimonials.map((testimonial) =>
    insert("Testimonial", {
      ...testimonial,
      createdAt: now,
      updatedAt: now
    })
  ),
  insert("ContactMessage", {
    id: "contact-demo-client",
    name: "Demo Client",
    email: "client@example.com",
    phone: "+1 555 0100",
    projectType: "SaaS",
    budget: "$700 - $1200",
    message: "I need a SaaS dashboard with auth, billing-ready structure, and admin tools.",
    createdAt: now
  }),
  insert("QuoteRequest", {
    id: "quote-demo-founder",
    name: "Demo Founder",
    email: "founder@example.com",
    phone: "+1 555 0199",
    projectType: "Mobile + Web App",
    features: ["Authentication", "Admin Dashboard", "Notifications"],
    timeline: "Standard",
    budget: "$1200 - $2000",
    message: "I want to launch a connected mobile and web product.",
    recommendedPackage: "Complete Mobile App + Web App",
    estimatedPrice: 1864,
    createdAt: now
  }),
  "COMMIT;"
];

writeFileSync(join(__dirname, "mysql-seed.sql"), `${statements.join("\n\n")}\n`);
