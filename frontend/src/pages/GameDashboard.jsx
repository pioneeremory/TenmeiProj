
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSessions, getCharacters, performGameAction, endCycle } from "../api/authApi";
import "../styles/GameDashboard.css";
import ReactMarkdown from 'react-markdown';
import Typewriter from "../components/Typewriter";


import malePng from "../assets/maleCharacter.png";
import femalePng from "../assets/femaleCharacter.png";

function GameDashboard() {
  const { sessionId } = useParams();
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latestNarration, setLatestNarration] = useState("");
  const [activeEvent, setActiveEvent] = useState(null);


  useEffect(() => {
    const fetchGameData = async () => {
      const token = localStorage.getItem("userToken");
      try {
        const allSessions = await getSessions(token);
        // console.log("All Sessions from API:", allSessions);
        // console.log("Session ID from URL:", sessionId);
        const currentSession = allSessions.find(s => String(s.id) === String(sessionId));

        if (currentSession) {
          setSession(currentSession);
        if (currentSession.pending_event) {
          setActiveEvent(currentSession.pending_event);
        }
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

  const handleResolveEvent = async (choiceValue) => {
    const token = localStorage.getItem("userToken");
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/sessions/${sessionId}/resolve_event/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({ choice: choiceValue }),
      });

      const data = await response.json();

      if (response.ok) {
        
        setSession((prev) => ({
          ...prev, 
          ...data,
          rice: data.rice,
          grit: data.grit,
          fire_danger: data.fire_danger,
          story_log: data.story_log || prev.story_log,
          pending_event: null,
        }));
        
        setActiveEvent(null);
        setLatestNarration(data.result_text);
      }
    } catch (err) {
      console.error("Event Resolution Failed:", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.story_log, latestNarration]);

  const handleAction = async (type) => {
    const token = localStorage.getItem("userToken");
    setLatestNarration(""); 

    const result = await performGameAction(token, sessionId, type.toUpperCase());

    console.log("API Result:", result);

    if (result) {
      // Update session with all new stats and the buffer
      setSession({
        ...session,
        grit: result.grit,
        rice: result.rice,
        fire_danger: result.fire_danger,
        segments_left: result.segments_left,
        current_cycle: result.current_cycle,
        story_log: result.story_log,
        daily_actions_buffer: result.daily_actions_buffer 
      });

    if (result.status === "DEAD") {
          setSession({
            ...session,
            grit: 0,
            status: "DEAD",
            failure_reason: result.failure_reason // Store the specific reason
          });
          setLatestNarration(result.failure_reason);
        }
    }
  };


  const handleEndDay = async () => {
    const token = localStorage.getItem("userToken");
    try {
      const result = await endCycle(token, sessionId);
      if (result) {
        setSession({
          ...session,
          current_cycle: result.current_cycle,
          segments_left: result.segments_left,
          fire_danger: result.fire_danger,
          pending_event: result.event,
          daily_actions_buffer: [], // Clear local buffer for the new day
          status: "ACTIVE"
        });
        if (result.event) {
          setActiveEvent(result.event);
        } else {
          setLatestNarration(`The sun rises on Day ${result.current_cycle}. Kyoto continues to burn.`);
        }
      }
    } catch (err) {
      console.error("Failed to end day:", err);
    }
  };

  if (loading) return <div className="auth-container"><h2>Loading Records...</h2></div>;
  if (!session) return <div className="auth-container"><h2>Session Lost in the Fire</h2></div>;

  return (
    <div className="dashboard-layout">

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
        <hr className="bronze-divider" />
        <div className="inventory-section">
          <h4>Inventory</h4>
          {session.has_monastery_key ? (
            <div className="inventory-item tooltipped" title="Unlocks Shokokuji Sanctuary">
              🗝️ Iron Key (Shokokuji)
            </div>
          ) : (
            <div className="inventory-empty">No rare items...</div>
          )}
        </div>
      </aside>

      <main className="story-engine">
        <header className="story-header">
          <h2>KYOTO - YEAR 1788</h2>
        </header>

        <div className="narration-container">

          <div className="history-log" ref={scrollRef}>
            {latestNarration && <ReactMarkdown>{session.story_log}</ReactMarkdown>}
          </div>
        <div className="active-narration">

          {session.segments_left === 0 && session.grit > 0 ? (
            <div className="cycle-recap">
              <h3 className="recap-title">Evening in the Ruins</h3>
              <p>The smoke thickens as night falls. You reflect on your deeds:</p>
              <div className="recap-list">
                {session.daily_actions_buffer?.map((item, idx) => (
                  <div key={idx} className="recap-item" style={{ marginBottom: '10px' }}>
                    <strong>{item.action}:</strong> {item.summary}
                  </div>
                ))}
              </div>
            </div>
          ) : (

        <div className="latest-entry">
              {latestNarration ? (
                /* The Typewriter displays the immediate AI response from handleAction */
                <Typewriter text={latestNarration} key={latestNarration} speed={25} />
              ) : session.current_cycle === 1 && session.segments_left === 3 ? (
                /* 🚨 THE FIX: If it is the start of Day 1, render the FULL story_log */
                <div className="prologue-text">
                  <ReactMarkdown>{session.story_log}</ReactMarkdown>
                </div>
              ) : (
                /* Otherwise, use the fallback: only show the *last* AI entry */
                <div className="fallback-text">
                  <ReactMarkdown>
                    {session?.story_log ? session.story_log.split('\n\n').pop() : "The embers glow in the silence..."}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        <div className="action-bar">
          {session.grit <= 0 || session.status === "DEAD" ? (
          <div className="death-summary">
                <h3 className="death-header">YOU HAVE PERISHED</h3>
                <p className="death-reason">{session.failure_reason || "The Great Fire has claimed another soul."}</p>
                
                <button onClick={() => navigate("/characters")} className="btn-restart">
                  Return to the Spirit World
                </button>
              </div> 
            ) : activeEvent ? (
                /* 🏮 EVENT STATE (The Takeover) */
                <div className="event-controls">
                  <div className="event-info">
                    <h3 className="event-title">{activeEvent.npc}: {activeEvent.title}</h3>
                    <p className="event-description">{activeEvent.text}</p>
                  </div>
                  <div className="event-options">
                    {activeEvent.options.map((opt, idx) => (
                      <button
                        key={idx}
                        className="event-btn"
                        disabled={opt.disabled}
                        onClick={() => handleResolveEvent(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
          ) : session.segments_left > 0 ? (
            <>
              <button onClick={() => handleAction("SCAVENGE")} className="btn-scavenge">Scavenge</button>
              <button onClick={() => handleAction("DOUSE")} className="btn-douse">Douse Fire</button>
              <button onClick={() => handleAction("REST")} className="btn-rest">Rest & Eat</button>
            </>
          ) : (
            /* Button triggers the Day/Night Transition */
            <button onClick={handleEndDay} className="btn-next-day">
              Rest for the Night (Begin Day {session.current_cycle + 1})
            </button>
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