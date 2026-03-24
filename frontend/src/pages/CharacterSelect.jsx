import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCharacters, getSessions, createSession, deleteCharacter } from "../api/authApi";

function SelectCharacter() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(""); 
  const navigate = useNavigate();

  // 1. Fetch Characters on Load
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      return;
    }

    getCharacters(token).then((data) => {
      if (Array.isArray(data)) {
        setCharacters(data);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Fetch failed:", err);
      setLoading(false);
    });
  }, [navigate]);

  // 2. Handle Character Selection (and Session logic)
  const handleSelect = async (characterId) => {
    const token = localStorage.getItem("userToken");

    try {
      const sessions = await getSessions(token);
      let activeSession = sessions.find(s => s.character === characterId);

      if (!activeSession) {
        console.log("No session found. Forging new path...");
        activeSession = await createSession(token, { character: characterId });
      }

      navigate(`/game/${activeSession.id}`);
    } catch (err) {
      console.error("The records are lost in the fire:", err);
    }
  };

  // 3. Handle Deletion
  const handleDelete = async (e, charId) => {
    e.stopPropagation(); 
    
    const charObj = characters.find(c => c.id === charId);
    const charName = charObj ? charObj.name : "The character";

    if (window.confirm(`Are you sure you want to turn ${charName} to ash?`)) {
      const token = localStorage.getItem("userToken");
      const success = await deleteCharacter(token, charId);
      
      if (success) {
        setStatusMessage(`${charName} has been returned to the spirit world.`);
        setCharacters(prev => prev.filter(c => c.id !== charId));
        setTimeout(() => setStatusMessage(""), 3000);
      }
    }
  };

  if (loading) return <div className="auth-container">Reading the scrolls...</div>;

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <h2>Choose Your Identity</h2>
        
        {statusMessage && (
          <div className="delete-notification" style={{ color: '#d4af37', marginBottom: '10px' }}>
            <span>🏮 {statusMessage}</span>
          </div>
        )}

        <div className="character-grid" style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
          {characters.map((char) => (
            <div 
              key={char.id} 
              className="char-card" 
              onClick={() => handleSelect(char.id)} 
              style={{ border: '1px solid #cd7f32', padding: '15px', cursor: 'pointer', position: 'relative' }}
            >
              <h3>{char.name}</h3>
              <p>{char.bio || "A soul wandering the embers of Kyoto."}</p>
              <button 
                className="btn-delete-char" 
                onClick={(e) => handleDelete(e, char.id)}
                style={{ background: 'transparent', color: '#ff4500', border: '1px solid #ff4500', cursor: 'pointer', marginTop: '10px' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        
        <button 
          className="btn-submit" 
          style={{ marginTop: '20px' }} 
          onClick={() => navigate("/create-character")}
        >
          Forge New Identity
        </button>
      </div>
    </div>
  );
}

export default SelectCharacter;