import React, { useState, useEffect } from "react";
import axios from "axios";
import { Award, Loader, Filter, ChevronDown } from "lucide-react";
import RewardItem from "../components/RewardItem";
import { useReward } from "../contexts/RewardContext";

const RewardsPage = () => {
  const [userRewards, setUserRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const { refreshActiveRewards } = useReward();

  useEffect(() => {
    fetchUserRewards();
    // Also refresh active rewards when the page loads
    refreshActiveRewards();
  }, []);

  const fetchUserRewards = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/rewards/user-rewards`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setUserRewards(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user rewards:", error);
      setError("Failed to load rewards");
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setTypeFilter("");
    setRarityFilter("");
  };

  // Filter rewards based on type and rarity
  const filteredRewards = userRewards.filter((userReward) => {
    return (
      (typeFilter === "" || userReward.reward.type === typeFilter) &&
      (rarityFilter === "" || userReward.reward.rarity === rarityFilter)
    );
  });

  return (
    <div className="py-2 px-1">
      <div className="mb-4">
        <h1 className="text-xl font-extralight text-text-primary tracking-tight">
          Your Rewards
        </h1>
        <p className="text-sm text-text-secondary">
          Manage your unlocked rewards
        </p>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 text-text-secondary hover:text-accent transition-colors text-sm"
        >
          <Filter size={14} strokeWidth={1} className="opacity-70" />
          <span>Filters</span>
          <ChevronDown
            size={14}
            strokeWidth={1}
            className={`opacity-70 transform transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </button>

        {showFilters && (
          <div className="mt-2 space-y-2 border-l border-border pl-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="typeFilter"
                className="text-xs text-text-secondary"
              >
                Type:
              </label>
              <select
                id="typeFilter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent text-xs py-0 px-1"
              >
                <option value="">All Types</option>
                <option value="theme">Theme</option>
                <option value="badge">Badge</option>
                <option value="animation">Animation</option>
                <option value="feature">Feature</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="rarityFilter"
                className="text-xs text-text-secondary"
              >
                Rarity:
              </label>
              <select
                id="rarityFilter"
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent text-xs py-0 px-1"
              >
                <option value="">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>

            {(typeFilter || rarityFilter) && (
              <button
                onClick={clearFilters}
                className="text-text-secondary hover:text-accent transition-colors text-xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
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
      ) : filteredRewards.length === 0 ? (
        <div className="py-6 text-center">
          <Award
            size={32}
            strokeWidth={1}
            className="mx-auto mb-2 opacity-50"
          />
          <p className="text-text-secondary text-sm">
            {userRewards.length === 0
              ? "No rewards yet. Complete tasks to earn keys!"
              : "No rewards match the selected filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRewards.map((userReward) => (
            <RewardItem key={userReward._id} userReward={userReward} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RewardsPage;
