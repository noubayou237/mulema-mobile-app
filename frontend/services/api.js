// services/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ⚠️ API URL depends on platform and environment
// Android emulator : http://10.0.2.2:5001
// iOS simulator : http://localhost:5001
// Web browser : http://localhost:5001
// Phone real : Use EXPO_PUBLIC_API_IP environment variable

// Determine API base URL based on platform
const getApiUrl = () => {
  // Web
  if (Platform.OS === "web") {
    return "http://localhost:5001";
  }

  // Android emulator
  if (Platform.OS === "android" && __DEV__) {
    return "http://10.0.2.2:5001";
  }

  // iOS simulator
  if (Platform.OS === "ios" && __DEV__) {
    return "http://localhost:5001";
  }

  // For ALL physical devices - use environment variable
  const PC_IP = process.env.EXPO_PUBLIC_API_IP;
  if (PC_IP) {
    return `http://${PC_IP}:5001`;
  }

  // Fallback - this should not happen in production
  return "http://localhost:5001";
};

const API_BASE_URL = getApiUrl();

const STORAGE_KEY = "userSession"; // Must match UserContext.jsx

console.log("🔧 API Configuration:");
console.log("  Platform:", Platform.OS);
console.log("  Dev Mode:", __DEV__);
console.log("  API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000 // 15 second timeout
});

// 🔐 Ajout automatique du token si présent
api.interceptors.request.use(
  async (config) => {
    try {
      const session = await AsyncStorage.getItem(STORAGE_KEY);
      if (session) {
        const { accessToken } = JSON.parse(session);
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
    } catch (e) {
      // Silent error
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔄 Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.warn("API Timeout:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
