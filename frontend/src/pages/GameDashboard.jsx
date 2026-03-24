// frontend/src/pages/GameDashboard.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSessions, getCharacters, performGameAction } from "../api/authApi";import "../styles/GameDashboard.css";
import Typewriter from "../components/Typewriter";

// Import Assets for the Sidebar
import malePng from "../assets/maleCharacter.png";
import femalePng from "../assets/femaleCharacter.png";

function GameDashboard() {
  const { sessionId } = useParams();
  const scrollRef = useRef(null);
  const navigate = useNavigate();
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
  useEffect(() => {
    if (scrollRef.current) {
      // This moves the scrollbar to the bottom height of the content
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.story_log]); // Only fires when the story text changes
const handleAction = async (type) => {
    const token = localStorage.getItem("userToken");
    setLatestNarration(""); // Clear old text

    // 1. Call the unified API
    const result = await performGameAction(token, sessionId, type.toUpperCase());

    if (result) {
      // 2. Check for Death/Game Over
      if (result.status === "DEAD") {
        setLatestNarration(result.narration);
        // You could trigger a Modal or redirect here later
      }

      // 3. Update all stats from the single response
      setSession({
        ...session,
        grit: result.grit,
        rice: result.rice,
        fire_danger: result.fire_danger,
        segments_left: result.segments_left,
        current_cycle: result.current_cycle,
        story_log: result.story_log
      });
      // DEATH CONDITION
      if (result.status === "DEAD" || result.grit <= 0) {
        setLatestNarration(result.narration || "The heat becomes a weight you can no longer carry. Your vision fades into a wall of orange flame.");
        // Optional: Set a flag to disable buttons
        setSession(prev => ({ ...prev, grit: result.grit, status: "DEAD" }));
      }

      setLatestNarration(result.narration);
    }
  };

//   const handleAction = async (actionType) => {
//     const token = localStorage.getItem("userToken");
//     let result;
    
//     // Clear typewriter before new text comes in
//     setLatestNarration("");

//     if (actionType === "scavenge") {
//       result = await scavengeAction(token, sessionId);
//     } else {
//       result = await restAction(token, sessionId);
//     }

//     if (result) {
//       // Trigger Typewriter with the new story segment
//       setLatestNarration(result.narration);

//       // Update local state with new stats and the updated full log
//       setSession({
//         ...session,
//         rice: result.rice,
//         grit: result.grit,
//         current_cycle: session.current_cycle + 1,
//         story_log: result.story_log // The history is now preserved
//       });
//     }
//   };

  if (loading) return <div className="auth-container"><h2>Loading Records...</h2></div>;
  if (!session) return <div className="auth-container"><h2>Session Lost in the Fire</h2></div>;

return (
    <div className="dashboard-layout">
      {/* COLUMN 1: Stats Sidebar */}
      <aside className="stats-sidebar">
        <div className="portrait-frame">
          <img 
            src={character?.is_male ? malePng : femalePng} 
            alt="Portrait" 
            className="sidebar-portrait"
          />
          <h3 className="character-name">{character?.name}</h3>
        </div>
        <hr className="bronze-divider" />
        <div className="stat-row">🌾 Rice: {Math.max(0, session.rice)}</div>
        <div className="stat-row">🕯️ Grit: {Math.max(0, session.grit)}</div>
        <div className="stat-row">⏳ Day: {session.current_cycle}</div>
        <div className="stat-row">🕒 Segments: {session.segments_left}/3</div>
      </aside>

      {/* COLUMN 2: THE STORY ENGINE */}
      <main className="story-engine">
        <header className="story-header">
          <h2>KYOTO - YEAR 1788</h2>
        </header>

        <div className="narration-container">
          {/* 📜 1. The Scrollable History */}
        <div className="history-log" ref={scrollRef}>
          {/* We only want the grey history to appear ONCE the user has moved 
              past the initial prologue screen. 
          */}
          {latestNarration && session.story_log}
        </div>

          {/* ✨ 2. The Active Narration Area */}
          <div className="active-narration">
            {session.current_cycle === 1 && session.segments_left === 3 && !latestNarration ? (
              <div className="prologue-text">
                <Typewriter text={session.story_log} speed={30} />
              </div>
            ) : (
              <div className="latest-entry">
                {latestNarration ? (
                  <Typewriter text={latestNarration} key={latestNarration} speed={25} />
                ) : (
                  <p className="loading-dots">The ink dries on the scroll...</p>
                )}
              </div>
            )}
          </div>
        </div> {/* 👈 Container Closed Correcty */}

        <div className="action-bar">
          {session.grit <= 0 || session.status === "DEAD" ? (
            <button onClick={() => navigate("/characters")} className="btn-restart">
              Return to the Spirit World
            </button>
          ) : (
            <>
              <button onClick={() => handleAction("SCAVENGE")} className="btn-scavenge">Scavenge</button>
              <button onClick={() => handleAction("DOUSE")} className="btn-douse">Douse Fire</button>
              <button onClick={() => handleAction("REST")} className="btn-rest">Rest & Eat</button>
            </>
          )}
        </div>
      </main>

      {/* COLUMN 3: Hazard Sidebar */}
      <aside className="hazard-sidebar">
        <h3>Fire Hazard</h3>
        <div className="hazard-container">
          <div 
            className="hazard-fill" 
            style={{ 
              width: `${session.fire_danger}%`, 
              backgroundColor: session.fire_danger > 70 ? '#ff0000' : '#ff8c00' 
            }}
          ></div>
        </div>
        <p className="hazard-value">{session.fire_danger}% Intensity</p>
      </aside>
    </div>
  );

}

export default GameDashboard;