import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { HitBowProgressProvider } from './context/HitBowProgressContext';
import type { MatchResult } from './game/matchResult';
import { appendMatchHistory } from './game/matchHistory';
import type { Local2pLoadout, MapId, ScreenState } from './types';
import { LoadingScreen } from './pages/LoadingScreen';
import { Local2pPrematchFlow } from './pages/Local2pPrematchFlow';
import { MainMenu } from './pages/MainMenu';
import { MatchmakingScreen } from './pages/MatchmakingScreen';
import { GameScreen, type GameMode } from './pages/GameScreen';
import { VictoryScreen } from './pages/VictoryScreen';
import { DEFAULT_MAP_ID } from './game/maps';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('loading');
  const [lastWinner, setLastWinner] = useState<'player' | 'enemy'>('player');
  const [lastMatchResult, setLastMatchResult] = useState<MatchResult | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [gameSessionId, setGameSessionId] = useState(0);
  const [selectedMapId, setSelectedMapId] = useState<MapId>(DEFAULT_MAP_ID);
  const [local2pLoadout, setLocal2pLoadout] = useState<Local2pLoadout | null>(
    null
  );

  const clearLocal2pSession = () => {
    setLocal2pLoadout(null);
  };

  const handleGameOver = (result: MatchResult) => {
    if (result.mode !== 'local2p') {
      appendMatchHistory(result);
    }
    setLastWinner(result.winner);
    setLastMatchResult(result);
    setCurrentScreen('victory');
  };

  const goMatchmaking = () => {
    setGameMode('standard');
    setCurrentScreen('matchmaking');
  };

  const startStandardFromMatchmaking = (mapId: MapId) => {
    setGameMode('standard');
    setSelectedMapId(mapId);
    setGameSessionId((id) => id + 1);
    setCurrentScreen('game');
  };

  const startPractice = () => {
    setGameMode('practice');
    setSelectedMapId(DEFAULT_MAP_ID);
    setGameSessionId((id) => id + 1);
    setCurrentScreen('game');
  };

  const handlePlayAgain = () => {
    if (gameMode === 'practice' || gameMode === 'local2p') {
      setGameSessionId((id) => id + 1);
      setCurrentScreen('game');
    } else {
      setCurrentScreen('matchmaking');
    }
  };

  const goLocal2pSetup = () => {
    setCurrentScreen('local2p_setup');
  };

  const startLocal2pFromWizard = (loadout: Local2pLoadout) => {
    setLocal2pLoadout(loadout);
    setGameMode('local2p');
    setSelectedMapId(loadout.mapId);
    setGameSessionId((id) => id + 1);
    setCurrentScreen('game');
  };

  const exitToMenu = () => {
    clearLocal2pSession();
    setCurrentScreen('menu');
  };

  return (
    <HitBowProgressProvider>
      <div className="flex min-h-dvh w-full flex-col bg-dark-darker text-white overflow-hidden font-sans selection:bg-neon-cyan/30">
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
              onStartLocal2p={goLocal2pSetup}
            />
          )}

          {currentScreen === 'matchmaking' && (
            <MatchmakingScreen
              key="matchmaking"
              onMatchFound={startStandardFromMatchmaking}
              onCancel={() => setCurrentScreen('menu')}
            />
          )}

          {currentScreen === 'local2p_setup' && (
            <Local2pPrematchFlow
              key="local2p_setup"
              onComplete={startLocal2pFromWizard}
              onCancel={exitToMenu}
            />
          )}

          {currentScreen === 'game' && (
            <GameScreen
              key={`game-${gameSessionId}`}
              gameMode={gameMode}
              mapId={selectedMapId}
              local2pLoadout={
                gameMode === 'local2p' ? local2pLoadout : undefined
              }
              onGameOver={handleGameOver}
              onExitMatch={exitToMenu}
            />
          )}

          {currentScreen === 'victory' && (
            <VictoryScreen
              key="victory"
              winner={lastWinner}
              matchResult={lastMatchResult}
              local2pCharacterIds={
                lastMatchResult?.mode === 'local2p' && local2pLoadout
                  ? {
                      p1: local2pLoadout.p1CharacterId,
                      p2: local2pLoadout.p2CharacterId
                    }
                  : undefined
              }
              onMainMenu={exitToMenu}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </AnimatePresence>
      </div>
    </HitBowProgressProvider>
  );
}
