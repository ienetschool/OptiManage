/**
 * OptiStore Pro - Configuration File
 * 
 * This file contains all server configuration settings including:
 * - Database connection settings
 * - Domain and server configuration  
 * - Environment variables
 * - Deployment settings
 */

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  poolMin: number;
  poolMax: number;
}

export interface ServerConfig {
  port: number;
  host: string;
  environment: 'development' | 'production' | 'staging';
  cors: {
    origin: string[];
    credentials: boolean;
  };
  session: {
    secret: string;
    secure: boolean;
    maxAge: number;
  };
}

export interface DomainConfig {
  primaryDomain: string;
  allowedDomains: string[];
  ssl: {
    enabled: boolean;
    certPath?: string;
    keyPath?: string;
  };
  cdn?: {
    enabled: boolean;
    baseUrl: string;
  };
}

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun';
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
  };
  mailgun?: {
    domain: string;
    apiKey: string;
  };
  from: {
    name: string;
    email: string;
  };
}

export interface OptiStoreConfig {
  database: DatabaseConfig;
  server: ServerConfig;
  domain: DomainConfig;
  email: EmailConfig;
  features: {
    enableRegistration: boolean;
    enableSMS: boolean;
    enablePayments: boolean;
    enableInventoryTracking: boolean;
    enableReports: boolean;
  };
  limits: {
    maxUsers: number;
    maxStores: number;
    maxProducts: number;
    maxCustomers: number;
    fileUploadSizeMB: number;
  };
}

// Development Configuration
const developmentConfig: OptiStoreConfig = {
  database: {
    type: 'postgresql',
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    database: process.env.PGDATABASE || 'optistore',
    username: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    ssl: false,
    poolMin: 2,
    poolMax: 10,
  },
  server: {
    port: parseInt(process.env.PORT || '5000'),
    host: process.env.HOST || '0.0.0.0',
    environment: 'development',
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5000'],
      credentials: true,
    },
    session: {
      secret: process.env.SESSION_SECRET || 'dev-secret-key',
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
  domain: {
    primaryDomain: 'localhost:5000',
    allowedDomains: ['localhost:5000', 'localhost:3000'],
    ssl: {
      enabled: false,
    },
  },
  email: {
    provider: 'smtp',
    smtp: {
      host: 'localhost',
      port: 1025,
      secure: false,
      auth: {
        user: '',
        pass: '',
      },
    },
    from: {
      name: 'OptiStore Pro',
      email: 'noreply@optistore.local',
    },
  },
  features: {
    enableRegistration: true,
    enableSMS: false,
    enablePayments: false,
    enableInventoryTracking: true,
    enableReports: true,
  },
  limits: {
    maxUsers: 100,
    maxStores: 10,
    maxProducts: 10000,
    maxCustomers: 5000,
    fileUploadSizeMB: 10,
  },
};

// Production Configuration Template
const productionConfig: OptiStoreConfig = {
  database: {
    type: 'postgresql', // or 'mysql'
    host: process.env.DATABASE_HOST || 'your-database-host.com',
    port: parseInt(process.env.DATABASE_PORT || '5432'), // 3306 for MySQL
    database: process.env.DATABASE_NAME || 'optistore_prod',
    username: process.env.DATABASE_USER || 'optistore_user',
    password: process.env.DATABASE_PASSWORD || 'your-secure-password',
    ssl: true,
    poolMin: 5,
    poolMax: 20,
  },
  server: {
    port: parseInt(process.env.PORT || '8080'),
    host: '0.0.0.0',
    environment: 'production',
    cors: {
      origin: [
        'https://yourdomain.com',
        'https://www.yourdomain.com',
        'https://admin.yourdomain.com'
      ],
      credentials: true,
    },
    session: {
      secret: process.env.SESSION_SECRET || 'your-super-secure-session-secret',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },
  domain: {
    primaryDomain: process.env.PRIMARY_DOMAIN || 'yourdomain.com',
    allowedDomains: [
      'yourdomain.com',
      'www.yourdomain.com',
      'admin.yourdomain.com'
    ],
    ssl: {
      enabled: true,
      certPath: '/path/to/ssl/cert.pem',
      keyPath: '/path/to/ssl/private.key',
    },
    cdn: {
      enabled: true,
      baseUrl: 'https://cdn.yourdomain.com',
    },
  },
  email: {
    provider: 'sendgrid', // or 'smtp' or 'mailgun'
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || 'your-sendgrid-api-key',
    },
    from: {
      name: 'OptiStore Pro',
      email: 'noreply@yourdomain.com',
    },
  },
  features: {
    enableRegistration: false, // Disable registration in production
    enableSMS: true,
    enablePayments: true,
    enableInventoryTracking: true,
    enableReports: true,
  },
  limits: {
    maxUsers: 1000,
    maxStores: 50,
    maxProducts: 100000,
    maxCustomers: 50000,
    fileUploadSizeMB: 50,
  },
};

// Staging Configuration
const stagingConfig: OptiStoreConfig = {
  ...productionConfig,
  server: {
    ...productionConfig.server,
    environment: 'staging',
    cors: {
      origin: [
        'https://staging.yourdomain.com',
        'https://staging-admin.yourdomain.com'
      ],
      credentials: true,
    },
  },
  domain: {
    ...productionConfig.domain,
    primaryDomain: 'staging.yourdomain.com',
    allowedDomains: [
      'staging.yourdomain.com',
      'staging-admin.yourdomain.com'
    ],
  },
  features: {
    ...productionConfig.features,
    enableRegistration: true, // Enable for testing
  },
};

// Export the appropriate configuration based on environment
const getConfig = (): OptiStoreConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    case 'development':
    default:
      return developmentConfig;
  }
};

export const config = getConfig();

// Helper functions for common configuration tasks
export const getDatabaseUrl = (): string => {
  const { database: db } = config;
  
  if (db.type === 'postgresql') {
    return `postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}${db.ssl ? '?sslmode=require' : ''}`;
  } else {
    return `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}${db.ssl ? '?ssl=true' : ''}`;
  }
};

export const getServerUrl = (): string => {
  const { server, domain } = config;
  const protocol = domain.ssl.enabled ? 'https' : 'http';
  return `${protocol}://${domain.primaryDomain}`;
};

export const isFeatureEnabled = (feature: keyof OptiStoreConfig['features']): boolean => {
  return config.features[feature];
};

export const getEmailConfig = () => {
  return config.email;
};

export const getCorsOrigins = (): string[] => {
  return config.server.cors.origin;
};

// Environment-specific overrides
export const applyEnvironmentOverrides = (overrides: Partial<OptiStoreConfig>): OptiStoreConfig => {
  return {
    ...config,
    ...overrides,
    database: {
      ...config.database,
      ...(overrides.database || {}),
    },
    server: {
      ...config.server,
      ...(overrides.server || {}),
    },
    domain: {
      ...config.domain,
      ...(overrides.domain || {}),
    },
    email: {
      ...config.email,
      ...(overrides.email || {}),
    },
    features: {
      ...config.features,
      ...(overrides.features || {}),
    },
    limits: {
      ...config.limits,
      ...(overrides.limits || {}),
    },
  };
};

// Configuration validation
export const validateConfig = (): boolean => {
  const { database, server, domain } = config;
  
  // Validate required database fields
  if (!database.host || !database.database || !database.username) {
    console.error('Database configuration is incomplete');
    return false;
  }
  
  // Validate server configuration
  if (!server.port || server.port < 1 || server.port > 65535) {
    console.error('Invalid server port configuration');
    return false;
  }
  
  // Validate domain configuration in production
  if (config.server.environment === 'production') {
    if (!domain.primaryDomain || domain.primaryDomain === 'localhost') {
      console.error('Production domain configuration is required');
      return false;
    }
    
    if (!config.server.session.secret || config.server.session.secret === 'dev-secret-key') {
      console.error('Secure session secret is required in production');
      return false;
    }
  }
  
  return true;
};

// Export default configuration
export default config;