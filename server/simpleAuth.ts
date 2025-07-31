import type { Express, RequestHandler } from "express";
import session from "express-session";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

// Simple authentication for development
export function setupSimpleAuth(app: Express) {
  app.use(session({
    secret: 'dev-secret-key-for-optistore-pro',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  }));

  // Simple login endpoint
  app.get("/api/login", (req, res) => {
    // Mock user session
    (req.session as any).user = {
      id: "45761289",
      email: "admin@optistorepro.com",
      firstName: "Admin",
      lastName: "User",
      profileImageUrl: "/api/placeholder/40/40"
    };
    res.redirect("/");
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });

  // Google OAuth endpoints (mock for development)
  app.get("/api/auth/google", (req, res) => {
    // Mock Google OAuth login
    (req.session as any).user = {
      id: "google-" + Date.now(),
      email: "user@gmail.com",  
      firstName: "Google",
      lastName: "User",
      profileImageUrl: "/api/placeholder/40/40"
    };
    res.redirect("/");
  });

  app.get("/api/auth/google/callback", (req, res) => {
    res.redirect("/");
  });

  // Auth status endpoint
  app.get('/api/auth/user', (req, res) => {
    const user = (req.session as any)?.user;
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    res.json(user);
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const user = (req.session as any)?.user;
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Add user to request for other routes to use
  (req as any).user = {
    claims: {
      sub: user.id,
      email: user.email
    }
  };
  
  return next();
};