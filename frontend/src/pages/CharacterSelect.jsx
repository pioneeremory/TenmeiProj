import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCharacters } from "../api/authApi"; 
import { getSessions, createSession } from "../api/authApi";

function SelectCharacter() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const handleSelect = async (characterId) => {
  const token = localStorage.getItem("userToken");

  try {
    // 1. Fetch all sessions for this user
    const sessions = await getSessions(token);
    
    // 2. Check if a session already exists for this specific character
    let activeSession = sessions.find(s => s.character === characterId);

    if (activeSession) {
      console.log("Resuming existing session:", activeSession.id);
    } else {
      console.log("No session found. Forging new path...");
      // 3. If no session exists, create the initial one (Cycle 1)
      activeSession = await createSession(token, { character: characterId });
    }

    // 4. Navigate to the Game Dashboard with the Session ID
    navigate(`/game/${activeSession.id}`);
    
  } catch (err) {
    console.error("The records are lost in the fire:", err);
  }
};

  useEffect(() => {
  // 1. Grab the token
  const token = localStorage.getItem("userToken");
  
  // 2. Debug: See what is actually being sent
  console.log("Fetching characters with token:", token);

  if (!token) {
    console.error("No token found! Redirecting to login...");
    navigate("/login"); 
    return;
  }
  getCharacters(token).then((data) => {
    if (Array.isArray(data)) {
      setCharacters(data);
    }
    setLoading(false);
  });
}, []);

  const fetchData = async () => {
    try {
      const data = await getCharacters(token);
      
      // 3. Safety Check: If Django sends back an error object instead of an array
      if (data && Array.isArray(data)) {
        setCharacters(data);
      } else {
        console.error("Received unexpected data format:", data);
        setCharacters([]); // Prevents .map() error
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

//   fetchData();
// }, []);
//   useEffect(() => {
//     const token = localStorage.getItem("userToken");
    
//     // Call the GET API
//     getCharacters(token)
//       .then((data) => {
//         setCharacters(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Error fetching characters:", err);
//         setLoading(false);
//       });
//   }, []);

//   const handleSelect = (charId) => {
//     // Logic to start the game session with this character
//     console.log("Selected character ID:", charId);
//     // navigate(`/game/${charId}`); 
//   };

//   if (loading) return <div className="auth-container">Reading the scrolls...</div>;

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <h2>Choose Your Identity</h2>
        <div className="character-grid" style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
          {characters.map((char) => (
            <div key={char.id} className="char-card" onClick={() => handleSelect(char.id)} 
                 style={{ border: '1px solid #cd7f32', padding: '10px', cursor: 'pointer' }}>
              <h3>{char.name}</h3>
              <p>{char.bio}</p>
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