import React, { useState } from "react";
import { Check, Loader } from "lucide-react";
import axios from "axios";
import { useReward } from "../contexts/RewardContext";

const RewardItem = ({ userReward }) => {
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState("");
  const [isActive, setIsActive] = useState(userReward.isActive);
  const { refreshActiveRewards } = useReward();

  const { reward } = userReward;

  const handleActivate = async () => {
    if (isActive) return;

    setIsActivating(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/rewards/user-rewards/${
          reward._id
        }/activate`,
        {},
        { withCredentials: true }
      );

      // Update local state
      setIsActive(true);

      // Refresh active rewards to update the theme application
      await refreshActiveRewards();
    } catch (error) {
      console.error("Failed to activate reward:", error);
      setError(error.response?.data?.message || "Failed to activate");
      setTimeout(() => setError(""), 2000);
    } finally {
      setIsActivating(false);
    }
  };

  // Determine rarity color
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "legendary":
        return "text-amber-500";
      case "epic":
        return "text-purple-600";
      case "rare":
        return "text-blue-600";
      case "uncommon":
        return "text-emerald-600";
      default:
        return "text-text-secondary";
    }
  };

  const rarityColors = {
    common: "border-border",
    uncommon: "border-emerald-600/50",
    rare: "border-blue-600/50",
    epic: "border-purple-600/50",
    legendary: "border-amber-500/50",
  };

  const borderClass = rarityColors[reward.rarity] || rarityColors.common;

  return (
    <div className={`border ${borderClass} bg-black/20 p-3 relative`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="size-10 border border-border flex items-center justify-center">
          {reward.imageUrl ? (
            <img
              src={reward.imageUrl}
              alt={reward.name}
              className="max-h-full max-w-full"
            />
          ) : (
            <span className={`text-lg ${getRarityColor(reward.rarity)}`}>
              {reward.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-base font-extralight">{reward.name}</h3>
          <span
            className={`uppercase text-xs ${getRarityColor(reward.rarity)}`}
          >
            {reward.rarity} {reward.type}
          </span>
        </div>
      </div>

      <p className="text-xs text-text-secondary mb-3">{reward.description}</p>

      <div className="flex justify-between items-center">
        <span className="text-xs text-text-secondary">
          Acquired: {new Date(userReward.acquiredAt).toLocaleDateString()}
        </span>

        {isActive ? (
          <span className="flex items-center gap-1 text-xs text-accent">
            <Check size={12} strokeWidth={1} />
            Active
          </span>
        ) : (
          <button
            onClick={handleActivate}
            disabled={isActivating}
            className="text-text-secondary hover:text-accent transition-colors text-xs flex items-center gap-1"
          >
            {isActivating ? (
              <Loader size={12} strokeWidth={1} className="animate-spin" />
            ) : (
              "Activate"
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="absolute top-0 left-0 w-full bg-accent/20 text-xs text-accent px-2 py-1">
          {error}
        </div>
      )}
    </div>
  );
};

export default RewardItem;
