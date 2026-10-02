/**
 * @file src/components/PenaltyMinigame.tsx
 * @description Minijuego de Tanda de Penales optimizado para 320px, alto contraste y texto >= 16px.
 */

import React, { useState } from 'react';
import { Team, Match } from '../types/tournament';
import { Trophy, RefreshCw, Zap, Shield, Play } from 'lucide-react';

interface PenaltyMinigameProps {
  teams: Team[];
  matches?: Match[];
  onApplyResult?: (winnerTeamId: string, loserTeamId: string, scoreText: string) => void;
  initialTeamAId?: string;
  initialTeamBId?: string;
}

type ShotDirection = 'left-up' | 'center' | 'right-up' | 'left-down' | 'right-down';

interface PenaltyRound {
  teamAShot: boolean | null;
  teamBShot: boolean | null;
}

export const PenaltyMinigame: React.FC<PenaltyMinigameProps> = ({
  teams,
  onApplyResult,
  initialTeamAId,
  initialTeamBId,
}) => {
  const [teamAId, setTeamAId] = useState<string>(
    initialTeamAId || (teams.length >= 1 ? teams[0].id : '')
  );
  const [teamBId, setTeamBId] = useState<string>(
    initialTeamBId || (teams.length >= 2 ? teams[1].id : (teams.length >= 1 ? teams[0].id : ''))
  );

  const teamA = teams.find((t) => t.id === teamAId);
  const teamB = teams.find((t) => t.id === teamBId);

  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [currentTurn, setCurrentTurn] = useState<'A_KICKING' | 'B_KICKING'>('A_KICKING');
  const [rounds, setRounds] = useState<PenaltyRound[]>([
    { teamAShot: null, teamBShot: null },
    { teamAShot: null, teamBShot: null },
    { teamAShot: null, teamBShot: null },
  ]);
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [lastEventMessage, setLastEventMessage] = useState<string>(
    'Elige la dirección de tu disparo al arco'
  );
  const [keeperJump, setKeeperJump] = useState<string | null>(null);
  const [ballPosition, setBallPosition] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [winnerTeam, setWinnerTeam] = useState<Team | null>(null);

  const directions: { id: ShotDirection; label: string; icon: string }[] = [
    { id: 'left-up', label: 'Ángulo Izq.', icon: '↖️' },
    { id: 'center', label: 'Al Centro', icon: '⬆️' },
    { id: 'right-up', label: 'Ángulo Der.', icon: '↗️' },
    { id: 'left-down', label: 'Bajo Izq.', icon: '↙️' },
    { id: 'right-down', label: 'Bajo Der.', icon: '↘️' },
  ];

  const handleStartGame = () => {
    if (!teamA || !teamB || teamA.id === teamB.id) return;
    setRounds([
      { teamAShot: null, teamBShot: null },
      { teamAShot: null, teamBShot: null },
      { teamAShot: null, teamBShot: null },
    ]);
    setRoundIndex(0);
    setCurrentTurn('A_KICKING');
    setWinnerTeam(null);
    setKeeperJump(null);
    setBallPosition(null);
    setLastEventMessage(`¡Ronda 1! ${teamA.name} se prepara para patear.`);
    setGameStarted(true);
  };

  const goalsA = rounds.filter((r) => r.teamAShot === true).length;
  const goalsB = rounds.filter((r) => r.teamBShot === true).length;

  const handleShootOrDefend = (chosenDir: ShotDirection) => {
    if (isAnimating || winnerTeam) return;

    setIsAnimating(true);
    const possibleDirs: ShotDirection[] = ['left-up', 'center', 'right-up', 'left-down', 'right-down'];
    const keeperChoice = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];

    setKeeperJump(keeperChoice);
    setBallPosition(chosenDir);
    const isGoal = chosenDir !== keeperChoice;

    setTimeout(() => {
      const updatedRounds = [...rounds];

      if (currentTurn === 'A_KICKING') {
        updatedRounds[roundIndex] = { ...updatedRounds[roundIndex], teamAShot: isGoal };
        setRounds(updatedRounds);
        setLastEventMessage(
          isGoal
            ? `⚽ ¡GOL DE ${teamA?.name}!`
            : `🧤 ¡ATAJÓ EL ARQUERO de ${teamB?.name}!`
        );
        setCurrentTurn('B_KICKING');
      } else {
        updatedRounds[roundIndex] = { ...updatedRounds[roundIndex], teamBShot: isGoal };
        setRounds(updatedRounds);
        setLastEventMessage(
          isGoal
            ? `⚽ ¡GOL DE ${teamB?.name}!`
            : `🧤 ¡ATAJÓ EL ARQUERO de ${teamA?.name}!`
        );

        const newGoalsA = updatedRounds.filter((r) => r.teamAShot === true).length;
        const newGoalsB = updatedRounds.filter((r) => r.teamBShot === true).length;
        const nextRound = roundIndex + 1;

        if (nextRound >= updatedRounds.length) {
          if (newGoalsA === newGoalsB) {
            updatedRounds.push({ teamAShot: null, teamBShot: null });
            setRounds(updatedRounds);
            setRoundIndex(nextRound);
            setCurrentTurn('A_KICKING');
            setLastEventMessage(`¡Empate ${newGoalsA}-${newGoalsB}! Se define en ¡Muerte Súbita!`);
          } else {
            const winner = newGoalsA > newGoalsB ? teamA! : teamB!;
            setWinnerTeam(winner);
            setLastEventMessage(`🏆 ¡${winner.name} GANA LA TANDA DE PENALES (${newGoalsA} a ${newGoalsB})!`);
          }
        } else {
          setRoundIndex(nextRound);
          setCurrentTurn('A_KICKING');
        }
      }
      setIsAnimating(false);
    }, 850);
  };

  if (teams.length < 2) {
    return (
      <div className="bg-gradient-to-b from-emerald-950 to-black border-2 border-emerald-500 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center text-3xl">
          🥅
        </div>
        <h3 className="text-xl font-black text-white">Se necesitan 2 equipos para patear penales</h3>
        <p className="text-base font-bold text-emerald-100 max-w-md mx-auto">
          Inscribe al menos dos equipos en la primera pestaña para comenzar el duelo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="bg-black/95 border-2 border-emerald-600/80 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>🥅 Tanda de Penales Escolar</span>
          </h2>
          {!gameStarted && (
            <button
              onClick={handleStartGame}
              className="min-h-[48px] px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base rounded-xl cursor-pointer"
            >
              ⚽ Iniciar Tanda
            </button>
          )}
        </div>

        {/* 3. Selectores de Rivales con Etiquetas Visibles */}
        {!gameStarted && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-base font-black text-white">
                Pateador 1 (Equipo Local):
              </label>
              <select
                value={teamAId}
                onChange={(e) => setTeamAId(e.target.value)}
                className="w-full min-h-[48px] bg-slate-900 border-2 border-emerald-500 rounded-xl px-4 py-2 text-base font-bold text-white focus:outline-none"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-base font-black text-white">
                Pateador 2 (Equipo Rival):
              </label>
              <select
                value={teamBId}
                onChange={(e) => setTeamBId(e.target.value)}
                className="w-full min-h-[48px] bg-slate-900 border-2 border-emerald-500 rounded-xl px-4 py-2 text-base font-bold text-white focus:outline-none"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.id === teamAId}>
                    {t.name} {t.id === teamAId ? '(Mismo equipo)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Marcador del Duelo */}
        {teamA && teamB && (
          <div className="bg-emerald-950/80 rounded-2xl p-4 border-2 border-emerald-700 shadow-inner">
            <div className="grid grid-cols-3 items-center text-center gap-2">
              <div>
                <p className="text-base font-black text-white truncate">{teamA.name}</p>
                <div className="text-4xl font-black text-amber-300 font-mono">{goalsA}</div>
              </div>
              <div>
                <span className="text-base font-black bg-amber-400 text-slate-950 px-3 py-1 rounded-full inline-block">
                  {winnerTeam ? 'FINAL' : currentTurn === 'A_KICKING' ? `Patea ${teamA.name}` : `Patea ${teamB.name}`}
                </span>
              </div>
              <div>
                <p className="text-base font-black text-white truncate">{teamB.name}</p>
                <div className="text-4xl font-black text-amber-300 font-mono">{goalsB}</div>
              </div>
            </div>
          </div>
        )}

        {/* Cancha y Arco Interactivo */}
        {gameStarted && !winnerTeam && (
          <div className="space-y-4">
            <div className="text-center bg-emerald-900/80 border-2 border-emerald-500 rounded-xl p-3 text-base font-black text-amber-300">
              📢 {lastEventMessage}
            </div>

            {/* Arco y Arquero */}
            <div className="relative bg-gradient-to-b from-sky-950 to-emerald-900 border-4 border-white rounded-2xl h-48 flex flex-col justify-end p-3 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-3 bg-white" />
              <div className="absolute top-0 bottom-0 left-0 w-3 bg-white" />
              <div className="absolute top-0 bottom-0 right-0 w-3 bg-white" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-4xl">🧤</div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-4xl">⚽</div>
            </div>

            {/* 3. Botones de Disparo con Etiquetas y min 48px */}
            <div className="space-y-2">
              <label className="block text-base font-black text-white text-center">
                Elige dónde patear el penal:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {directions.map((dir) => (
                  <button
                    key={dir.id}
                    onClick={() => handleShootOrDefend(dir.id)}
                    disabled={isAnimating}
                    className="min-h-[52px] py-2 px-2 bg-emerald-800 hover:bg-emerald-700 border-2 border-emerald-500 rounded-xl text-white font-black text-base cursor-pointer flex flex-col items-center justify-center active:scale-95 disabled:opacity-50"
                  >
                    <span className="text-xl">{dir.icon}</span>
                    <span className="text-base">{dir.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Único Botón Principal cuando hay Ganador */}
        {winnerTeam && (
          <div className="bg-amber-400/20 border-2 border-amber-400 p-6 rounded-2xl text-center space-y-3">
            <span className="text-5xl inline-block">🏆</span>
            <h3 className="text-xl font-black text-white">¡{winnerTeam.name} ES EL CAMPEÓN!</h3>
            <p className="text-base font-bold text-amber-200">
              Ganó la tanda de penales por {Math.max(goalsA, goalsB)} a {Math.min(goalsA, goalsB)}.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {onApplyResult && (
                <button
                  onClick={() => {
                    const loser = winnerTeam.id === teamA?.id ? teamB! : teamA!;
                    onApplyResult(winnerTeam.id, loser.id, `${Math.max(goalsA, goalsB)} - ${Math.min(goalsA, goalsB)}`);
                  }}
                  className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base rounded-xl shadow-xl cursor-pointer"
                >
                  ⚽ Aplicar Ganador al Torneo
                </button>
              )}

              <button
                onClick={handleStartGame}
                className="w-full sm:w-auto min-h-[48px] px-5 py-3.5 bg-emerald-950 border-2 border-emerald-500 text-white font-bold text-base rounded-xl cursor-pointer"
              >
                🔄 Repetir Penales
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
