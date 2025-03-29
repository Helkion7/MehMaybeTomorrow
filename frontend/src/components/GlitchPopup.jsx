import React, { useState, useEffect } from "react";

const GlitchPopup = ({ onClick }) => {
  // State to hold random position
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Generate a random position on mount
  useEffect(() => {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate popup size (approximate)
    const popupWidth = 240; // Approximate width
    const popupHeight = 240; // Approximate height

    // Generate random position, keeping popup within viewport bounds
    const randomX = Math.floor(Math.random() * (viewportWidth - popupWidth));
    const randomY = Math.floor(Math.random() * (viewportHeight - popupHeight));

    setPosition({
      left: randomX,
      top: randomY,
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50" onClick={onClick}>
      <div
        className="glitch-popup p-4 border border-accent absolute"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          boxShadow: "0 0 10px var(--color-accent)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src="/glitch.png"
          alt="System Error"
          className="w-32 h-32 object-contain mx-auto mb-2"
          onError={(e) => {
            // Fallback if image doesn't load
            e.target.outerHTML = `
              <div class="w-32 h-32 flex items-center justify-center border border-accent mb-2">
                <span class="text-accent text-xs font-extralight">SYSTEM ERROR</span>
              </div>
            `;
          }}
        />
        <p className="text-text-primary text-center text-sm font-extralight drop-shadow-[0_0_4px_rgba(0,0,0,1)]">
          Task corrupted. Click to restore.
        </p>
        <button
          onClick={onClick}
          className="w-full mt-2 text-text-primary hover:text-accent border border-border hover:border-accent transition-colors py-1 text-xs font-extralight bg-black/30 backdrop-blur-sm"
        >
          RESET SYSTEM
        </button>
      </div>
    </div>
  );
};

export default GlitchPopup;
