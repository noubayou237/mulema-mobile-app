import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Clés de stockage ---
const STORAGE_KEYS = {
    PROFILE_IMAGE: '@profile_image_uri_v1',
    USERNAME: '@profile_username_v1',
    EMAIL: '@profile_email_v1',
    LANG: '@app_lang_v1',
};

// --- 1. Export du Context pour utilisation dans les Hooks ---
export const UserContext = createContext({
    username: '',
    setUsername: () => {},
    email: '',
    setEmail: () => {},
    profileImage: null,
    setProfileImage: () => {},
    lang: 'fr',
    setLang: () => {},
});

// --- 2. Le composant Provider qui doit être l'export par défaut si dans le dossier app/ ---
export default function UserProvider({ children }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [lang, setLang] = useState('fr');

    // CHARGEMENT INITIAL (s'exécute une seule fois au montage)
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const [u, e, img, l] = await Promise.all([
                    AsyncStorage.getItem(STORAGE_KEYS.USERNAME),
                    AsyncStorage.getItem(STORAGE_KEYS.EMAIL),
                    AsyncStorage.getItem(STORAGE_KEYS.PROFILE_IMAGE),
                    AsyncStorage.getItem(STORAGE_KEYS.LANG),
                ]);
                if (u) setUsername(u);
                if (e) setEmail(e);
                if (img) setProfileImage(img);
                if (l) setLang(l);
            } catch (err) {
                console.warn('UserProvider load error', err);
            }
        };
        loadUserData();
    }, []);

    // MISE À JOUR DU STOCKAGE (s'exécute à chaque changement d'état)
    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.USERNAME, username).catch(() => {});
    }, [username]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.EMAIL, email).catch(() => {});
    }, [email]);

    useEffect(() => {
        if (profileImage) // Stocke uniquement s'il y a une image
            AsyncStorage.setItem(STORAGE_KEYS.PROFILE_IMAGE, profileImage).catch(() => {});
    }, [profileImage]);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEYS.LANG, lang).catch(() => {});
    }, [lang]);

    const value = {
        username,
        setUsername,
        email,
        setEmail,
        profileImage,
        setProfileImage,
        lang,
        setLang,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}