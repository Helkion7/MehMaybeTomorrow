import React, { useState, useEffect } from "react";
import { X, PackageOpen, Sparkles } from "lucide-react";

const LootBoxOpening = ({ reward, isNew, onClose }) => {
  const [animationStage, setAnimationStage] = useState(0);

  // Animation sequence
  useEffect(() => {
    // Stage 0: Initial state
    // Stage 1: Box opening
    // Stage 2: Reveal reward
    // Stage 3: Show details
    const stages = [1000, 2000, 500]; // Timing for each stage transition

    let timeout;
    if (animationStage < 3) {
      timeout = setTimeout(() => {
        setAnimationStage((prev) => prev + 1);
      }, stages[animationStage]);
    }

    return () => clearTimeout(timeout);
  }, [animationStage]);

  // Get rarity color
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

  if (!reward) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className={`relative bg-black/80 border border-accent p-6 max-w-xs w-full transition-all duration-500 ${
          animationStage === 0
            ? "scale-75 opacity-0"
            : animationStage === 1
            ? "scale-100 opacity-100"
            : "scale-105 opacity-100"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-text-secondary hover:text-accent"
        >
          <X size={16} strokeWidth={1} />
        </button>

        <div className="flex flex-col items-center">
          {animationStage < 2 ? (
            <div className="py-8 flex flex-col items-center">
              <PackageOpen
                size={48}
                strokeWidth={1}
                className={`${animationStage === 1 ? "animate-pulse" : ""}`}
              />
              <p className="mt-4 text-lg font-extralight">
                Opening loot box...
              </p>
            </div>
          ) : (
            <div className="py-4 flex flex-col items-center">
              <div className="relative">
                {animationStage === 2 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles
                      size={64}
                      strokeWidth={1}
                      className="text-accent animate-pulse"
                    />
                  </div>
                )}

                <div
                  className={`size-24 border border-border flex items-center justify-center mb-4 ${
                    animationStage === 2
                      ? "animate-in zoom-in-50 duration-500"
                      : ""
                  }`}
                >
                  {reward.imageUrl ? (
                    <img
                      src={reward.imageUrl}
                      alt={reward.name}
                      className="max-h-full max-w-full"
                    />
                  ) : (
                    <span
                      className={`text-2xl ${getRarityColor(reward.rarity)}`}
                    >
                      {reward.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-extralight mb-2">{reward.name}</h3>
              <span
                className={`uppercase text-xs ${getRarityColor(
                  reward.rarity
                )} mb-2`}
              >
                {reward.rarity} {reward.type}
              </span>

              {isNew && <span className="text-accent text-xs mb-2">NEW!</span>}

              <p className="text-sm text-text-secondary text-center">
                {reward.description}
              </p>

              <button
                onClick={onClose}
                className="mt-4 border border-border hover:border-accent px-4 py-2 text-sm font-extralight hover:text-accent transition-colors w-full"
              >
                CONTINUE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LootBoxOpening;
