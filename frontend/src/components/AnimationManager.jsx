import React, { useContext, createContext, useState, useEffect } from "react";
import { useReward } from "../contexts/RewardContext";

const AnimationContext = createContext({
  todoAnimation: "",
  animationDuration: "0.3s",
  animationTiming: "ease",
});

export const useAnimation = () => useContext(AnimationContext);

export const AnimationManager = ({ children }) => {
  const { getActiveRewardByType, loading } = useReward();
  const [todoAnimation, setTodoAnimation] = useState("");
  const [animationDuration, setAnimationDuration] = useState("0.3s");
  const [animationTiming, setAnimationTiming] = useState("ease");

  useEffect(() => {
    if (loading) return;

    const activeAnimation = getActiveRewardByType("animation");
    if (activeAnimation) {
      const animationValue = activeAnimation.value;
      setTodoAnimation(`reward-animation-${animationValue.name}`);
      setAnimationDuration(animationValue.duration || "0.3s");
      setAnimationTiming(animationValue.timing || "ease");

      // Apply animation duration as CSS variable
      document.documentElement.style.setProperty(
        "--animation-duration",
        animationValue.duration
      );

      // Apply animation timing as CSS variable
      document.documentElement.style.setProperty(
        "--animation-timing",
        animationValue.timing
      );
    }
  }, [getActiveRewardByType, loading]);

  return (
    <AnimationContext.Provider
      value={{ todoAnimation, animationDuration, animationTiming }}
    >
      {children}
    </AnimationContext.Provider>
  );
};

export default AnimationManager;
