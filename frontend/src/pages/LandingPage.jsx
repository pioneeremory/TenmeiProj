import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css'; 

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1 className="tenmei-title">TENMEI PROJECT: KYOTO 1788</h1>
        
        <div className="game-intro">
          <p>
            The Great Fire rages. Japan has angered the kami, and the ancient city of Thousands burns. 
            All you have left is your sibling and the clothes on your back.
          </p>
          <p className="mechanic-info">
            In this dark historical LitRPG, your survival depends on managing your <strong className="resource-grit">GRIT</strong> (your physical and mental will), collecting <strong className="resource-rice">RICE</strong> (your sustenance), and suppressing the ever-creeping <strong className="resource-fire">FIRE DANGER</strong>.
          </p>
          <p className="call-to-action">Can you put the pieces back together, or will you both be lost to the inferno?</p>
        </div>

        <button className="btn-play" onClick={() => navigate("/login")}>
          Login
        </button>
        <button className="btn-play" onClick={() => navigate("/signup")}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default LandingPage;