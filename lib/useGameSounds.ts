import useSound from 'use-sound';

export default function useGameSounds() {
  // Load the sounds from the public/sounds folder
  const [playCorrect] = useSound('/sounds/correct.mp3', { volume: 0.5 });
  const [playWrong] = useSound('/sounds/wrong.mp3', { volume: 0.5 });
  const [playCash] = useSound('/sounds/cash.mp3', { volume: 0.5 });

  return {
    playCorrect,
    playWrong,
    playCash,
  };
}