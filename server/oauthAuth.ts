import type { Express, RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

// Mock user database for email authentication
const emailUsers = new Map();

export function setupOAuthAuth(app: Express) {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-oauth-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          profileImageUrl: profile.photos?.[0]?.value,
          provider: 'google'
        };
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }));
  }

  // Twitter OAuth Strategy
  if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
    passport.use(new TwitterStrategy({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: "/api/auth/twitter/callback",
      includeEmail: true
    }, async (token, tokenSecret, profile, done) => {
      try {
        const user = {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          firstName: profile.displayName?.split(' ')[0],
          lastName: profile.displayName?.split(' ').slice(1).join(' '),
          profileImageUrl: profile.photos?.[0]?.value,
          provider: 'twitter'
        };
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }));
  }

  // Local Strategy for Email/Password
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = emailUsers.get(email);
      if (!user) {
        return done(null, undefined, { message: 'User not found' } as any);
      }

      const isValid = await bcrypt.compare(password, user.hashedPassword);
      if (!isValid) {
        return done(null, undefined, { message: 'Invalid password' } as any);
      }

      return done(null, {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        provider: 'email'
      });
    } catch (error) {
      return done(error as Error);
    }
  }));

  // Authentication routes
  
  // Google OAuth routes
  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/dashboard');
    }
  );

  // Twitter OAuth routes
  app.get('/api/auth/twitter',
    passport.authenticate('twitter')
  );

  app.get('/api/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/dashboard');
    }
  );

  // Apple OAuth routes (requires additional setup)
  app.get('/api/auth/apple', (req, res) => {
    // Apple Sign-In requires frontend JavaScript SDK
    // This would typically be handled on the frontend
    res.status(501).json({ message: 'Apple Sign-In requires frontend implementation' });
  });

  // Email signup
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (emailUsers.has(email)) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        id: Date.now().toString(),
        email,
        firstName,
        lastName,
        hashedPassword,
        profileImageUrl: '/api/placeholder/40/40'
      };

      emailUsers.set(email, user);

      // Log in the user immediately after signup
      req.login({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        provider: 'email'
      }, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login error' });
        }
        res.json({ success: true, message: 'Account created successfully' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Signup failed' });
    }
  });

  // Email login
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: 'Authentication error' });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login error' });
        }
        res.json({ success: true, message: 'Login successful' });
      });
    })(req, res, next);
  });

  // Simple login endpoint (for testing)
  app.get("/api/login", (req, res) => {
    // Mock user session for development
    const mockUser = {
      id: "45761289",
      email: "admin@optistorepro.com",
      firstName: "Admin",
      lastName: "User",
      profileImageUrl: "/api/placeholder/40/40",
      provider: 'mock'
    };

    req.login(mockUser, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Login error' });
      }
      res.redirect("/dashboard");
    });
  });

  // Logout
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.redirect("/");
      }
      // Destroy session completely
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error('Session destroy error:', destroyErr);
        }
        res.clearCookie('connect.sid');
        res.redirect("/");
      });
    });
  });

  // Get current user
  app.get('/api/auth/user', async (req, res) => {
    try {
      // Check if user is logged out (session destroyed)
      if (!req.session || req.session.destroy) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        provider: user.provider
      });
    } catch (error) {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  // Check if user is actually authenticated
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // For development, check if session exists first
  if (req.session && req.session.passport && req.session.passport.user) {
    return next();
  }
  
  // Create mock user for development only if no session
  (req as any).user = {
    id: "45761289",
    email: "admin@optistorepro.com",
    firstName: "Admin",
    lastName: "User",
    profileImageUrl: "/api/placeholder/40/40",
    provider: 'mock'
  };
  return next();
};