import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import TodoPage from "./pages/TodoPage";
import FinishedPage from "./pages/FinishedPage";
import ProfilePage from "./pages/ProfilePage";
import LootBoxesPage from "./pages/LootBoxesPage";
import RewardsPage from "./pages/RewardsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { RewardProvider } from "./contexts/RewardContext";
import ThemeManager from "./components/ThemeManager";
import { AnimationManager } from "./components/AnimationManager";

function App() {
  return (
    <Router>
      <div className="color-scheme-dark">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/todo"
            element={
              <ProtectedRoute>
                <RewardProvider>
                  <ThemeManager />
                  <AnimationManager>
                    <Layout>
                      <TodoPage />
                    </Layout>
                  </AnimationManager>
                </RewardProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/finished"
            element={
              <ProtectedRoute>
                <RewardProvider>
                  <ThemeManager />
                  <AnimationManager>
                    <Layout>
                      <FinishedPage />
                    </Layout>
                  </AnimationManager>
                </RewardProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <RewardProvider>
                  <ThemeManager />
                  <AnimationManager>
                    <Layout>
                      <ProfilePage />
                    </Layout>
                  </AnimationManager>
                </RewardProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rewards"
            element={
              <ProtectedRoute>
                <RewardProvider>
                  <ThemeManager />
                  <AnimationManager>
                    <Layout>
                      <RewardsPage />
                    </Layout>
                  </AnimationManager>
                </RewardProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lootboxes"
            element={
              <ProtectedRoute>
                <RewardProvider>
                  <ThemeManager />
                  <AnimationManager>
                    <Layout>
                      <LootBoxesPage />
                    </Layout>
                  </AnimationManager>
                </RewardProvider>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
