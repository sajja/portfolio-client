// Configuration helper for environment variables
class Config {
  constructor() {
    this.clientId = import.meta.env.VITE_AUTH_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_AUTH_CLIENT_SECRET;
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  // Validate required environment variables
  validateConfig() {
    const missingVars = [];
    
    if (!this.clientId) missingVars.push('VITE_AUTH_CLIENT_ID');
    if (!this.clientSecret) missingVars.push('VITE_AUTH_CLIENT_SECRET');
    
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}. ` +
        'Please check your .env file in the project root.'
      );
    }
  }

  // Get authentication endpoint
  getAuthEndpoint() {
    return `${this.apiBaseUrl}/auth/token`;
  }

  // Get API endpoint with base URL
  getApiEndpoint(path) {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.apiBaseUrl}/${cleanPath}`;
  }

  // Get authentication credentials
  getAuthCredentials() {
    return {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials'
    };
  }

  // Check if we're in development mode
  isDevelopment() {
    return import.meta.env.DEV;
  }

  // Check if we're in production mode
  isProduction() {
    return import.meta.env.PROD;
  }
}

// Create singleton instance
const config = new Config();

export default config;