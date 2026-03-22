import { useState } from "react";
import Header from "./components/Header";
import Marketplace from "./pages/Marketplace";
import Leaderboard from "./pages/Leaderboard";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [activePage, setActivePage] = useState("Marketplace");

  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <Header activePage={activePage} setActivePage={setActivePage} />
      <main style={{ paddingTop: "64px" }}>
        {activePage === "Marketplace" && <Marketplace />}
        {activePage === "Leaderboard" && <Leaderboard />}
        {activePage === "Dashboard" && <Dashboard />}
      </main>
    </div>
  );
}