import React, { useState, useEffect } from "react";
import axios from "axios";
import { Package, Key, Loader } from "lucide-react";
import LootBoxItem from "../components/LootBoxItem";
import LootBoxOpening from "../components/LootBoxOpening";
import KeyDisplay from "../components/KeyDisplay";
import { useReward } from "../contexts/RewardContext";

const LootBoxesPage = () => {
  const [lootBoxes, setLootBoxes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openedReward, setOpenedReward] = useState(null);
  const [isNewReward, setIsNewReward] = useState(false);
  const { keys } = useReward();

  useEffect(() => {
    fetchLootBoxes();
  }, []);

  const fetchLootBoxes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/rewards/lootboxes`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setLootBoxes(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch loot boxes:", error);
      setError("Failed to load loot boxes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLootBoxOpen = (result) => {
    setOpenedReward(result.reward);
    setIsNewReward(result.isNew);
  };

  const handleCloseLootBoxOpening = () => {
    setOpenedReward(null);
  };

  return (
    <div className="py-2 px-1">
      <div className="mb-4">
        <h1 className="text-xl font-extralight text-text-primary tracking-tight">
          Loot Boxes
        </h1>
        <p className="text-sm text-text-secondary">
          Spend keys to unlock rewards
        </p>
      </div>

      <div className="flex items-center mb-4">
        <div className="flex items-center gap-1">
          <Key
            size={16}
            strokeWidth={1}
            className="text-text-secondary opacity-80"
          />
          <span className="text-sm">{keys} keys available</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader
            className="animate-spin text-text-secondary"
            size={24}
            strokeWidth={1}
          />
        </div>
      ) : error ? (
        <div className="text-accent text-sm py-4">{error}</div>
      ) : lootBoxes.length === 0 ? (
        <div className="py-6 text-center">
          <Package
            size={32}
            strokeWidth={1}
            className="mx-auto mb-2 opacity-50"
          />
          <p className="text-text-secondary text-sm">No loot boxes available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lootBoxes.map((lootBox) => (
            <LootBoxItem
              key={lootBox._id}
              lootBox={lootBox}
              onOpen={handleLootBoxOpen}
            />
          ))}
        </div>
      )}

      {openedReward && (
        <LootBoxOpening
          reward={openedReward}
          isNew={isNewReward}
          onClose={handleCloseLootBoxOpening}
        />
      )}
    </div>
  );
};

export default LootBoxesPage;
