import { useContext } from "react"
import { auth, googleProvider, facebookProvider } from "../lib/firebase"
import { signInWithPopup, signOut } from "firebase/auth"
import { AuthContext } from "../lib/AuthContext"
import { Outlet , Link} from "react-router-dom"
import "./Layout.css"
import axiosInstance from "../lib/axiosInstance"
import Footer from "./Footer"


export default function Layout() {
  const { user, setUser } = useContext(AuthContext)

  const handleGoogleLogin = async () => {
    googleProvider.setCustomParameters({
      prompt: "select_account"
    })
    try {
      await signInWithPopup(auth, googleProvider)
      await axiosInstance.post("/users")
    } catch (err) {
      console.error("Google login failed", err)
    }
  }

  const handleFacebookLogin = async () => {
    facebookProvider.setCustomParameters({
      auth_type: "reauthenticate"
    })
    try {
      await signInWithPopup(auth, facebookProvider)
      await axiosInstance.post("/users")
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
