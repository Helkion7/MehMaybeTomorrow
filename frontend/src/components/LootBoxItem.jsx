import React, { useState } from "react";
import { PackageOpen, Key, Loader } from "lucide-react";
import { useReward } from "../contexts/RewardContext";
import axios from "axios";

const LootBoxItem = ({ lootBox, onOpen }) => {
  const { keys, updateKeys } = useReward();
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState("");

  const handleOpen = async () => {
    if (keys < lootBox.cost) {
      setError("Not enough keys");
      setTimeout(() => setError(""), 2000);
      return;
    }

    setIsOpening(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/rewards/lootboxes/${
          lootBox._id
        }/open`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update key count
        updateKeys(true);

        // Call parent handler with reward data
        onOpen(response.data.data);
      }
    } catch (error) {
      console.error("Failed to open loot box:", error);
      setError(error.response?.data?.message || "Failed to open");
      setTimeout(() => setError(""), 2000);
    } finally {
      setIsOpening(false);
    }
  };

  // Determine rarity color
  const rarityColors = {
    common: "border-border",
    uncommon: "border-emerald-600/50",
    rare: "border-blue-600/50",
    epic: "border-purple-600/50",
    legendary: "border-amber-500/50",
  };

  const borderClass = rarityColors[lootBox.rarity] || rarityColors.common;
  const canOpen = keys >= lootBox.cost;

  return (
    <div className={`border ${borderClass} bg-black/20 p-3 relative`}>
      <div className="flex items-center gap-2 mb-2">
        <PackageOpen size={18} strokeWidth={1} className="opacity-80" />
        <h3 className="text-base font-extralight">{lootBox.name}</h3>
      </div>

      <p className="text-xs text-text-secondary mb-2">{lootBox.description}</p>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center">
          <Key size={14} strokeWidth={1} className="opacity-80" />
          <span className="text-xs ml-1">{lootBox.cost}</span>
        </div>
        <span className="text-xs uppercase font-extralight text-text-secondary">
          {lootBox.rarity}
        </span>
      </div>

      <button
        onClick={handleOpen}
        disabled={!canOpen || isOpening}
        className={`w-full border ${
          canOpen ? "border-border hover:border-accent" : "border-border/50"
        } transition-colors py-2 text-xs font-extralight ${
          canOpen
            ? "text-text-primary hover:text-accent"
            : "text-text-secondary"
        } flex items-center justify-center`}
      >
        {isOpening ? (
          <Loader size={14} strokeWidth={1} className="animate-spin" />
        ) : (
          "OPEN"
        )}
      </button>

      {error && (
        <div className="absolute top-0 left-0 w-full bg-accent/20 text-xs text-accent px-2 py-1">
          {error}
        </div>
      )}
    </div>
  );
};

export default LootBoxItem;
