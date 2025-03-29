import React, { useEffect, useState } from "react";
import { Key } from "lucide-react";

const KeyEarnedNotification = ({ show, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-black/80 border border-accent backdrop-blur-sm p-3 rounded-sm flex items-center gap-3 animate-in fade-in duration-300">
      <div className="size-8 flex items-center justify-center bg-accent/20 rounded-full">
        <Key size={16} strokeWidth={1} className="text-accent" />
      </div>
      <div>
        <h4 className="text-sm font-extralight">Key Earned</h4>
        <p className="text-xs text-text-secondary">
          Task completed successfully
        </p>
      </div>
    </div>
  );
};

export default KeyEarnedNotification;
