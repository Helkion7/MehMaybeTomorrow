import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { UserCircle, LogOut, CheckSquare } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    return location.pathname === path
      ? "bg-blue-100 text-blue-600"
      : "text-gray-700 hover:bg-gray-100";
  };

  return (
    <div>
      <div>
        <h2>MehMaybe</h2>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/todo">
              <CheckSquare size={20} />
              <span>Todos</span>
            </Link>
          </li>
          <li>
            <Link to="/profile">
              <UserCircle size={20} />
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <button onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
