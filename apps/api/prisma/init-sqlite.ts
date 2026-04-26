import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const statements = [
  `CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS PortfolioProject (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    problem TEXT NOT NULL,
    solution TEXT NOT NULL,
    result TEXT NOT NULL,
    image TEXT NOT NULL,
    tech TEXT NOT NULL,
    features TEXT NOT NULL,
    liveUrl TEXT NOT NULL,
    githubUrl TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS ContactMessage (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    projectType TEXT NOT NULL,
    budget TEXT NOT NULL,
    message TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS QuoteRequest (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    projectType TEXT NOT NULL,
    features TEXT NOT NULL,
    timeline TEXT NOT NULL,
    budget TEXT NOT NULL,
    message TEXT,
    recommendedPackage TEXT NOT NULL,
    estimatedPrice INTEGER NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS PricingPackage (
    id TEXT PRIMARY KEY NOT NULL,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    timeline TEXT NOT NULL,
    features TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS Testimonial (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    quote TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`
];

async function main() {
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
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
