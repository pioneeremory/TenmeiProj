// frontend/src/pages/CharacterCreate.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCharacter, getSessions, createSession } from "../api/authApi";
import Form from "../components/Form";
import malePng from "../assets/maleCharacter.png";
import femalePng from "../assets/femaleCharacter.png";

function CreateCharacter() {
  const [formData, setFormData] = useState({ 
    name: "", 
    is_male: true,
    maleImage: malePng,    
    femaleImage: femalePng 
  });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const inputValue = type === 'radio' ? value === 'true' : value; 
    setFormData({ ...formData, [name]: inputValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("userToken");
  
    const characterPayload = {
      name: formData.name,
      is_male: formData.is_male 
    };
    
    try {
      // 1. Forge the Identity
      const charResult = await createCharacter(token, characterPayload);
      
      if (charResult.id) {
        setMsg("Identity forged. Entering Kyoto...");

        // 2. Automate Game Entry: Check for existing session or create a new one
        const sessions = await getSessions(token);
        let activeSession = sessions.find(s => s.character === charResult.id);

        if (!activeSession) {
          // Create the "Home Base" session if it doesn't exist
          activeSession = await createSession(token, { character: charResult.id });
        }

        // 3. Launch the Wide-Screen Game Dashboard
        setTimeout(() => navigate(`/game/${activeSession.id}`), 1500);
      } else {
        setMsg("The spirits reject this name. (Check inputs)");
      }
    } catch (err) {
      setMsg("Connection lost in the smoke of Kyoto.");
    }
  };

  return (                                                            
    <Form 
      formType="Create Character"
      formData={formData}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      responseMsg={msg}
    />
  );
}

export default CreateCharacter;


// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { createCharacter } from "../api/authApi";
// import Form from "../components/Form";

// function CreateCharacter() {
//   const [formData, setFormData] = useState({ name: "", bio: "" });
//   const [msg, setMsg] = useState("");
//   const navigate = useNavigate();

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const token = localStorage.getItem("userToken");
    
//     try {
//       const result = await createCharacter(token, formData);
//       if (result.id) { // Django returns the new object with an ID on success
//         setMsg("Identity forged in the annals of Tenmei.");
//         // Redirect back to selection after a short delay
//         setTimeout(() => navigate("/characters"), 1500);
//       } else {
//         setMsg("The spirits reject this name. (Check inputs)");
//       }
//     } catch (err) {
//       setMsg("Connection lost in the smoke of Kyoto.");
//     }
//   };

//   return (
//     <Form 
//       formType="Create Character"
//       formData={formData}
//       handleInputChange={handleInputChange}
//       handleSubmit={handleSubmit}
//       responseMsg={msg}
//     />
//   );
// }

// export default CreateCharacter;