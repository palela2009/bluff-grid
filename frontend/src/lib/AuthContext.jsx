import { createContext, useEffect, useState } from "react"
import { auth } from "./firebase"
import { onAuthStateChanged } from "firebase/auth"
import axiosInstance from "./axiosInstance"

export const AuthContext = createContext({
  isLoading: true,
  user: null,
  setUser: () => {}
})

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken()

        // Get user info from Firebase
        let username = firebaseUser.displayName
        const photoUrl = firebaseUser.photoURL
        const email = firebaseUser.email
        const uid = firebaseUser.uid

        // If displayName is not available, try to get it from the user object
        if (!username) {
          // Wait a bit for Firebase to populate the user object
          await new Promise(resolve => setTimeout(resolve, 100))
          username =
            firebaseUser.displayName || email?.split("@")[0] || "Anonymous"
        }

        // Ensure we have a username
        if (!username) {
          username = email?.split("@")[0] || "Anonymous"
        }

        console.log("Setting user with username:", username)
        setUser({ username, photoUrl, email, uid })

        try {
          axiosInstance.interceptors.request.use(
            async config => {
              if (token) {
                config.headers.Authorization = `Bearer ${token}`
              }
              return config
            },
            error => Promise.reject(error)
          )

          await axiosInstance.post("/users")
        } catch (err) {
          console.error("User creation failed:", err)
        }
      } else {
        localStorage.removeItem("token")
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
