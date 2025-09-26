# Production Environment Setup - Port 8080

## Overview
This document outlines the production environment configuration for OptiManage, specifically configured to run exclusively on **port 8080**.

## Port Configuration

### Production Server
- **Port**: 8080 (production default)
- **Development Port**: 5001 (development fallback)
- **Environment Variable**: `NODE_ENV=production`

### Server Configuration
The server automatically detects the environment and assigns the appropriate port:

```typescript
// server/index.ts
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : (NODE_ENV === 'production' ? 8080 : 5001);
```

## Starting the Production Server

### Command
```bash
NODE_ENV=production npx tsx server/index.ts
```

### Expected Output
```
🚀 Server running on port 8080
📱 Environment: production
🔗 Database: [Connection Status]
```

## Unified Appointment System

### Consolidated Components
The appointment system has been unified to use only:
- **AppointmentsUnified.tsx** - Main appointment management component
- **Removed duplicate forms**:
  - ~~ModernAppointmentForm.tsx~~
  - ~~CompactAppointmentForm.tsx~~
  - ~~ComprehensiveAppointmentForm.tsx~~

### Access URLs
- **Main Appointments**: http://localhost:8080/appointments
- **Patient Portal**: http://localhost:8080/patient-portal/appointments
- **API Endpoints**: http://localhost:8080/api/medical-appointments

## Key Features

### Real-time Coupon Validation
- Endpoint: `POST /api/coupons/validate`
- Business rules enforcement
- Sample coupons available for testing

### Appointment Management
- Unified interface for all appointment operations
- Patient-specific and general views
- Modern UI with consistent styling

## Environment Variables

### Required for Production
```bash
NODE_ENV=production
PORT=8080  # Optional - defaults to 8080 in production
DATABASE_URL=your_database_connection_string
```

## Troubleshooting

### Port Conflicts
If port 8080 is already in use:
1. Stop other services using port 8080
2. Or set a custom port: `PORT=8081 NODE_ENV=production npx tsx server/index.ts`

### Database Connection
Ensure `DATABASE_URL` environment variable is properly configured for production use.

## Security Notes

### Session Storage Warning
The current setup uses MemoryStore for sessions, which is not recommended for production. Consider implementing:
- Redis session store
- Database session storage
- JWT tokens for stateless authentication

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `DATABASE_URL`
- [ ] Ensure port 8080 is available
- [ ] Test appointment system functionality
- [ ] Verify coupon validation system
- [ ] Check all API endpoints
- [ ] Monitor server logs for errors

---

**Last Updated**: January 2025  
**Server Configuration**: Port 8080 (Production Default)  
**Appointment System**: Unified (AppointmentsUnified.tsx only)