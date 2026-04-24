import i18n from "../i18n";

/**
 * MULEMA — Error Utilities
 * Maps technical errors (Axios, etc.) to user-friendly, localized messages.
 */
export const getFriendlyErrorMessage = (error) => {
  const { t } = i18n;
  if (!error) return t("errors.somethingWentWrong");

  // 1. Handle Axios "Network Error" (often CORS or server down)
  if (error.message === "Network Error" || error.code === "ERR_NETWORK" || error.message?.toLowerCase().includes("network error")) {
    return t("errors.networkError");
  }

  // 2. Handle Axios timeout
  if (error.code === "ECONNABORTED") {
    return t("errors.serverError");
  }

  // 3. Handle HTTP responses from Backend
  if (error.response) {
    const { status, data } = error.response;
    const msg = data?.message;

    // Registration Conflict (Email already in use)
    if (status === 409 || (typeof msg === 'string' && msg.toLowerCase().includes("déjà"))) {
      return t("errors.emailAlreadyExists");
    }

    // Authentication Errors
    if (status === 401) {
      if (msg === "Invalid credentials") {
        return t("errors.invalidCredentials");
      }
      if (msg === "Invalid or expired OTP") {
        return t("errors.verifyFailed");
      }
      return t("auth.passwordResetError"); // Generic auth error catch
    }

    // Not found
    if (status === 404) return t("errors.notFound", "Cette ressource n'est pas disponible pour le moment.");

    // Validation Errors (often an array of strings)
    if (Array.isArray(msg)) {
      const first = msg[0].toLowerCase();
      if (first.includes("password")) {
        if (first.includes("short") || first.includes("character")) return t("errors.passwordTooShort");
        return t("errors.invalidPassword");
      }
      if (first.includes("email")) return t("errors.invalidEmail");
      return msg[0];
    }

    // Specific mapping for known backend strings
    if (typeof msg === 'string') {
        if (msg === "User not found") return t("errors.accountNotFound");
        if (msg === "Invalid password") return t("errors.invalidPassword");
        if (msg.toLowerCase().includes("missing")) return t("errors.requiredField");
        if (msg.toLowerCase().includes("cannot") || msg.toLowerCase().includes("not found")) {
          return t("errors.notFound", "Cette ressource n'est pas disponible pour le moment.");
        }
        return msg;
    }

    if (status >= 500) return t("errors.serverError");
  }

  // 4. Final Fallback
  return error.message || t("errors.somethingWentWrong");
};
