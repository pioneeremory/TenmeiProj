// frontend/src/pages/GameDashboard.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSessions, scavengeAction, restAction, getCharacters } from "../api/authApi"; 
import "../styles/GameDashboard.css";
import Typewriter from "../components/Typewriter";

// Import Assets for the Sidebar
import malePng from "../assets/maleCharacter.png";
import femalePng from "../assets/femaleCharacter.png";

function GameDashboard() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [character, setCharacter] = useState(null); // Added to track portrait info
  const [loading, setLoading] = useState(true);
  const [latestNarration, setLatestNarration] = useState("");

  useEffect(() => {
    const fetchGameData = async () => {
      const token = localStorage.getItem("userToken");
      try {
        // 1. Fetch Session
        const allSessions = await getSessions(token);
        const currentSession = allSessions.find(s => s.id === parseInt(sessionId));
        setSession(currentSession);

        // 2. Fetch Character to get Gender/Portrait info
        if (currentSession) {
          const allChars = await getCharacters(token);
          const currentChar = allChars.find(c => c.id === currentSession.character);
          setCharacter(currentChar);
        }
      } catch (err) {
        console.error("Failed to fetch game data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [sessionId]);

  const handleAction = async (actionType) => {
    const token = localStorage.getItem("userToken");
    let result;
    
    // Clear typewriter before new text comes in
    setLatestNarration("");

    if (actionType === "scavenge") {
      result = await scavengeAction(token, sessionId);
    } else {
      result = await restAction(token, sessionId);
    }

    if (result) {
      // Trigger Typewriter with the new story segment
      setLatestNarration(result.narration);

      // Update local state with new stats and the updated full log
      setSession({
        ...session,
        rice: result.rice,
        grit: result.grit,
        current_cycle: session.current_cycle + 1,
        story_log: result.story_log // The history is now preserved
      });
    }
  };

  if (loading) return <div className="auth-container"><h2>Loading Records...</h2></div>;
  if (!session) return <div className="auth-container"><h2>Session Lost in the Fire</h2></div>;

  return (
    <div className="dashboard-layout">
      {/* COLUMN 1: Character Stats & Portrait */}
      <aside className="stats-sidebar">
        <div className="portrait-frame">
          <img 
            src={character?.is_male ? malePng : femalePng} 
            alt="Character Portrait" 
            className="sidebar-portrait"
          />
          <h3 className="character-name">{character?.name}</h3>
        </div>
        <hr className="bronze-divider" />
        <div className="stat-row">🌾 Rice: {session.rice}</div>
        <div className="stat-row">🕯️ Grit: {session.grit}</div>
        <div className="stat-row">⏳ Cycle: {session.current_cycle}</div>
      </aside>

      {/* COLUMN 2: The Story Engine */}
      <main className="story-engine">
        <header className="story-header">
          <h2>Kyoto - Year 1788</h2>
        </header>

        <div className="narration-box">
          {/* 📜 The Scrollable History (Dimmed) */}
          <div className="history-log">
            {session.story_log}
          </div>

          {/* ✨ The Live Narration (Gold/Highlighted) */}
          {latestNarration && (
            <div className="latest-entry">
              <Typewriter text={latestNarration} speed={25} />
            </div>
          )}
        </div>

        <div className="action-bar">
          <button onClick={() => handleAction("scavenge")} className="btn-scavenge">
            Scavenge
          </button>
          <button onClick={() => handleAction("rest")} className="btn-rest">
            Rest
          </button>
        </div>
      </main>

      {/* COLUMN 3: Hazard & Environmental State */}
      <aside className="hazard-sidebar">
        <h3>Fire Hazard</h3>
        {/* hazard_level is now dynamic from our migration! */}
        <div className={`heat-meter intensity-${session.hazard_level}`}>
           {session.hazard_level > 3 ? 'EXTREME' : 'MODERATE'}
        </div>
        <p className="hazard-hint">
          {session.hazard_level > 3 
            ? "The air is thick with cinders. Finding food is perilous."
            : "The fires are distant, but the wind is changing."}
        </p>
      </aside>
    </div>
  );
}

export default GameDashboard;