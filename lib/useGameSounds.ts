'use client';

import useSound from 'use-sound';

export default function useGameSounds() {
  // Make sure you have these files in public/sounds/
  const [playCorrect] = useSound('/sounds/correct.mp3', { volume: 0.5 });
  const [playWrong] = useSound('/sounds/wrong.mp3', { volume: 0.5 });
  const [playCash] = useSound('/sounds/cash.mp3', { volume: 0.5 });
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.2 }); // Added this!

  return {
    playCorrect,
    playWrong,
    playCash,
    playClick, // Exporting it so the page can use it
  };
}