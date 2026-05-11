import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { HitBowProgressProvider } from './context/HitBowProgressContext';
import type { MatchResult } from './game/matchResult';
import { appendMatchHistory } from './game/matchHistory';
import { ScreenState } from './types';
import { LoadingScreen } from './pages/LoadingScreen';
import { MainMenu } from './pages/MainMenu';
import { MatchmakingScreen } from './pages/MatchmakingScreen';
import { GameScreen, type GameMode } from './pages/GameScreen';
import { VictoryScreen } from './pages/VictoryScreen';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('loading');
  const [lastWinner, setLastWinner] = useState<'player' | 'enemy'>('player');
  const [lastMatchResult, setLastMatchResult] = useState<MatchResult | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [gameSessionId, setGameSessionId] = useState(0);

  const handleGameOver = (result: MatchResult) => {
    appendMatchHistory(result);
    setLastWinner(result.winner);
    setLastMatchResult(result);
    setCurrentScreen('victory');
  };

  const goMatchmaking = () => {
    setGameMode('standard');
    setCurrentScreen('matchmaking');
  };

  const startStandardFromMatchmaking = () => {
    setGameMode('standard');
    setGameSessionId((id) => id + 1);
    setCurrentScreen('game');
  };

  const startPractice = () => {
    setGameMode('practice');
    setGameSessionId((id) => id + 1);
    setCurrentScreen('game');
  };

  const handlePlayAgain = () => {
    if (gameMode === 'practice') {
      setGameSessionId((id) => id + 1);
      setCurrentScreen('game');
    } else {
      setCurrentScreen('matchmaking');
    }
  };

  return (
    <HitBowProgressProvider>
      <div className="w-full h-screen bg-dark-darker text-white overflow-hidden font-sans selection:bg-neon-cyan/30">
        <AnimatePresence mode="sync">
          {currentScreen === 'loading' && (
            <LoadingScreen
              key="loading"
              onComplete={() => setCurrentScreen('menu')}
            />
          )}

          {currentScreen === 'menu' && (
            <MainMenu
              key="menu"
              onPlay={goMatchmaking}
              onStartPractice={startPractice}
            />
          )}

          {currentScreen === 'matchmaking' && (
            <MatchmakingScreen
              key="matchmaking"
              onMatchFound={startStandardFromMatchmaking}
              onCancel={() => setCurrentScreen('menu')}
            />
          )}

          {currentScreen === 'game' && (
            <GameScreen
              key={`game-${gameSessionId}`}
              gameMode={gameMode}
              onGameOver={handleGameOver}
              onExitMatch={() => setCurrentScreen('menu')}
            />
          )}

          {currentScreen === 'victory' && (
            <VictoryScreen
              key="victory"
              winner={lastWinner}
              matchResult={lastMatchResult}
              onMainMenu={() => setCurrentScreen('menu')}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </AnimatePresence>
      </div>
    </HitBowProgressProvider>
  );
}
