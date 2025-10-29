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

export default function Layout() {
  const { user, setUser } = useContext(AuthContext)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode")
    return saved === "true"
  })
  const [soundEnabled, setSoundEnabled] = useState(() =>
    soundManager.isEnabled()
  )

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
        const result = await getRedirectResult(auth)
        if (result && result.user) {
          console.log("Mobile redirect successful, user:", result.user)
          // AuthContext will handle setting the user via onAuthStateChanged
          await axiosInstance
            .post("/users")
            .catch(err => console.error("User creation failed", err))
        }
      } catch (err) {
        console.error("Redirect result error:", err)
      }
    }

    handleRedirect()
  }, [])

  const handleGoogleLogin = async () => {
    soundManager.play("click")
    googleProvider.setCustomParameters({
      prompt: "select_account"
    })
    try {
      if (isMobile()) {
        // Use redirect on mobile
        await signInWithRedirect(auth, googleProvider)
      } else {
        // Use popup on desktop
        await signInWithPopup(auth, googleProvider)
        await axiosInstance.post("/users")
        soundManager.play("notification")
      }
    } catch (err) {
      console.error("Google login failed", err)
    }
  }

  const handleFacebookLogin = async () => {
    facebookProvider.setCustomParameters({
      auth_type: "reauthenticate"
    })
    try {
      if (isMobile()) {
        // Use redirect on mobile
        await signInWithRedirect(auth, facebookProvider)
      } else {
        // Use popup on desktop
        await signInWithPopup(auth, facebookProvider)
        await axiosInstance.post("/users")
      }
    } catch (err) {
      console.error("Facebook login failed", err)
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
              <button onClick={handleGoogleLogin}>Login with Google</button>
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
