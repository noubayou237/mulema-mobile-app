/**
 * Safely extracts a string error message from an API error response.
 * Handles NestJS validation errors (arrays), Axios errors, and native strings.
 * Prevents "Value for message cannot be cast from ReadableNativeMap to String" crashes.
 * 
 * @param {any} error 
 * @param {string} fallback 
 * @returns {string}
 */
export const getErrorMessage = (error, fallback = "Une erreur est survenue") => {
  if (!error) return fallback;

  // 1. Check for Axios response data
  if (error.response?.data) {
    const data = error.response.data;

    // NestJS often returns { message: string | string[], error: string, statusCode: number }
    if (data.message) {
      if (Array.isArray(data.message)) {
        return data.message.join("\n"); // Join multiple validation errors with newlines
      }
      if (typeof data.message === "string") {
        return data.message;
      }
    }

    // Fallback to data.error or just stringify the data if it's simple
    if (data.error && typeof data.error === "string") {
      return data.error;
    }
    
    if (typeof data === "string") {
      return data;
    }
  }

  // 2. Check for generic error message
  if (error.message && typeof error.message === "string") {
    return error.message;
  }

  // 3. Last resort
  if (typeof error === "string") {
    return error;
  }

  return fallback;
};
