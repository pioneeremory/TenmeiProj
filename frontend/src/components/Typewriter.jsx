// frontend/src/components/Typewriter.jsx
import { useState, useEffect } from "react";

function Typewriter({ text, speed = 20 }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    // 1. Safety check & Reset
    if (!text) return;
    setDisplayedText("");
    
    let i = 0;
    const timer = setInterval(() => {
      // 2. Use the current index to slice the original text
      // slice(0, 1) gets index 0
      // slice(0, 2) gets index 0 and 1
      setDisplayedText(text.slice(0, i + 1));
      
      if (i >= text.length - 1) {
        clearInterval(timer);
      } else {
        i++;
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <p className="narration-text">{displayedText}</p>;
}

export default Typewriter;