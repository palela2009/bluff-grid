import { Plus, Trash2, Grid3x3, User, Calendar, Sparkles } from "lucide-react"
import { useNavigate } from "react-router"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../lib/AuthContext"
import axiosInstance from "../../lib/axiosInstance"
import "./profilepage.css"

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  // Load cached grids instantly from localStorage
  const [grids, setGrids] = useState(() => {
    try {
      const cached = localStorage.getItem("cached_grids")
      return cached ? JSON.parse(cached) : []
    } catch { return [] }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserGrids()
  }, [user])

  const fetchUserGrids = async () => {
    if (!user?.uid) {
      console.log("❌ No user UID, skipping grid fetch")
      setLoading(false)
      return
    }

    // If we have cached grids, show them immediately (no loading spinner)
    const hasCached = grids.length > 0
    if (!hasCached) setLoading(true)

    console.log("👤 Fetching grids for user:", user.uid, user.email)
    try {
      const response = await axiosInstance.get(`/grids`)
      console.log("✅ Grids fetched:", response.data)
      const freshGrids = response.data || []
      setGrids(freshGrids)
      // Cache for next visit
      try { localStorage.setItem("cached_grids", JSON.stringify(freshGrids)) } catch {}
    } catch (error) {
      console.error("Error fetching grids:", error)
      // Keep cached grids on error instead of clearing
      if (!hasCached) setGrids([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGrid = async gridId => {
    if (!window.confirm("Are you sure you want to delete this grid?")) {
      return
    }

    try {
      await axiosInstance.delete(`/grids/${gridId}`)
      const updated = grids.filter(g => g._id !== gridId)
      setGrids(updated)
      try { localStorage.setItem("cached_grids", JSON.stringify(updated)) } catch {}
    } catch (error) {
      console.error("Error deleting grid:", error)
      alert("Failed to delete grid. Please try again.")
    }
  }

  const formatDate = dateString => {
    if (!dateString) return "Recently"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-auth-required">
          <User size={48} />
          <h2>Please Login</h2>
          <p>You need to be logged in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-glow profile-glow-1" />
      <div className="profile-glow profile-glow-2" />

      {/* Header card */}
      <section className="profile-header-card">
        <div className="profile-header-inner">
          <div className="profile-user">
            <div className="profile-pic">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.username} />
              ) : (
                <span>{user.username?.charAt(0).toUpperCase() || "U"}</span>
              )}
            </div>
            <div className="profile-user-info">
              <h1>{user.username || "Anonymous"}</h1>
              <p>{user.email}</p>
            </div>
          </div>

          <div className="profile-stat-pills">
            <div className="profile-pill">
              <Grid3x3 size={18} />
              <span className="pill-value">{grids.length}</span>
              <span className="pill-label">Grids</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grids */}
      <section className="profile-grids">
        <div className="grids-top-row">
          <div>
            <h2><Sparkles size={22} /> My Bluff Grids</h2>
            <p>Create and manage your custom grids</p>
          </div>
          <button className="btn-new-grid" onClick={() => navigate("/create")}>
            <Plus size={18} /> New Grid
          </button>
        </div>

        {loading ? (
          <div className="profile-loading">
            <div className="profile-spinner" />
            <p>Loading your grids...</p>
          </div>
        ) : grids.length > 0 ? (
          <div className="grids-list">
            {grids.map(grid => (
              <div key={grid._id} className="grid-item-card">
                <div className="grid-item-top">
                  <h3>{grid.title}</h3>
                  <button
                    className="grid-delete-btn"
                    onClick={() => handleDeleteGrid(grid._id)}
                    title="Delete grid"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>

                <div className="grid-item-statements">
                  {grid.statements?.slice(0, 3).map((statement, idx) => (
                    <div key={idx} className="grid-stmt">
                      <span className="grid-stmt-num">{idx + 1}</span>
                      <span className="grid-stmt-text">{statement}</span>
                    </div>
                  ))}
                  {grid.statements?.length > 3 && (
                    <div className="grid-stmt-more">
                      +{grid.statements.length - 3} more
                    </div>
                  )}
                </div>

                <div className="grid-item-footer">
                  <span className="grid-item-date">
                    <Calendar size={13} />
                    {formatDate(grid.createdAt)}
                  </span>
                  <span className="grid-item-truth">
                    True: #{grid.trueStatementIndex + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="profile-empty">
            <Grid3x3 size={56} />
            <h3>No Grids Yet</h3>
            <p>Create your first bluff grid to start playing!</p>
            <button className="btn-new-grid" onClick={() => navigate("/create")}>
              <Plus size={18} /> Create Your First Grid
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default ProfilePage
