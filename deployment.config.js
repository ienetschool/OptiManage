/**
 * OptiStore Pro - Deployment Configuration
 * 
 * This file contains deployment-specific settings for different environments.
 * Copy this file and modify the values according to your deployment environment.
 */

module.exports = {
  // Development Environment
  development: {
    database: {
      type: 'postgresql', // or 'mysql'
      host: 'localhost',
      port: 5432,        // 3306 for MySQL
      database: 'optistore_dev',
      username: 'postgres',
      password: 'your_password',
      ssl: false,
    },
    server: {
      port: 5000,
      host: '0.0.0.0',
      domain: 'localhost:5000',
    },
    features: {
      enableRegistration: true,
      enablePayments: false,
      debugMode: true,
    }
  },

  // Production Environment
  production: {
    database: {
      type: 'postgresql', // Change to 'mysql' if using MySQL
      host: 'your-database-host.com',
      port: 5432,        // 3306 for MySQL
      database: 'optistore_prod',
      username: 'optistore_user',
      password: process.env.DATABASE_PASSWORD,
      ssl: true,
    },
    server: {
      port: process.env.PORT || 8080,
      host: '0.0.0.0',
      domain: 'yourdomain.com',
    },
    email: {
      provider: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: 'noreply@yourdomain.com',
      fromName: 'OptiStore Pro',
    },
    ssl: {
      enabled: true,
      certPath: '/path/to/ssl/cert.pem',
      keyPath: '/path/to/ssl/private.key',
    },
    features: {
      enableRegistration: false,
      enablePayments: true,
      debugMode: false,
    },
    limits: {
      maxUsers: 1000,
      maxStores: 50,
      maxProducts: 100000,
    }
  },

  // Staging Environment
  staging: {
    database: {
      type: 'postgresql',
      host: 'staging-db.yourdomain.com',
      port: 5432,
      database: 'optistore_staging',
      username: 'staging_user',
      password: process.env.STAGING_DB_PASSWORD,
      ssl: true,
    },
    server: {
      port: process.env.PORT || 8080,
      host: '0.0.0.0',
      domain: 'staging.yourdomain.com',
    },
    features: {
      enableRegistration: true,
      enablePayments: false,
      debugMode: true,
    }
  }
};