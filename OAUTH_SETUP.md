# OAuth Authentication Setup Guide

## Overview
The application now supports multiple authentication methods:
- **Google OAuth** - Sign in with Google
- **Twitter OAuth** - Sign in with Twitter
- **Apple Sign-In** - Sign in with Apple (requires frontend SDK)
- **Email/Password** - Traditional email signup and login
- **Quick Demo Login** - For testing purposes

## Required Environment Variables

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Add these environment variables:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### Twitter OAuth Setup
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Go to Keys and Tokens
4. Set callback URL: `http://localhost:5000/api/auth/twitter/callback`
5. Add these environment variables:
   ```
   TWITTER_CONSUMER_KEY=your_twitter_consumer_key
   TWITTER_CONSUMER_SECRET=your_twitter_consumer_secret
   ```

### Apple Sign-In Setup
Apple Sign-In requires additional frontend JavaScript SDK integration and is more complex to set up. The backend route is prepared but Apple authentication typically happens on the frontend.

### Session Security
Add a secure session secret:
```
SESSION_SECRET=your_secure_random_session_secret
```

## Authentication Endpoints

### OAuth Routes
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/twitter` - Initiate Twitter OAuth
- `GET /api/auth/twitter/callback` - Twitter OAuth callback

### Email Authentication
- `POST /api/auth/signup` - Create new account with email/password
- `POST /api/auth/login` - Login with email/password

### General Routes
- `GET /api/login` - Quick demo login (for testing)
- `GET /api/logout` - Logout from any authentication method
- `GET /api/auth/user` - Get current authenticated user

## Frontend Integration

The authentication page (`/login` or `/auth`) provides:
- **Sign In Tab**: Email/password login with OAuth buttons
- **Sign Up Tab**: Email/password registration with OAuth buttons
- **OAuth Buttons**: Google, Apple, Twitter authentication
- **Quick Demo**: Test authentication without setup

## Testing

### Without OAuth Setup
- Use the "Quick Demo Login" button for immediate access
- Test email signup/login functionality

### With OAuth Setup
1. Add the required environment variables
2. Restart the application
3. Test OAuth providers from the authentication page

## Security Features

- **Session Management**: Secure HTTP-only cookies
- **Password Hashing**: bcrypt for email authentication
- **CSRF Protection**: Built into session middleware
- **Secure Headers**: Implemented in session configuration

## User Experience

1. **Unauthenticated Users**: Redirected to authentication page
2. **Authentication Flow**: Choose provider → authenticate → redirect to dashboard
3. **Session Persistence**: Users remain logged in across browser sessions
4. **Logout**: Secure logout with session destruction

The system automatically handles user creation and session management for all authentication methods.