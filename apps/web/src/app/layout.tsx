import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Opplexify Product Lab | Websites, SaaS, Web Apps and Mobile Apps",
    template: "%s | Opplexify Product Lab"
  },
  description:
    "Premium software development agency for websites, web applications, SaaS platforms, mobile apps, admin dashboards, and full-stack product systems.",
  openGraph: {
    title: "Opplexify Product Lab",
    description: "Build professional digital products with Next.js, NestJS, Prisma, and production-ready architecture.",
    url: "https://opplexify.dev",
    siteName: "Opplexify Product Lab",
    images: [
      {
        url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=82",
        width: 1200,
        height: 630,
        alt: "Modern software product lab workspace"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  metadataBase: new URL("https://opplexify.dev")
};

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var dark = stored ? stored === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  } catch (error) {}
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
