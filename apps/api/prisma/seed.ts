import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { portfolioProjects } from "./portfolio-data";

const prisma = new PrismaClient();

const pricing = [
  {
    key: "simple-website",
    name: "Simple Website",
    price: 149,
    label: "5 page presence",
    description: "A concise, responsive business website designed for credibility, lead capture, and clear service presentation.",
    timeline: "4-7 days",
    features: ["5 responsive pages", "Contact form", "Foundational SEO", "Performance-focused structure"]
  },
  {
    key: "complete-web-app",
    name: "Complete Web Application",
    price: 499,
    label: "Full-stack app",
    description: "A full-stack web application with authentication, dashboards, APIs, and structured data workflows.",
    timeline: "2-3 weeks",
    features: ["Authentication", "User dashboard", "Backend API", "Database integration"]
  },
  {
    key: "complete-saas",
    name: "Complete SaaS Solution",
    price: 999,
    label: "Subscription-ready",
    description: "A scalable SaaS foundation with product workflows, admin controls, and subscription-ready architecture.",
    timeline: "3-5 weeks",
    features: ["SaaS platform", "Admin dashboard", "Subscription-ready structure", "Database and API"]
  },
  {
    key: "mobile-admin",
    name: "Mobile App with Admin Dashboard",
    price: 1200,
    label: "App plus control room",
    description: "A mobile application connected to a secure API and an operational admin dashboard.",
    timeline: "4-6 weeks",
    features: ["Mobile app", "Admin dashboard", "Backend API", "Push notification-ready"]
  },
  {
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

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);

  await prisma.user.upsert({
    where: {
      email: "admin@opplexify.dev"
    },
    update: {
      passwordHash,
      name: "Opplexify Admin"
    },
    create: {
      email: "admin@opplexify.dev",
      passwordHash,
      name: "Opplexify Admin"
    }
  });

  for (const item of pricing) {
    await prisma.pricingPackage.upsert({
      where: {
        key: item.key
      },
      update: item,
      create: item
    });
  }

  await prisma.portfolioProject.deleteMany();

  for (const project of portfolioProjects) {
    await prisma.portfolioProject.upsert({
      where: {
        slug: project.slug
      },
      update: project,
      create: project
    });
  }

  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: {
        name: testimonial.name
      }
    });

    if (existing) {
      await prisma.testimonial.update({
        where: {
          id: existing.id
        },
        data: testimonial
      });
    } else {
      await prisma.testimonial.create({
        data: testimonial
      });
    }
  }

  const contactCount = await prisma.contactMessage.count();
  if (contactCount === 0) {
    await prisma.contactMessage.create({
      data: {
        name: "Demo Client",
        email: "client@example.com",
        phone: "+1 555 0100",
        projectType: "SaaS",
        budget: "$700 - $1200",
        message: "I need a SaaS dashboard with auth, billing-ready structure, and admin tools."
      }
    });
  }

  const quoteCount = await prisma.quoteRequest.count();
  if (quoteCount === 0) {
    await prisma.quoteRequest.create({
      data: {
        name: "Demo Founder",
        email: "founder@example.com",
        phone: "+1 555 0199",
        projectType: "Mobile + Web App",
        features: ["Authentication", "Admin Dashboard", "Notifications"],
        timeline: "Standard",
        budget: "$1200 - $2000",
        message: "I want to launch a connected mobile and web product.",
        recommendedPackage: "Complete Mobile App + Web App",
        estimatedPrice: 1864
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
