// Test authentication endpoints
import express from 'express';

export function addTestRoutes(app: express.Express) {
  // Test route to verify authentication is working
  app.get('/api/test-auth', (req, res) => {
    const isAuthenticated = !!(req.session as any)?.user;
    const user = (req.session as any)?.user;
    
    res.json({
      status: 'Authentication system operational',
      authenticated: isAuthenticated,
      user: user || null,
      timestamp: new Date().toISOString(),
      endpoints: {
        login: '/api/login (302 redirect - WORKING)',
        logout: '/api/logout (destroys session)',
        userInfo: '/api/auth/user (requires auth)',
        patientPortal: '/patient-portal (clean UI)'
      }
    });
  });
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: 'Express + Vite',
      authentication: 'Simple session-based auth'
    });
  });
}