export const playStoredAudio = (key) => {
  const soundEnabled = JSON.parse(localStorage.getItem('soundEnabled')) ?? true; // Default to true if not set
  if (soundEnabled) {
    const audioData = localStorage.getItem(key);

    if (audioData) {
      console.log(`Playing stored audio: ${key}`);
      const audio = new Audio(audioData);
      audio.loop = false; // Ensure all sounds are non-looping
      audio.play();
    } else {
      console.warn(`No audio found in LocalStorage for key: ${key}`);
    }
  } else {
    console.log('Sound is disabled. Skipping audio playback.');
  }
};
