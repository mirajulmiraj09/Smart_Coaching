/**
 * HTTP Request/Response Error Handler
 */

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }

  isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  isServerError() {
    return this.status >= 500;
  }

  isNetworkError() {
    return !this.status;
  }
}

/**
 * Format error message from API response
 */
export const formatErrorMessage = (error) => {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Axios error
  if (error.response) {
    const data = error.response.data;
    
    // Server returned error message
    if (typeof data === 'string') {
      return data;
    }
    
    if (data.message) {
      return data.message;
    }
    
    if (data.detail) {
      return data.detail;
    }
    
    // Handle validation errors
    if (data.errors && typeof data.errors === 'object') {
      const messages = [];
      for (const [field, errors] of Object.entries(data.errors)) {
        if (Array.isArray(errors)) {
          messages.push(`${field}: ${errors.join(', ')}`);
        }
      }
      if (messages.length) {
        return messages.join('\n');
      }
    }
  }

  // Network error
  if (error.message === 'Network Error') {
    return 'Network error. Please check your connection.';
  }

  // Timeout error
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  }

  // Generic message
  return error.message || 'An error occurred. Please try again.';
};

/**
 * Create API error object
 */
export const createApiError = (error) => {
  const status = error.response?.status || null;
  const message = formatErrorMessage(error);
  const data = error.response?.data || null;

  return new ApiError(message, status, data);
};

/**
 * Check if error is authentication error
 */
export const isAuthError = (error) => {
  return error.status === 401 || error.status === 403;
};

/**
 * Check if error is validation error
 */
export const isValidationError = (error) => {
  return error.status === 400 && error.data?.errors;
};

/**
 * Get validation errors from API response
 */
export const getValidationErrors = (error) => {
  if (!isValidationError(error)) {
    return {};
  }

  return error.data.errors || {};
};
