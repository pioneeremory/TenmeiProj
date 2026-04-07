import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"
import Login from './pages/Login';
import Signup from './pages/Signup';
import Logout from './pages/Logout'
import CreateCharacter from './pages/CharacterCreate'
import SelectCharacter from './pages/CharacterSelect'
import GameDashboard from "./pages/GameDashboard";
import LandingPage from "./pages/LandingPage";

function App() {

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [userToken, setUserToken] = useState(null)

  const handleToken = (token) => {
    setFormData({ username: '', password: '' })
    setUserToken(token)
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
          <Router>
            <Navbar />
            <Routes>
                {/* <Route path="/wines" element={<Wines userToken={userToken}/>} />  */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<Signup handleInputChange={handleInputChange} formData={formData} /> } /> 
                <Route path="/login" element={<Login handleInputChange={handleInputChange} formData={formData} handleToken={handleToken} />} /> 
                <Route path="/logout" element={<Logout userToken={userToken} setUserToken={setUserToken}/>} /> 
                <Route path="/characters" element={<SelectCharacter />} />
                <Route path="/create-character" element={<CreateCharacter />} />
                <Route path="/game/:sessionId" element={<GameDashboard />} />
            </Routes>
          </Router>
  );
}

export default App;