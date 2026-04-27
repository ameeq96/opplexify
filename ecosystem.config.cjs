module.exports = {
  apps: [
    {
      name: "opplexify-web",
      script: "server.web.cjs",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: process.env.WEB_PORT || "3003",
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
        DB_CONNECTION: process.env.DB_CONNECTION || "mysql",
        DB_HOST: process.env.DB_HOST || "localhost",
        DB_PORT: process.env.DB_PORT || "3306",
        DB_DATABASE: process.env.DB_DATABASE || "database_name",
        DB_USERNAME: process.env.DB_USERNAME || "database_user",
        DB_PASSWORD: process.env.DB_PASSWORD || "database_password",
        JWT_SECRET: process.env.JWT_SECRET || "replace-with-a-long-random-production-secret",
        FRONTEND_URL: process.env.FRONTEND_URL || "https://opplexify.com,https://www.opplexify.com"
      }
    }
  ]
};
