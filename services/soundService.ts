
const SFX_VOLUME = 0.6;

// Pre-load audio objects to avoid latency during gameplay
// Files are located in the sfx/ directory
const sounds = {
  up: new Audio('sfx/Pissanaup.wav'),
  down: new Audio('sfx/Pissanadown.wav'),
  confirm: new Audio('sfx/Marimba 2.mp3'),
  connect: new Audio('sfx/Pissanaup.wav'), 
};

export const playSound = (type: 'up' | 'down' | 'confirm' | 'connect') => {
  const audio = sounds[type];
  if (audio) {
    audio.volume = SFX_VOLUME;
    audio.currentTime = 0;
    audio.play().catch(e => console.warn(`Sound play blocked or file missing: ${type}`, e));
  }
};
