import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Save, Trash2 } from "lucide-react";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  // Initialize with null instead of empty strings to handle controlled inputs properly
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`,
          { withCredentials: true }
        );

        setProfile(response.data.user);
        setUsername(response.data.user.username || "");
        setEmail(response.data.user.email || "");
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setMessage({
          text: "Failed to load profile. Please try again.",
          type: "error",
        });
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
        { username, email },
        { withCredentials: true }
      );

      setProfile(response.data.user);
      setMessage({
        text: "Profile updated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage({
        text: error.response?.data?.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({
        text: "New passwords don't match",
        type: "error",
      });
      return;
    }

    setIsChangingPassword(true);
    setMessage({ text: "", type: "" });

    try {
      // Note: This endpoint might need to be implemented in the backend
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({
        text: "Password changed successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      setMessage({
        text: error.response?.data?.message || "Failed to change password",
        type: "error",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setMessage({ text: "", type: "" });

    try {
      // Note: This endpoint might need to be implemented in the backend
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/account`,
        { withCredentials: true }
      );

      // Redirect to login page after account deletion
      setMessage({
        text: "Account deleted successfully",
        type: "success",
      });

      // Clear cookies
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Failed to delete account:", error);
      setMessage({
        text: error.response?.data?.message || "Failed to delete account",
        type: "error",
      });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div>
      <h1>Your Profile</h1>

      {message.text && <div>{message.text}</div>}

      <div>
        <h2>Profile Information</h2>
        <form onSubmit={handleUpdateProfile}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username || ""}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      <div>
        <h2>Change Password</h2>
        <form onSubmit={handleChangePassword}>
          <div>
            <label htmlFor="currentPassword">Current Password</label>
            <div>
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="newPassword">New Password</label>
            <div>
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isChangingPassword}>
            {isChangingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      <div>
        <h2>Delete Account</h2>
        <p>
          Warning: This action cannot be undone. All your data will be
          permanently deleted.
        </p>

        {!showDeleteConfirmation ? (
          <button onClick={() => setShowDeleteConfirmation(true)}>
            Delete Account
          </button>
        ) : (
          <div>
            <p>Are you sure you want to delete your account?</p>
            <button onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
            </button>
            <button onClick={() => setShowDeleteConfirmation(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
