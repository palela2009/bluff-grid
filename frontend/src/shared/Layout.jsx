import { useContext, useEffect, useState } from "react"
import { auth, googleProvider, facebookProvider } from "../lib/firebase"
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut
} from "firebase/auth"
import { AuthContext } from "../lib/AuthContext"
import { Outlet, Link } from "react-router-dom"
import "./Layout.css"
import axiosInstance from "../lib/axiosInstance"
import Footer from "./Footer"
import soundManager from "../lib/sounds"

// Detect if user is on mobile device
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

// Detect if running in Safari (iOS has issues with popup)
const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

// Detect if running in an iframe or WebView
const isInAppBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera
  return ua.includes('FBAN') || ua.includes('FBAV') || ua.includes('Instagram') || ua.includes('Twitter')
}

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

  // Handle redirect result on page load (for mobile)
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Check if we're returning from a redirect
        const result = await getRedirectResult(auth)
        if (result && result.user) {
          console.log("Mobile redirect successful, user:", result.user)
          // AuthContext will handle setting the user via onAuthStateChanged
          try {
            await axiosInstance.post("/users")
            soundManager.play("notification")
          } catch (err) {
            console.error("User creation failed", err)
          }
        }
      } catch (err) {
        console.error("Redirect result error:", err)
        // Handle specific Firebase errors
        if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
          console.log("Popup was blocked or closed, will try redirect next time")
        }
      }
    }

    handleRedirect()
  }, [])

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return // Prevent double-clicks
    setIsLoggingIn(true)
    soundManager.play("click")
    
    googleProvider.setCustomParameters({
      prompt: "select_account"
    })
    
    try {
      // Use redirect for mobile, Safari, or in-app browsers
      // These have issues with popups
      const shouldUseRedirect = isMobile() || isSafari() || isInAppBrowser()
      
      if (shouldUseRedirect) {
        // Store a flag to indicate we're in the login process
        sessionStorage.setItem('loginPending', 'true')
        await signInWithRedirect(auth, googleProvider)
        // Note: code after redirect won't run, page will reload
      } else {
        // Use popup on desktop browsers
        const result = await signInWithPopup(auth, googleProvider)
        if (result.user) {
          await axiosInstance.post("/users")
          soundManager.play("notification")
        }
      }
    } catch (err) {
      console.error("Google login failed", err)
      // If popup fails, try redirect as fallback
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        try {
          sessionStorage.setItem('loginPending', 'true')
          await signInWithRedirect(auth, googleProvider)
        } catch (redirectErr) {
          console.error("Redirect also failed:", redirectErr)
        }
      }
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleFacebookLogin = async () => {
    if (isLoggingIn) return // Prevent double-clicks
    setIsLoggingIn(true)
    
    facebookProvider.setCustomParameters({
      auth_type: "reauthenticate"
    })
    
    try {
      // Use redirect for mobile, Safari, or in-app browsers
      const shouldUseRedirect = isMobile() || isSafari() || isInAppBrowser()
      
      if (shouldUseRedirect) {
        sessionStorage.setItem('loginPending', 'true')
        await signInWithRedirect(auth, facebookProvider)
      } else {
        const result = await signInWithPopup(auth, facebookProvider)
        if (result.user) {
          await axiosInstance.post("/users")
        }
      }
    } catch (err) {
      console.error("Facebook login failed", err)
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        try {
          sessionStorage.setItem('loginPending', 'true')
          await signInWithRedirect(auth, facebookProvider)
        } catch (redirectErr) {
          console.error("Redirect also failed:", redirectErr)
        }
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
