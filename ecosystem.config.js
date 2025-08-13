module.exports = {
  apps: [
    {
      name: "optistore-pro",
      script: "dist/index.js",
      env: {
        NODE_ENV: "production",
        PORT: "5000",
        DATABASE_URL: "postgresql://ledbpt_opt:Ra4#PdaqW0c^pa8c@localhost:5432/ieopt",
        COMPANY_NAME: "OptiStore Pro",
        ADMIN_EMAIL: "admin@opt.vivaindia.com",
        DOMAIN: "https://opt.vivaindia.com",
        SESSION_SECRET: "OptiStore-Pro-2025-Secret"
      }
    }
  ]
};