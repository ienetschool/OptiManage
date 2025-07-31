import type { Express, RequestHandler } from "express";
import session from "express-session";

// Simple authentication for development
export function setupSimpleAuth(app: Express) {
  app.use(session({
    secret: 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
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