// app/hooks/useTranslation.js
import { useContext, useMemo } from 'react';
// ATTENTION : Ajuste le chemin d'importation vers ton fichier UserContext
// Si UserContext est dans le dossier 'context' au même niveau que 'hooks' :
import { UserContext } from '../../context/UserContext'; 

// --- Dictionnaire de traduction (Strings) ---
const STR = {
  fr: {
    profile_title: 'Editer le profil',
    change_photo: 'Changer la photo',
    select_photo: 'Sélectionner une autre photo',
    confirm: 'Confirmer',
    full_name: 'Nom complet',
    email: 'Email',
    password: 'Mot de passe',
    delete_account: 'Supprimer le compte',
    save: 'Enregistrer',
    logout: 'Se déconnecter',
    language: 'Langue',
    welcome_back: 'Bon retour',
  },
  en: {
    profile_title: 'Edit profile',
    change_photo: 'Change photo',
    select_photo: 'Select another photo',
    confirm: 'Confirm',
    full_name: 'Full name',
    email: 'Email',
    password: 'Password',
    delete_account: 'Delete account',
    save: 'Save',
    logout: 'Log out',
    language: 'Language',
    welcome_back: 'Welcome back',
  },
  // Ajoutez d'autres langues ici si nécessaire
};

/**
 * Hook personnalisé pour récupérer le dictionnaire de traduction
 * basé sur la langue actuelle stockée dans le UserContext.
 * @returns {object} Le dictionnaire de la langue actuelle.
 */
export function useTranslation() {
  // Récupère la langue du contexte utilisateur
  const { lang } = useContext(UserContext);

  // useMemo s'assure que le dictionnaire n'est recalculé que si la langue change (performance)
  return useMemo(() => {
    // Retourne le dictionnaire correspondant à la langue, sinon retourne le français par défaut.
    return STR[lang] || STR.fr;
  }, [lang]);
}

// ⚠️ AUCUN export default N'EST NÉCESSAIRE ici, car c'est un Hook.