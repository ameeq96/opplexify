module.exports = {
  apps: [
    {
      name: "opplexify-web",
      script: "server.web.cjs",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: process.env.WEB_PORT || "3001",
        NEXT_PUBLIC_API_URL: "https://api.opplexify.com/api"
      }
    },
    {
      name: "opplexify-api",
      script: "server.api.cjs",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: process.env.API_PORT || "4001",
        DATABASE_URL: "file:./prod.db",
        FRONTEND_URL: "https://opplexify.com,https://www.opplexify.com"
      }
    }
  ]
};
