// src/services/apiClient.js
import {
  getApiBaseUrl,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUT,
} from "../config/apiConfig";

class ApiClient {
  constructor() {
    this.baseURL = getApiBaseUrl();
    this.defaultHeaders = { ...DEFAULT_HEADERS };
  }

  /**
   * Build complete URL with base URL and endpoint
   */
  buildUrl(endpoint, params = {}) {
    const url = new URL(this.baseURL + endpoint);

    // Add query parameters
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    return url.toString();
  }

  /**
   * Generic request method
   */
  async request(endpoint, options = {}) {
    const {
      method = "GET",
      data = null,
      params = {},
      headers = {},
      timeout = REQUEST_TIMEOUT,
    } = options;

    const url = this.buildUrl(endpoint, params);

    const config = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      // เปลี่ยนจาก 'include' เป็น 'same-origin' หรือ 'omit'
      credentials: "omit", // ไม่ส่ง cookies/credentials
    };

    // Add body for POST, PUT, PATCH requests
    if (data && ["POST", "PUT", "PATCH"].includes(method)) {
      config.body = JSON.stringify(data);
    }

    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), timeout);
      });

      // Make the request
      const fetchPromise = fetch(url, config);
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Parse JSON response
      const result = await response.json();

      // Check for API-level errors
      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error(`API Request failed: ${method} ${url}`, error);

      // Re-throw with more context
      throw new Error(`API Error: ${error.message}`);
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}, options = {}) {
    return this.request(endpoint, {
      method: "GET",
      params,
      ...options,
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: "POST",
      data,
      ...options,
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: "PUT",
      data,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: "DELETE",
      ...options,
    });
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const response = await this.get("/auth.php", { action: "check" });
      return {
        success: true,
        message: "API connection successful",
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: `API connection failed: ${error.message}`,
        error,
      };
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export default ApiClient;
