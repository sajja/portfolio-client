import config from '../config/config.js';

class AuthService {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this.isAuthenticating = false;
    this.authPromise = null;
    
    // Validate configuration on initialization
    try {
      config.validateConfig();
    } catch (error) {
      console.error('Authentication configuration error:', error.message);
      // Don't throw here, allow app to start but authentication will fail gracefully
    }
  }

  async authenticate() {
    // If already authenticating, return the existing promise
    if (this.isAuthenticating && this.authPromise) {
      return this.authPromise;
    }

    // If we have a valid token, return it
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    // Start authentication process
    this.isAuthenticating = true;
    this.authPromise = this._performAuthentication();

    try {
      await this.authPromise;
      return this.token;
    } finally {
      this.isAuthenticating = false;
      this.authPromise = null;
    }
  }

  async _performAuthentication() {
    try {
      console.log('Authenticating with backend...');
      
      // Validate configuration before attempting authentication
      config.validateConfig();
      
      const response = await fetch(config.getAuthEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config.getAuthCredentials())
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('No access token received from server');
      }

      this.token = data.access_token;
      
      // Set expiry time (default to 1 hour if not provided)
      const expiresIn = data.expires_in || 3600; // seconds
      this.tokenExpiry = new Date(Date.now() + (expiresIn * 1000));
      
      console.log('Authentication successful, token cached');
      return this.token;
      
    } catch (error) {
      console.error('Authentication error:', error);
      this.token = null;
      this.tokenExpiry = null;
      throw error;
    }
  }

  async getAuthHeaders() {
    try {
      const token = await this.authenticate();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('Failed to get auth headers:', error);
      // Return basic headers without auth if authentication fails
      return {
        'Content-Type': 'application/json'
      };
    }
  }

  async makeAuthenticatedRequest(url, options = {}) {
    try {
      const authHeaders = await this.getAuthHeaders();
      
      // Convert relative URLs to absolute URLs using config
      const absoluteUrl = url.startsWith('http') ? url : config.getApiEndpoint(url);
      
      const requestOptions = {
        ...options,
        headers: {
          ...authHeaders,
          ...options.headers
        }
      };

      const response = await fetch(absoluteUrl, requestOptions);
      
      // If we get a 401, try to re-authenticate once
      if (response.status === 401 && this.token) {
        console.log('Token expired, re-authenticating...');
        this.token = null;
        this.tokenExpiry = null;
        
        const newAuthHeaders = await this.getAuthHeaders();
        const retryOptions = {
          ...options,
          headers: {
            ...newAuthHeaders,
            ...options.headers
          }
        };
        
        return fetch(absoluteUrl, retryOptions);
      }
      
      return response;
    } catch (error) {
      console.error('Authenticated request failed:', error);
      throw error;
    }
  }

  clearToken() {
    this.token = null;
    this.tokenExpiry = null;
    console.log('Authentication token cleared');
  }

  isAuthenticated() {
    return this.token && this.tokenExpiry && new Date() < this.tokenExpiry;
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;