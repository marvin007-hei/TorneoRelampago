/**
 * @file src/components/PenaltyMinigame.tsx
 * @description Minijuego de Tanda de Penales para definir empates y determinar al ganador futbolero.
 * Permite patear y atajar con arco visual, selector de dirección y marcador de penales (🟢 / 🔴).
 */

import React, { useState } from 'react';
import { Team, Match } from '../types/tournament';
import { Trophy, RefreshCw, Zap, Shield, Award, Play } from 'lucide-react';

interface PenaltyMinigameProps {
  teams: Team[];
  matches?: Match[];
  onApplyResult?: (winnerTeamId: string, loserTeamId: string, scoreText: string) => void;
  initialTeamAId?: string;
  initialTeamBId?: string;
}

type ShotDirection = 'left-up' | 'center' | 'right-up' | 'left-down' | 'right-down';

interface PenaltyRound {
  teamAShot: boolean | null; // true = gol, false = atajado/desviado
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

  // Estado del juego
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [currentTurn, setCurrentTurn] = useState<'A_KICKING' | 'B_KICKING'>('A_KICKING');
  const [rounds, setRounds] = useState<PenaltyRound[]>([
    { teamAShot: null, teamBShot: null },
    { teamAShot: null, teamBShot: null },
    { teamAShot: null, teamBShot: null },
  ]);
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [lastEventMessage, setLastEventMessage] = useState<string>(
    '¡Elige la dirección de tu disparo al arco!'
  );
  const [keeperJump, setKeeperJump] = useState<string | null>(null);
  const [ballPosition, setBallPosition] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [winnerTeam, setWinnerTeam] = useState<Team | null>(null);

  const directions: { id: ShotDirection; label: string; icon: string }[] = [
    { id: 'left-up', label: 'Ángulo Izquierdo', icon: '↖️' },
    { id: 'center', label: 'Al Centro Fuerte', icon: '⬆️' },
    { id: 'right-up', label: 'Ángulo Derecho', icon: '↗️' },
    { id: 'left-down', label: 'Rastrero Izquierdo', icon: '↙️' },
    { id: 'right-down', label: 'Rastrero Derecho', icon: '↘️' },
  ];

  // Iniciar tanda
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

  // Calcular goles anotados
  const goalsA = rounds.filter((r) => r.teamAShot === true).length;
  const goalsB = rounds.filter((r) => r.teamBShot === true).length;

  // Ejecutar tiro
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
        updatedRounds[roundIndex] = {
          ...updatedRounds[roundIndex],
          teamAShot: isGoal,
        };
        setRounds(updatedRounds);

        if (isGoal) {
          setLastEventMessage(`⚽ ¡GOOOOOOLAZO DE ${teamA?.name}! Imposible para el arquero.`);
        } else {
          setLastEventMessage(`🧤 ¡ATAJADÓN! El arquero de ${teamB?.name} adivinó el palo.`);
        }

        // Cambio a turno de Equipo B
        setCurrentTurn('B_KICKING');
      } else {
        // Turno de B pateando
        updatedRounds[roundIndex] = {
          ...updatedRounds[roundIndex],
          teamBShot: isGoal,
        };
        setRounds(updatedRounds);

        if (isGoal) {
          setLastEventMessage(`⚽ ¡GOL DE ${teamB?.name}! La clavó junto al poste.`);
        } else {
          setLastEventMessage(`🧤 ¡ATAJÓ EL ARQUERO de ${teamA?.name}! Salva a su equipo.`);
        }

        // Revisar si termina la ronda o el juego
        const newGoalsA = updatedRounds.filter((r) => r.teamAShot === true).length;
        const newGoalsB = updatedRounds.filter((r) => r.teamBShot === true).length;
        const nextRound = roundIndex + 1;

        if (nextRound >= updatedRounds.length) {
          // Si están empatados tras 3 tiros, muerte súbita (1 ronda más)
          if (newGoalsA === newGoalsB) {
            updatedRounds.push({ teamAShot: null, teamBShot: null });
            setRounds(updatedRounds);
            setRoundIndex(nextRound);
            setCurrentTurn('A_KICKING');
            setLastEventMessage(`¡Empate ${newGoalsA}-${newGoalsB}! Se define en ¡Muerte Súbita!`);
          } else {
            // Hay ganador
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
    }, 900);
  };

  if (teams.length < 2) {
    return (
      <div className="bg-emerald-950/80 border-2 border-emerald-800 rounded-2xl p-6 text-center space-y-3 shadow-xl">
        <span className="text-4xl">⚽</span>
        <h3 className="text-base font-black text-white uppercase tracking-wider">
          Tanda de Penales del Recreo
        </h3>
        <p className="text-xs text-emerald-200">
          Necesitas inscribir al menos 2 equipos para poder jugar el minijuego de penales y desempatar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Marcador Estadio Principal */}
      <div className="bg-gradient-to-b from-emerald-950 to-green-950 border-2 border-emerald-700/80 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        {/* Líneas de Cal de Cancha */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="w-full h-full border-4 border-dashed border-white/40 rounded-xl m-1" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥅</span>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>DESEMPATE POR PENALES</span>
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black">
                    EN VIVO
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-300 font-medium">
                  Minijuego interactivo para consagrar al ganador en la cancha
                </p>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{gameStarted ? 'Reiniciar Penales' : 'Iniciar Tanda'}</span>
            </button>
          </div>

          {/* Selector de Rivales (si no ha empezado) */}
          {!gameStarted && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                  🔴 Equipo Local (Patea 1°):
                </label>
                <select
                  value={teamAId}
                  onChange={(e) => setTeamAId(e.target.value)}
                  className="w-full bg-emerald-900/90 border border-emerald-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id} disabled={t.id === teamBId}>
                      {t.name} ({t.captainName || 'Sin capitán'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-300 mb-1">
                  🔵 Equipo Visitante (Patea 2°):
                </label>
                <select
                  value={teamBId}
                  onChange={(e) => setTeamBId(e.target.value)}
                  className="w-full bg-emerald-900/90 border border-emerald-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id} disabled={t.id === teamAId}>
                      {t.name} ({t.captainName || 'Sin capitán'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Marcador Digital Estilo Estadio */}
          {teamA && teamB && (
            <div className="bg-black/60 rounded-xl p-3 border border-emerald-700/60 shadow-inner">
              <div className="grid grid-cols-3 items-center text-center">
                {/* Equipo A */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: teamA.color }} />
                    <span className="font-black text-xs sm:text-sm text-white truncate max-w-[120px]">
                      {teamA.name}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                    {goalsA}
                  </div>
                  {/* Bolitas de penales */}
                  <div className="flex items-center justify-center gap-1">
                    {rounds.map((r, idx) => (
                      <span
                        key={idx}
                        className={`w-3 h-3 rounded-full border border-white/30 text-[9px] flex items-center justify-center font-bold ${
                          r.teamAShot === true
                            ? 'bg-emerald-500 text-slate-950'
                            : r.teamAShot === false
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        {r.teamAShot === true ? '✓' : r.teamAShot === false ? '✕' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Centro: Estado */}
                <div className="px-2">
                  <div className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">
                    {winnerTeam ? 'FINAL' : `TIRO ${roundIndex + 1}`}
                  </div>
                  <div className="text-xl font-black text-white/40 my-0.5">VS</div>
                  <div className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full inline-block">
                    {winnerTeam
                      ? '🏆 CAMPEÓN DEFINIDO'
                      : currentTurn === 'A_KICKING'
                      ? `Patea ${teamA.name}`
                      : `Patea ${teamB.name}`}
                  </div>
                </div>

                {/* Equipo B */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: teamB.color }} />
                    <span className="font-black text-xs sm:text-sm text-white truncate max-w-[120px]">
                      {teamB.name}
                    </span>
                  </div>
                  <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                    {goalsB}
                  </div>
                  {/* Bolitas de penales */}
                  <div className="flex items-center justify-center gap-1">
                    {rounds.map((r, idx) => (
                      <span
                        key={idx}
                        className={`w-3 h-3 rounded-full border border-white/30 text-[9px] flex items-center justify-center font-bold ${
                          r.teamBShot === true
                            ? 'bg-emerald-500 text-slate-950'
                            : r.teamBShot === false
                            ? 'bg-red-500 text-white'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        {r.teamBShot === true ? '✓' : r.teamBShot === false ? '✕' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cancha y Arco Interactivo */}
          {gameStarted && !winnerTeam && (
            <div className="space-y-3">
              {/* Notificación de relato */}
              <div className="text-center bg-emerald-900/60 border border-emerald-600/40 rounded-xl p-2 text-xs font-bold text-amber-300 animate-pulse">
                📢 {lastEventMessage}
              </div>

              {/* Arco con Red y Arquero */}
              <div className="relative bg-gradient-to-b from-sky-950 to-emerald-900 border-4 border-white/90 rounded-2xl h-44 sm:h-52 flex flex-col justify-end p-3 shadow-inner overflow-hidden">
                {/* Red de Arco Texturizada */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                    backgroundSize: '12px 12px',
                  }}
                />

                {/* Travesaño y Postes */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-white/90 shadow-md" />
                <div className="absolute top-0 bottom-0 left-0 w-3 bg-white/90 shadow-md" />
                <div className="absolute top-0 bottom-0 right-0 w-3 bg-white/90 shadow-md" />

                {/* Arquero en el arco */}
                <div
                  className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-500 flex flex-col items-center ${
                    keeperJump === 'left-up' || keeperJump === 'left-down'
                      ? '-translate-x-32 sm:-translate-x-44'
                      : keeperJump === 'right-up' || keeperJump === 'right-down'
                      ? 'translate-x-20 sm:translate-x-32'
                      : ''
                  }`}
                >
                  <span className="text-4xl filter drop-shadow">🧤</span>
                  <span className="text-[10px] font-black bg-slate-900/80 px-2 py-0.5 rounded text-white border border-white/20">
                    Arquero {currentTurn === 'A_KICKING' ? teamB?.name : teamA?.name}
                  </span>
                </div>

                {/* Pelota en animación */}
                <div
                  className={`absolute transition-all duration-500 flex items-center justify-center ${
                    ballPosition
                      ? ballPosition.includes('left')
                        ? 'bottom-28 left-16 text-3xl scale-90'
                        : ballPosition.includes('right')
                        ? 'bottom-28 right-16 text-3xl scale-90'
                        : 'bottom-28 left-1/2 -translate-x-1/2 text-3xl scale-90'
                      : 'bottom-2 left-1/2 -translate-x-1/2 text-4xl'
                  }`}
                >
                  ⚽
                </div>

                {/* Manchón de penal */}
                <div className="w-4 h-4 rounded-full bg-white mx-auto mb-1 border-2 border-emerald-950 shadow" />
              </div>

              {/* Botones de Disparo */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-center text-emerald-300">
                  {currentTurn === 'A_KICKING'
                    ? `🎯 ¡${teamA?.name}, elige dónde patear el penal!`
                    : `🎯 ¡${teamB?.name}, elige dónde patear el penal!`}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {directions.map((dir) => (
                    <button
                      key={dir.id}
                      onClick={() => handleShootOrDefend(dir.id)}
                      disabled={isAnimating}
                      className="py-2.5 px-2 bg-gradient-to-t from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 border border-emerald-500/50 rounded-xl text-white font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex flex-col items-center justify-center gap-0.5"
                    >
                      <span className="text-base">{dir.icon}</span>
                      <span className="text-[10px] leading-tight text-center">{dir.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pantalla de Coronación si hay ganador */}
          {winnerTeam && (
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border-2 border-amber-400 p-6 rounded-2xl text-center space-y-3 animate-bounce">
              <span className="text-5xl inline-block">🏆</span>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
                ¡{winnerTeam.name} ES EL GANADOR!
              </h2>
              <p className="text-xs text-amber-200 font-medium">
                Se impuso en la emocionante tanda de penales del recreo escolar ({goalsA} a {goalsB}).
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleStartGame}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-amber-400/40 cursor-pointer"
                >
                  🔄 Jugar la Revancha
                </button>

                {onApplyResult && (
                  <button
                    onClick={() => {
                      const loser = winnerTeam.id === teamA?.id ? teamB! : teamA!;
                      onApplyResult(winnerTeam.id, loser.id, `${Math.max(goalsA, goalsB)} - ${Math.min(goalsA, goalsB)} (Penales)`);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
                  >
                    ⚽ Aplicar Ganador al Torneo
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
