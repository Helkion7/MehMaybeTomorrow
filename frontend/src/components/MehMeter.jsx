import React from "react";

const MehMeter = ({
  value = 2,
  onChange,
  disabled = false,
  size = "normal",
}) => {
  // Calculate styles based on enthusiasm level
  const getTrackColor = () => {
    // Different colors for different enthusiasm levels
    const colors = [
      "oklch(0.2 0.01 250)", // Very meh (0)
      "oklch(0.3 0.03 270)", // Somewhat meh (1)
      "oklch(0.4 0.04 280)", // Neutral (2)
      "oklch(0.5 0.06 290)", // Somewhat enthusiastic (3)
      "oklch(0.65 0.08 300)", // Very enthusiastic (4)
    ];
    return colors[value] || colors[2];
  };

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
  };

  // Determine size styling
  const sizeClasses = {
    small: "w-16 h-1",
    normal: "w-24 h-1.5",
    large: "w-32 h-2",
  };

  const thumbSizes = {
    small: "w-2 h-2",
    normal: "w-3 h-3",
    large: "w-4 h-4",
  };

  return (
    <div className="relative flex items-center">
      <input
        type="range"
        min="0"
        max="4"
        step="1"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`
          appearance-none
          bg-color-border
          rounded-full
          ${sizeClasses[size] || sizeClasses.normal}
          focus:outline-none
          disabled:opacity-50
        `}
        style={{
          backgroundImage: `linear-gradient(to right, ${getTrackColor()}, ${getTrackColor()})`,
          backgroundSize: `${(value / 4) * 100}% 100%`,
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Custom styling for thumb (handle) */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          background: var(--color-accent);
          border-radius: 50%;
          ${thumbSizes[size] || thumbSizes.normal}
        }
        input[type="range"]::-moz-range-thumb {
          background: var(--color-accent);
          border: none;
          border-radius: 50%;
          ${thumbSizes[size] || thumbSizes.normal}
        }
      `}</style>
    </div>
  );
};

export default MehMeter;
