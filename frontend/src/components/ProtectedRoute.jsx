import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`,
          { withCredentials: true }
        );
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication failed:", error);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-color-background">
        <p className="text-sm text-text-secondary">Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
