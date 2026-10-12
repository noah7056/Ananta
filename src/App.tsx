import { useGame } from './store/gameStore';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { DeathScreen } from './components/DeathScreen';

export default function App() {
  const phase = useGame((s) => s.phase);
  const character = useGame((s) => s.character);

  return (
    <div className="h-full bg-paper font-sans text-ink">
      {phase === 'start' || !character ? (
        <StartScreen />
      ) : phase === 'dead' || !character.alive ? (
        <DeathScreen />
      ) : (
        <GameScreen />
      )}
    </div>
  );
}
