import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const RewardContext = createContext();

export const useReward = () => useContext(RewardContext);

export const RewardProvider = ({ children }) => {
  const [keys, setKeys] = useState(0);
  const [activeRewards, setActiveRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial user keys and active rewards
  useEffect(() => {
    const fetchUserRewardData = async () => {
      try {
        setLoading(true);

        // Fetch keys
        const keysResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/rewards/keys`,
          { withCredentials: true }
        );

        if (keysResponse.data.success) {
          setKeys(keysResponse.data.data.count);
        }

        // Fetch active rewards
        const activeRewardsResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/rewards/active-rewards`,
          { withCredentials: true }
        );

        if (activeRewardsResponse.data.success) {
          setActiveRewards(activeRewardsResponse.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch reward data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRewardData();
  }, []);

  // Update key count when a key is earned
  const updateKeys = async (forceRefresh = false) => {
    if (forceRefresh) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/rewards/keys`,
          { withCredentials: true }
        );

        if (response.data.success) {
          setKeys(response.data.data.count);
        }
      } catch (error) {
        console.error("Failed to refresh keys:", error);
      }
    }
  };

  // Add keys (e.g., when completing a task)
  const addKeys = async (amount) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rewards/keys`,
        { amount },
        { withCredentials: true }
      );

      if (response.data.success) {
        setKeys(response.data.data.count);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to add keys:", error);
      return false;
    }
  };

  // Refresh active rewards
  const refreshActiveRewards = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/rewards/active-rewards`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setActiveRewards(response.data.data);
      }
    } catch (error) {
      console.error("Failed to refresh active rewards:", error);
    }
  };

  // Get the active reward for a specific type (e.g., 'theme')
  const getActiveRewardByType = (type) => {
    const reward = activeRewards.find((r) => r.reward.type === type);
    return reward ? reward.reward : null;
  };

  // Export the context value
  const value = {
    keys,
    updateKeys,
    addKeys,
    activeRewards,
    refreshActiveRewards,
    getActiveRewardByType,
    loading,
  };

  return (
    <RewardContext.Provider value={value}>{children}</RewardContext.Provider>
  );
};
