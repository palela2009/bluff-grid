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
  console.log("User object:", user)
  return (
    <div className="container">
      <header
        style={{
          display: "flex",
          gap: "1rem",
          padding: "1rem",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <h1>Bluff Grid</h1>
        <div>
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
          {!user && (
            <>
              <button 
                onClick={handleGoogleLogin} 
                disabled={isLoggingIn}
                className="login-button"
                style={{ 
                  opacity: isLoggingIn ? 0.7 : 1,
                  cursor: isLoggingIn ? 'wait' : 'pointer'
                }}
              >
                {isLoggingIn ? 'Signing in...' : 'Login with Google'}
              </button>
              {loginError && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginLeft: '8px' }}>
                  {loginError}
                </span>
              )}
            </>
          )}
          <Link
            to="/"
            className="homebutton"
            onClick={() => soundManager.play("click")}
          >
            home
          </Link>
          <Link
            to="/profile"
            className="profilebutton"
            onClick={() => soundManager.play("click")}
          >
            profile
          </Link>
          <Link
            to="/create"
            className="createbutton"
            onClick={() => soundManager.play("click")}
          >
            create
          </Link>
          <Link
            to="/about"
            className="aboutbutton"
            onClick={() => soundManager.play("click")}
          >
            about
          </Link>
          {user && (
            <>
              <img
                src={user.photoUrl}
                alt="Profile"
                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
              />
              <span>{user.username}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
