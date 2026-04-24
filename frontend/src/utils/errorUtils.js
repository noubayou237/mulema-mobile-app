/**
 * MULEMA — Error Utilities
 * Maps technical errors (Axios, etc.) to user-friendly messages.
 */

export const getFriendlyErrorMessage = (error) => {
  if (!error) return "Une erreur inconnue est survenue.";

  // handle Axios "Network Error"
  if (error.message === "Network Error") {
    return "Problème de connexion au serveur. Vérifiez votre connexion internet ou si le serveur est en maintenance.";
  }

  // handle Axios timeout
  if (error.code === "ECONNABORTED") {
    return "Le serveur met trop de temps à répondre. Réessayez plus tard.";
  }

  // handle HTTP responses
  if (error.response) {
    const { status, data } = error.response;

    if (status === 401) return "Votre session a expiré. Veuillez vous reconnecter.";
    if (status === 403) return "Vous n'avez pas l'autorisation d'accéder à cette ressource.";
    if (status === 404) return "La ressource demandée est introuvable.";
    if (status >= 500) return "Le serveur rencontre un problème. Nos équipes travaillent dessus.";

    // Backend often returns { message: "..." }
    if (data?.message) return data.message;
  }

  return error.message || "Une erreur est survenue.";
};
