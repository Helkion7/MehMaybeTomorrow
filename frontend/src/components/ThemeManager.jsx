import React, { useEffect } from "react";
import { useReward } from "../contexts/RewardContext";

const ThemeManager = () => {
  const { getActiveRewardByType, loading, activeRewards } = useReward();

  useEffect(() => {
    if (loading) return;

    // Get active theme
    const activeTheme = getActiveRewardByType("theme");

    if (activeTheme) {
      // Apply theme variables from the active theme reward
      const themeValues = activeTheme.value;

      // Set CSS variables
      document.documentElement.style.setProperty(
        "--color-background",
        themeValues.background
      );
      document.documentElement.style.setProperty(
        "--color-text-primary",
        themeValues.textPrimary
      );
      document.documentElement.style.setProperty(
        "--color-text-secondary",
        themeValues.textSecondary
      );
      document.documentElement.style.setProperty(
        "--color-accent",
        themeValues.accent
      );
      document.documentElement.style.setProperty(
        "--color-border",
        themeValues.border
      );

      console.log("Theme applied:", activeTheme.name);
    } else {
      console.log("No active theme found");
    }
  }, [getActiveRewardByType, loading, activeRewards]);

  // This is a utility component that doesn't render anything
  return null;
};

export default ThemeManager;
