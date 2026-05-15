import swaggerUi from "swagger-ui-express";

export const openApiDocument = {
  openapi: "3.0.0",
  info: {
    title: "Opplexify CMS API",
    description: "Dynamic API for the Opplexify Next.js frontend and admin dashboard.",
    version: "1.0.0"
  },
  paths: {
    "/health": { get: { summary: "Health check" } },
    "/auth/login": { post: { summary: "Admin login" } },
    "/auth/me": { get: { summary: "Current admin profile" } },
    "/public/site": { get: { summary: "Public site settings and menus" } },
    "/public/pages/{slug}": { get: { summary: "Public CMS page" } },
    "/public/services": { get: { summary: "Public services" } },
    "/public/projects": { get: { summary: "Public projects" } },
    "/public/portfolio-items": { get: { summary: "Public portfolio items" } },
    "/public/blog": { get: { summary: "Public blog posts" } },
    "/public/team": { get: { summary: "Public team members" } },
    "/public/faqs": { get: { summary: "Public FAQs" } },
    "/public/testimonials": { get: { summary: "Public testimonials" } },
    "/public/contact": { post: { summary: "Create contact message" } },
    "/admin/dashboard": { get: { summary: "Admin dashboard stats" } },
    "/admin/{resource}": { get: { summary: "List resource" }, post: { summary: "Create resource" } },
    "/admin/{resource}/{id}": {
      get: { summary: "Find resource" },
      patch: { summary: "Update resource" },
      delete: { summary: "Delete resource" }
    },
    "/admin/media/upload": { post: { summary: "Upload media" } }
  }
};

export const docsAssets = swaggerUi.serve;
export const docsHandler = swaggerUi.setup(openApiDocument, {
  customSiteTitle: "Swagger UI",
  swaggerOptions: {
    url: "/docs/openapi.json"
  }
});
