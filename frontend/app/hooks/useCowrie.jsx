import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Constants
const MAX_COWRIES = 5;
const RECHARGE_TIME_MS = 9 * 60 * 1000; // 9 minutes in milliseconds
const STORAGE_KEY = "cowrie_state";

/**
 * Custom hook for managing cowrie (life) system with automatic recharging
 */
function useCowrie(initialCowries = 5) {
  const [cowries, setCowries] = useState(initialCowries);
  const [isRecharging, setIsRecharging] = useState(false);
  const [nextRechargeTime, setNextRechargeTime] = useState(null);
  const [timeUntilRecharge, setTimeUntilRecharge] = useState(0);

  const rechargeTimerRef = useRef(null);
  const checkIntervalRef = useRef(null);

  // Load cowrie state from storage on mount
  useEffect(() => {
    const loadCowrieState = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const state = JSON.parse(stored);

          // Calculate how many cowries should have recharged since last check
          const now = Date.now();
          const timePassed = now - state.lastRechargeTime;
          const rechargesAvailable = Math.floor(timePassed / RECHARGE_TIME_MS);

          if (rechargesAvailable > 0) {
            const newCowries = Math.min(
              MAX_COWRIES,
              state.cowries + rechargesAvailable
            );
            const remainingTime = timePassed % RECHARGE_TIME_MS;

            setCowries(newCowries);
            setNextRechargeTime(now + (RECHARGE_TIME_MS - remainingTime));

            // Update storage with new state
            await AsyncStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                cowries: newCowries,
                lastRechargeTime: now - remainingTime,
                rechargeQueue: now + (RECHARGE_TIME_MS - remainingTime)
              })
            );
          } else {
            setCowries(state.cowries);
            setNextRechargeTime(state.rechargeQueue || null);
          }
        }
      } catch (error) {
        console.error("Error loading cowrie state:", error);
      }
    };

    loadCowrieState();
  }, []);

  // Update time until next recharge
  useEffect(() => {
    if (nextRechargeTime) {
      checkIntervalRef.current = setInterval(() => {
        const remaining = Math.max(0, nextRechargeTime - Date.now());
        setTimeUntilRecharge(remaining);

        if (remaining <= 0) {
          // Trigger recharge
          handleRecharge();
        }
      }, 1000);

      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
      };
    }
  }, [nextRechargeTime]);

  // Save cowrie state to storage
  const saveCowrieState = useCallback(
    async (newCowries, rechargeTime = null) => {
      try {
        const now = Date.now();
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            cowries: newCowries,
            lastRechargeTime: now,
            rechargeQueue: rechargeTime || now + RECHARGE_TIME_MS
          })
        );
      } catch (error) {
        console.error("Error saving cowrie state:", error);
      }
    },
    []
  );

  // Handle cowrie recharge
  const handleRecharge = useCallback(async () => {
    setCowries((prev) => {
      if (prev >= MAX_COWRIES) {
        setIsRecharging(false);
        setNextRechargeTime(null);
        setTimeUntilRecharge(0);
        return prev;
      }

      const newCowries = prev + 1;
      const nextRecharge = Date.now() + RECHARGE_TIME_MS;

      setNextRechargeTime(nextRecharge);
      setTimeUntilRecharge(RECHARGE_TIME_MS);
      setIsRecharging(newCowries < MAX_COWRIES);

      // Save to storage
      saveCowrieState(newCowries, nextRecharge);

      return newCowries;
    });
  }, [saveCowrieState]);

  // Use cowrie callback
  const consumeCowrie = useCallback(async () => {
    if (cowries <= 0) {
      return false;
    }

    setCowries((prev) => {
      const newCowries = prev - 1;
      saveCowrieState(newCowries);
      return newCowries;
    });

    return true;
  }, [cowries, saveCowrieState]);

  // Add a cowrie (for bonuses)
  const addCowrie = useCallback(async () => {
    setCowries((prev) => {
      if (prev >= MAX_COWRIES) {
        return prev;
      }
      const newCowries = prev + 1;
      saveCowrieState(newCowries);
      return newCowries;
    });
  }, [saveCowrieState]);

  // Reset cowries to maximum
  const resetCowries = useCallback(async () => {
    setCowries(MAX_COWRIES);
    setNextRechargeTime(null);
    setTimeUntilRecharge(0);
    setIsRecharging(false);
    await saveCowrieState(MAX_COWRIES, null);
  }, [saveCowrieState]);

  // Format time until next recharge
  const formatRechargeTime = useCallback(() => {
    if (timeUntilRecharge <= 0) return "Ready!";

    const minutes = Math.floor(timeUntilRecharge / 60000);
    const seconds = Math.floor((timeUntilRecharge % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, [timeUntilRecharge]);

  // Check if can play
  const canPlay = cowries > 0 || isRecharging;

  return {
    cowries,
    setCowries,
    maxCowries: MAX_COWRIES,
    isRecharging,
    nextRechargeTime,
    timeUntilRecharge,
    canPlay,
    consumeCowrie,
    addCowrie,
    resetCowries,
    formatRechargeTime,
    rechargeTimeMs: RECHARGE_TIME_MS
  };
}

export default useCowrie;
