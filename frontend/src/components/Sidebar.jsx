import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  UserCircle,
  LogOut,
  CheckSquare,
  CheckCircle,
  Package,
  Award,
} from "lucide-react";
import KeyDisplay from "./KeyDisplay";
import { useReward } from "../contexts/RewardContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { keys } = useReward();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? "border-accent" : "border-transparent";
  };

  return (
    <div className="border-r border-border bg-black/30 backdrop-blur-sm w-full md:w-48 md:min-h-screen flex flex-col relative z-10">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-extralight tracking-tight">
          MehMaybeTomorrow
        </h2>
        <p className="text-sm text-text-secondary">Minimalism in motion</p>
      </div>
      <KeyDisplay />
      <nav className="flex-1 py-2">
        <ul className="space-y-1">
          <li>
            <Link
              to="/todo"
              className={`flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-accent transition-colors border-l-2 ${isActive(
                "/todo"
              )}`}
            >
              <CheckSquare size={18} strokeWidth={1} className="opacity-80" />
              <span className="text-sm">Tasks</span>
            </Link>
          </li>
          <li>
            <Link
              to="/finished"
              className={`flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-accent transition-colors border-l-2 ${isActive(
                "/finished"
              )}`}
            >
              <CheckCircle size={18} strokeWidth={1} className="opacity-80" />
              <span className="text-sm">Finished</span>
            </Link>
          </li>
          <li>
            <Link
              to="/lootboxes"
              className={`flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-accent transition-colors border-l-2 ${isActive(
                "/lootboxes"
              )}`}
            >
              <Package size={18} strokeWidth={1} className="opacity-80" />
              <span className="text-sm">Loot Boxes</span>
            </Link>
          </li>
          <li>
            <Link
              to="/rewards"
              className={`flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-accent transition-colors border-l-2 ${isActive(
                "/rewards"
              )}`}
            >
              <Award size={18} strokeWidth={1} className="opacity-80" />
              <span className="text-sm">Rewards</span>
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className={`flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-accent transition-colors border-l-2 ${isActive(
                "/profile"
              )}`}
            >
              <UserCircle size={18} strokeWidth={1} className="opacity-80" />
              <span className="text-sm">Profile</span>
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 w-full text-left text-text-secondary hover:text-accent transition-colors"
            >
              <LogOut size={18} strokeWidth={1} className="opacity-80" />
              <span className="text-sm">Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
