// services/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ⚠️ API URL depends on platform
// Android emulator : http://10.0.2.2:5001
// iOS simulator : http://localhost:5001
// Web browser : http://localhost:5001
// Phone real : Use YOUR_PC_IP environment variable or update below

// Replace with your PC's IP address for mobile testing
// To find your IP: run `ip addr` or `ifconfig` in terminal
const PC_IP = process.env.EXPO_PUBLIC_API_IP || "192.168.43.125";

const API_BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:5001"
    : Platform.OS === "android" && !__DEV__
      ? `http://${PC_IP}:5001` // Android physical device
      : `http://${PC_IP}:5001`; // iOS physical device

const STORAGE_KEY = "userSession"; // Must match UserContext.jsx

console.log("API Base URL:", API_BASE_URL);

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
