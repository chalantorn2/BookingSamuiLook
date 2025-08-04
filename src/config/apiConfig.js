// src/config/apiConfig.js
export const API_CONFIG = {
  development: "https://samuilookbiz.com/api",
  production: "https://samuilookbiz.com/api",
};

export const getApiBaseUrl = () => {
  return import.meta.env.PROD ? API_CONFIG.production : API_CONFIG.development;
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: "/auth.php",

  // Information (Suppliers & Customers)
  INFORMATION: "/information.php",

  // Future endpoints
  TICKETS: "/tickets.php",
  REPORTS: "/reports.php",
};

// Request timeout (30 seconds)
export const REQUEST_TIMEOUT = 30000;

// Default headers
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
