import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Save, Trash2, User, Mail, Lock } from "lucide-react";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
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
    return (
      <div className="py-4 flex justify-center">
        <p className="text-sm text-text-secondary">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="py-2 px-1">
      <div className="mb-4">
        <h1 className="text-xl font-extralight text-text-primary tracking-tight">
          Your Profile
        </h1>
        <p className="text-sm text-text-secondary">Account settings</p>
      </div>

      {message.text && (
        <div
          className={`text-xs ${
            message.type === "success" ? "text-accent" : "text-accent"
          } mb-4`}
        >
          {message.text}
        </div>
      )}

      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-sm font-extralight mb-2">Profile Information</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="focus-within:ring-1 focus-within:ring-accent transition-all">
            <div className="flex items-center border-b border-border">
              <User
                size={16}
                strokeWidth={1}
                className="text-text-secondary opacity-70"
              />
              <input
                id="username"
                type="text"
                value={username || ""}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                className="w-full bg-transparent text-text-primary focus:outline-none py-1 px-2 text-sm font-extralight"
              />
            </div>
          </div>

          <div className="focus-within:ring-1 focus-within:ring-accent transition-all">
            <div className="flex items-center border-b border-border">
              <Mail
                size={16}
                strokeWidth={1}
                className="text-text-secondary opacity-70"
              />
              <input
                id="email"
                type="email"
                value={email || ""}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent text-text-primary focus:outline-none py-1 px-2 text-sm font-extralight"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="text-text-secondary hover:text-accent transition-colors text-sm flex items-center gap-1"
          >
            <Save size={14} strokeWidth={1} className="opacity-70" />
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-sm font-extralight mb-2">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="focus-within:ring-1 focus-within:ring-accent transition-all">
            <div className="flex items-center border-b border-border">
              <Lock
                size={16}
                strokeWidth={1}
                className="text-text-secondary opacity-70"
              />
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                required
                className="w-full bg-transparent text-text-primary focus:outline-none py-1 px-2 text-sm font-extralight"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="text-text-secondary hover:text-accent transition-colors"
              >
                {showCurrentPassword ? (
                  <EyeOff size={14} strokeWidth={1} className="opacity-70" />
                ) : (
                  <Eye size={14} strokeWidth={1} className="opacity-70" />
                )}
              </button>
            </div>
          </div>

          <div className="focus-within:ring-1 focus-within:ring-accent transition-all">
            <div className="flex items-center border-b border-border">
              <Lock
                size={16}
                strokeWidth={1}
                className="text-text-secondary opacity-70"
              />
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={8}
                className="w-full bg-transparent text-text-primary focus:outline-none py-1 px-2 text-sm font-extralight"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="text-text-secondary hover:text-accent transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff size={14} strokeWidth={1} className="opacity-70" />
                ) : (
                  <Eye size={14} strokeWidth={1} className="opacity-70" />
                )}
              </button>
            </div>
          </div>

          <div className="focus-within:ring-1 focus-within:ring-accent transition-all">
            <div className="flex items-center border-b border-border">
              <Lock
                size={16}
                strokeWidth={1}
                className="text-text-secondary opacity-70"
              />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                minLength={8}
                className="w-full bg-transparent text-text-primary focus:outline-none py-1 px-2 text-sm font-extralight"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-text-secondary hover:text-accent transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff size={14} strokeWidth={1} className="opacity-70" />
                ) : (
                  <Eye size={14} strokeWidth={1} className="opacity-70" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="text-text-secondary hover:text-accent transition-colors text-sm flex items-center gap-1"
          >
            <Save size={14} strokeWidth={1} className="opacity-70" />
            {isChangingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-sm font-extralight mb-2">Delete Account</h2>
        <p className="text-xs text-text-secondary mb-2">
          Warning: This action cannot be undone. All your data will be
          permanently deleted.
        </p>

        {!showDeleteConfirmation ? (
          <button
            onClick={() => setShowDeleteConfirmation(true)}
            className="text-text-secondary hover:text-accent transition-colors text-sm flex items-center gap-1"
          >
            <Trash2 size={14} strokeWidth={1} className="opacity-70" />
            Delete Account
          </button>
        ) : (
          <div className="space-y-2 border-l border-border pl-2 py-2">
            <p className="text-xs text-text-secondary">
              Are you sure you want to delete your account?
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="text-accent hover:text-text-primary transition-colors text-sm flex items-center gap-1"
              >
                <Trash2 size={14} strokeWidth={1} />
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="text-text-secondary hover:text-accent transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
