import { useContext, useEffect } from "react"
import { auth, googleProvider, facebookProvider } from "../lib/firebase"
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth"
import { AuthContext } from "../lib/AuthContext"
import { Outlet , Link} from "react-router-dom"
import "./Layout.css"
import axiosInstance from "../lib/axiosInstance"
import Footer from "./Footer"

// Detect if user is on mobile device
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export default function Layout() {
  const { user, setUser } = useContext(AuthContext)

  // Handle redirect result on page load (for mobile)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          axiosInstance.post("/users").catch(err => console.error("User creation failed", err))
        }
      })
      .catch((err) => {
        console.error("Redirect result error", err)
      })
  }, [])

  const handleGoogleLogin = async () => {
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
    try {
      await signOut(auth)

      setUser(null)
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
          {!user && (
            <>
              <button onClick={handleGoogleLogin}>Login with Google</button>

            </>
          )}
        <Link to="/" className="homebutton" >home</Link>
       <Link  to="/profile" className="profilebutton">profile</Link>
       <Link to="/create" className="createbutton">create</Link>
       <Link to="/about" className="aboutbutton">about</Link>
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
