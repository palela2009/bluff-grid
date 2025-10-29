import { useState } from "react"
import { Routes, Route } from "react-router"
import { Home } from "./Pages/home/Home.jsx"
import ProfilePage from "./Pages/Profilepage/ProfilePage.jsx"
import CreateGridPage from ".//Pages/Gridpage/CreateGridPage.jsx"
import "./App.css"
import "./darkmode.css"
import { Game } from "./Pages/game/game"
import Layout from "./shared/Layout.jsx"
import Lobby from "./Pages/lobby_page/LobbyPage.jsx"
import Leaderboard from "./Pages/Leaderboard/Leaderboard"
import About from "./Pages/About/About.jsx"

function App() {
  const [bluffGrids, setBluffGrids] = useState([])

  const addGrid = grid => {
    const id = Date.now()
    const createdAt = new Date().toLocaleDateString()
    setBluffGrids(prev => [...prev, { id, createdAt, ...grid }])
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/create"
          element={
            <CreateGridPage
              onSaveGrid={grid => {
                addGrid(grid)
              }}
            />
          }
        />
        <Route path="/game" element={<Game />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  )
}

export default App
