import { useContext, useEffect, useState } from "react"
import { auth, googleProvider, facebookProvider } from "../lib/firebase"
import {
  signInWithPopup,
  signOut
} from "firebase/auth"
import { AuthContext } from "../lib/AuthContext"
import { Outlet, Link } from "react-router-dom"
import "./Layout.css"
import axiosInstance from "../lib/axiosInstance"
import Footer from "./Footer"
import soundManager from "../lib/sounds"

export default function Layout() {
  const { user, setUser } = useContext(AuthContext)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode")
    return saved === "true"
  })
  const [soundEnabled, setSoundEnabled] = useState(() =>
    soundManager.isEnabled()
  )
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState(null)

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode")
    } else {
      document.documentElement.classList.remove("dark-mode")
    }
    localStorage.setItem("darkMode", darkMode)
  }, [darkMode])

  const toggleDarkMode = () => {
    soundManager.play("click")
    setDarkMode(!darkMode)
  }

  const toggleSound = () => {
    const newState = soundManager.toggle()
    setSoundEnabled(newState)
  }

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return // Prevent double-clicks
    setIsLoggingIn(true)
    setLoginError(null)
    soundManager.play("click")
    
    googleProvider.setCustomParameters({
      prompt: "select_account"
    })
    
    try {
      // Always use popup - it works on mobile browsers now
      // signInWithRedirect has issues with Safari ITP and storage partitioning
      const result = await signInWithPopup(auth, googleProvider)
      if (result.user) {
        console.log("Login successful:", result.user.email)
        try {
          await axiosInstance.post("/users")
        } catch (err) {
          console.error("User creation failed", err)
        }
        soundManager.play("notification")
      }
    } catch (err) {
      console.error("Google login failed", err)
      // Show user-friendly error message
      if (err.code === 'auth/popup-closed-by-user') {
        setLoginError("Login cancelled. Please try again.")
      } else if (err.code === 'auth/popup-blocked') {
        setLoginError("Popup blocked. Please allow popups for this site.")
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Another popup is already open, ignore
      } else {
        setLoginError("Login failed. Please try again.")
      }
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleFacebookLogin = async () => {
    if (isLoggingIn) return // Prevent double-clicks
    setIsLoggingIn(true)
    setLoginError(null)
    
    facebookProvider.setCustomParameters({
      auth_type: "reauthenticate"
    })
    
    try {
      // Always use popup - works on mobile and avoids storage partitioning issues
      const result = await signInWithPopup(auth, facebookProvider)
      if (result.user) {
        console.log("Facebook login successful:", result.user.email)
        try {
          await axiosInstance.post("/users")
        } catch (err) {
          console.error("User creation failed", err)
        }
        soundManager.play("notification")
      }
    } catch (err) {
      console.error("Facebook login failed", err)
      if (err.code === 'auth/popup-closed-by-user') {
        setLoginError("Login cancelled. Please try again.")
      } else if (err.code === 'auth/popup-blocked') {
        setLoginError("Popup blocked. Please allow popups for this site.")
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Another popup is already open, ignore
      } else {
        setLoginError("Login failed. Please try again.")
      }
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    soundManager.play("click")
    try {
      await signOut(auth)

      setUser(null)
      soundManager.play("leave")
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  return (
    <div className="app-container">
      <header>
        <div className="header-content" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%"
        }}>
          <Link to="/" onClick={() => soundManager.play("click")}>
            <h1>Bluff Grid</h1>
          </Link>
          
          <div className="nav-container">
            <button
              onClick={toggleSound}
              className="sound-toggle"
              title={soundEnabled ? "Sound On" : "Sound Off"}
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>
            <button
              onClick={toggleDarkMode}
              className="dark-mode-toggle"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            
            <Link
              to="/"
              className="homebutton nav-link"
              onClick={() => soundManager.play("click")}
            >
              Home
            </Link>
            <Link
              to="/profile"
              className="profilebutton nav-link"
              onClick={() => soundManager.play("click")}
            >
              Profile
            </Link>
            <Link
              to="/create"
              className="createbutton nav-link"
              onClick={() => soundManager.play("click")}
            >
              Create
            </Link>
            <Link
              to="/about"
              className="aboutbutton nav-link"
              onClick={() => soundManager.play("click")}
            >
              About
            </Link>
            
            {!user ? (
              <>
                <button 
                  onClick={handleGoogleLogin} 
                  disabled={isLoggingIn}
                  className="login-button"
                >
                  {isLoggingIn ? '⏳ Signing in...' : '🔐 Login'}
                </button>
                {loginError && (
                  <span className="login-error">{loginError}</span>
                )}
              </>
            ) : (
              <div className="user-section">
                <img
                  src={user.photoUrl}
                  alt="Profile"
                />
                <span className="username">{user.username}</span>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
