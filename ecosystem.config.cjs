module.exports = {
  apps: [
    {
      name: "opplexify-web",
      script: "server.web.cjs",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: process.env.WEB_PORT || "3001",
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.opplexify.com/api"
      }
    },
    {
      name: "opplexify-api",
      script: "server.api.cjs",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: process.env.API_PORT || "4001",
        DATABASE_URL: process.env.DATABASE_URL || "mysql://database_user:database_password@localhost:3306/database_name",
        JWT_SECRET: process.env.JWT_SECRET || "replace-with-a-long-random-production-secret",
        FRONTEND_URL: process.env.FRONTEND_URL || "https://opplexify.com,https://www.opplexify.com"
      }
    }
  ]
};
