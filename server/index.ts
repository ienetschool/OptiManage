import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupCouponTables } from "./setup-coupon-tables";
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Add cache-busting headers for API routes
  if (path.startsWith("/api")) {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  } as any;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize coupon system tables without blocking server startup
  setupCouponTables()
    .then(() => {
      console.log('✅ Coupon system initialized successfully');
    })
    .catch((error) => {
      console.error('❌ Failed to initialize coupon system:', error);
    });
  
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  
  // Serve the app on configurable port (default 8080 for both production and development)
  // this serves both the API and the client.
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
  const DATABASE_URL = process.env.DATABASE_URL;
  console.log(`DEBUG: DATABASE_URL is ${DATABASE_URL}`);
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${NODE_ENV}`);
    console.log(`🔗 Database: ${DATABASE_URL ? 'Connected' : 'Not configured'}`);
  });

  // Check if static files exist to determine if we should use production mode
  const staticFilesExist = fs.existsSync(path.resolve(process.cwd(), "dist/public"));
  const useProductionMode = process.env.FORCE_PRODUCTION === 'true' || staticFilesExist;
  
  if (app.get("env") === "development" && !useProductionMode) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });

  return server;
})();
