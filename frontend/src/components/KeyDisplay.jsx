import React from "react";
import { Key } from "lucide-react";
import { useReward } from "../contexts/RewardContext";

const KeyDisplay = () => {
  const { keys } = useReward();

  return (
    <div className="flex items-center gap-1 px-4 py-2 text-text-secondary">
      <Key size={16} strokeWidth={1} className="opacity-80" />
      <span className="text-sm">{keys}</span>
    </div>
  );
};

export default KeyDisplay;
