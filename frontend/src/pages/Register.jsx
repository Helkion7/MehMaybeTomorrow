import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        { username, email, password },
        { withCredentials: true, timeout: 5000 }
      );

      setMsg(response.data.message || "Registration successful");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Register failed", error.response?.data || error.message);
      setMsg(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
      <div className="w-full max-w-xs bg-black/20 backdrop-blur-sm p-6 border border-border">
        <div className="mb-6">
          <h1 className="text-xl font-extralight text-text-primary tracking-tight">
            MehMaybeTomorrow
          </h1>
          <p className="text-sm text-text-secondary">Minimalism in motion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="focus-within:ring-1 focus-within:ring-accent transition-all">
            <div className="flex items-center border-b border-border">
              <User
                size={16}
                strokeWidth={1}
                className="text-text-secondary opacity-70"
              />
              <input
                type="text"
                placeholder="Username"
                required
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent text-text-primary focus:outline-none py-2 px-2 text-sm font-extralight"
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
                type="email"
                placeholder="Email"
                required
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-text-primary focus:outline-none py-2 px-2 text-sm font-extralight"
              />
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
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-text-primary focus:outline-none py-2 px-2 text-sm font-extralight"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-secondary hover:text-accent transition-colors"
              >
                {showPassword ? (
                  <EyeOff size={16} strokeWidth={1} className="opacity-70" />
                ) : (
                  <Eye size={16} strokeWidth={1} className="opacity-70" />
                )}
              </button>
            </div>
          </div>

          {msg && <p className="text-xs text-accent">{msg}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-text-primary hover:text-accent border border-border hover:border-accent transition-colors py-2 text-sm font-extralight"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>

          <p className="text-xs text-text-secondary text-center">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-text-primary hover:text-accent transition-colors"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
