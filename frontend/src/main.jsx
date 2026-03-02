import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./lib/AuthContext";

// Immediately wake up the backend server (before auth, before render)
// This runs in parallel with Firebase auth init, saving 2-3 minutes on cold start
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"
fetch(`${API_URL}/api/health`, { method: "GET", mode: "cors" }).catch(() => {})

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </BrowserRouter>
  </StrictMode>
);
