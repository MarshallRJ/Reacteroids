import { useEffect, useRef } from "react";

export default function BackgroundSound() {
  const audioRef = useRef(null);

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(error => {
          console.log("Audio play failed:", error);
        });
      }
    };

    // Add event listeners to play the audio when the user interacts with the page
    document.addEventListener("click", playAudio);
    document.addEventListener("keydown", playAudio);

    return () => {
      // Clean up the event listeners
      document.removeEventListener("click", playAudio);
      document.removeEventListener("keydown", playAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} loop>
        <source src="/BackgroundSound.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </>
  );
}
