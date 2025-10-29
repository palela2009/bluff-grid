import { LogOut, Pencil, Plus, Trash2, Grid3x3 } from "lucide-react"
import { useNavigate } from "react-router"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../lib/AuthContext"
import axiosInstance from "../../lib/axiosInstance"
import "./profilepage.css"

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [grids, setGrids] = useState([])
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

    console.log("👤 Fetching grids for user:", user.uid, user.email)
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/grids`)
      console.log("✅ Grids fetched:", response.data)
      setGrids(response.data || [])
    } catch (error) {
      console.error("Error fetching grids:", error)
      setGrids([])
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
      // Remove from local state
      setGrids(grids.filter(g => g._id !== gridId))
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
      <div className="container">
        <div className="auth-required">
          <h2>Please Login</h2>
          <p>You need to be logged in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.username} />
              ) : (
                <div className="avatar-placeholder">
                  {user.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h1>{user.username || "Anonymous"}</h1>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-number">{grids.length}</div>
              <div className="stat-label">Grids Created</div>
            </div>
          </div>
        </div>
      </div>

      <main className="profile-main">
        <section className="grids-section">
          <div className="section-header">
            <div>
              <h2>
                <Grid3x3 size={28} />
                My Bluff Grids
              </h2>
              <p>Create and manage your custom grids</p>
            </div>
            <button
              className="btn btn-create"
              onClick={() => navigate("/create")}
            >
              <Plus size={18} /> Create New Grid
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your grids...</p>
            </div>
          ) : grids.length > 0 ? (
            <div className="grids-grid">
              {grids.map(grid => (
                <div key={grid._id} className="grid-card">
                  <div className="grid-card-header">
                    <h3>{grid.title}</h3>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteGrid(grid._id)}
                      title="Delete grid"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid-card-body">
                    <div className="statements-preview">
                      {grid.statements?.slice(0, 3).map((statement, idx) => (
                        <div key={idx} className="statement-item">
                          <span className="statement-number">{idx + 1}</span>
                          <span className="statement-text">{statement}</span>
                        </div>
                      ))}
                      {grid.statements?.length > 3 && (
                        <div className="more-statements">
                          +{grid.statements.length - 3} more statements
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid-card-footer">
                    <div className="grid-meta">
                      <span className="grid-date">
                        Created {formatDate(grid.createdAt)}
                      </span>
                      <span className="true-answer-badge">
                        True: #{grid.trueStatementIndex + 1}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Grid3x3 size={64} />
              <h3>No Grids Yet</h3>
              <p>Create your first bluff grid to start playing with friends!</p>
              <button
                className="btn btn-create"
                onClick={() => navigate("/create")}
              >
                <Plus size={18} /> Create Your First Grid
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default ProfilePage
