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
  if ((req.session as any)?.user) {
    (req as any).user = {
      claims: {
        sub: (req.session as any).user.id,
        email: (req.session as any).user.email
      }
    };
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};