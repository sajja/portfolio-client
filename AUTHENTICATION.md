# Authentication Setup

This application uses client credentials authentication with your backend API.

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```bash
# Copy the example file
cp .env.example .env
```

Required environment variables:

- `VITE_AUTH_CLIENT_ID`: Your API client ID
- `VITE_AUTH_CLIENT_SECRET`: Your API client secret  
- `VITE_API_BASE_URL`: Base URL for your API (default: http://localhost:3000)

## How Authentication Works

1. **App Startup**: Authentication is initialized when the app loads
2. **Token Request**: POST request to `/auth/token` with client credentials
3. **Token Caching**: Bearer token is cached with automatic expiry management
4. **API Calls**: All API requests automatically include the bearer token
5. **Auto-Refresh**: Token is automatically refreshed if a 401 response is received

## Authentication Flow

```javascript
// Automatic authentication - handled by AuthService
POST /auth/token
{
  "client_id": "your-client-id",
  "client_secret": "your-client-secret", 
  "grant_type": "client_credentials"
}

// Response
{
  "access_token": "bearer-token",
  "expires_in": 3600
}

// All subsequent API calls include:
Authorization: Bearer {access_token}
```

## Usage in Components

```javascript
import authService from '../services/AuthService';

// Make authenticated API calls
const response = await authService.makeAuthenticatedRequest('api/v1/portfolio/equity');
```

## Error Handling

- If authentication fails, errors are logged but the app continues to function
- Individual API calls will show appropriate error messages
- The system gracefully handles missing credentials or network issues

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- Use different credentials for different environments (dev/staging/production)