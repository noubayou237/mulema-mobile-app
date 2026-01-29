// services/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ adapte l’URL selon ton backend
// Android emulator : http://10.0.2.2:5001
// iOS simulator : http://localhost:5001
// téléphone réel : http://IP_DE_TON_PC:5001

const API_BASE_URL = "http://172.20.10.4:5001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Ajout automatique du token si présent
api.interceptors.request.use(
  async (config) => {
    const session = await AsyncStorage.getItem("userSession");
    if (session) {
      const { accessToken } = JSON.parse(session);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
