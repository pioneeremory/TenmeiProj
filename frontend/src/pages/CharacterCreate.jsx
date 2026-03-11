import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCharacter } from "../api/authApi";
import Form from "../components/Form";

function CreateCharacter() {
  const [formData, setFormData] = useState({ name: "", bio: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("userToken");
    
    try {
      const result = await createCharacter(token, formData);
      if (result.id) { // Django returns the new object with an ID on success
        setMsg("Identity forged in the annals of Tenmei.");
        // Redirect back to selection after a short delay
        setTimeout(() => navigate("/characters"), 1500);
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