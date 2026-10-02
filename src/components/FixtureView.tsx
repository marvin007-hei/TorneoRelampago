/**
 * @file src/components/FixtureView.tsx
 * @description Vista del calendario de partidos accesible al sol, táctil con una sola mano y texto >= 16px.
 */

import React, { useState } from 'react';
import { Team, Match } from '../types/tournament';
import { Calendar, CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, Trophy, Zap, AlertCircle } from 'lucide-react';

interface FixtureViewProps {
  teams: Team[];
  matches: Match[];
  onGenerateFixture: () => void;
  onUpdateMatchScore: (matchId: string, homeScore: number | null, awayScore: number | null, isPlayed: boolean) => void;
  onNavigateToStandings: () => void;
  onRepeatMatches: () => void;
  onOpenPenaltyGame?: (teamAId?: string, teamBId?: string) => void;
}

export const FixtureView: React.FC<FixtureViewProps> = ({
  teams,
  matches,
  onGenerateFixture,
  onUpdateMatchScore,
  onNavigateToStandings,
  onRepeatMatches,
  onOpenPenaltyGame,
}) => {
  const teamMap = new Map<string, Team>(teams.map((t) => [t.id, t]));
  const rounds = Array.from(new Set(matches.map((m) => m.roundNumber))).sort((a, b) => a - b);
  const [activeRound, setActiveRound] = useState<number>(rounds[0] || 1);

  const currentMatches = matches.filter((m) => m.roundNumber === activeRound);
  const playedMatchesCount = matches.filter((m) => m.isPlayed).length;

  const handleScoreChange = (match: Match, home: number | null, away: number | null, played: boolean) => {
    if (home === null || away === null) {
      onUpdateMatchScore(match.id, null, null, false);
      return;
    }
    const safeHome = Math.max(0, home);
    const safeAway = Math.max(0, away);
    onUpdateMatchScore(match.id, safeHome, safeAway, played);
  };

  const handleQuickStep = (match: Match, side: 'home' | 'away', delta: number) => {
    const currentHome = match.homeScore ?? 0;
    const currentAway = match.awayScore ?? 0;

    let newHome = currentHome;
    let newAway = currentAway;

    if (side === 'home') {
      newHome = Math.max(0, currentHome + delta);
    } else {
      newAway = Math.max(0, currentAway + delta);
    }

    onUpdateMatchScore(match.id, newHome, newAway, true);
  };

  // 5. Estado Vacío: Menos de 2 equipos
  if (teams.length < 2) {
    return (
      <div className="bg-gradient-to-b from-emerald-950 to-black border-2 border-emerald-500 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center text-3xl">
          📅
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white">
            ¡Aún no hay suficientes equipos en la cancha!
          </h3>
          <p className="text-base font-bold text-emerald-100 max-w-md mx-auto leading-relaxed">
            Se necesitan al menos dos cursos escolares inscritos para armar el calendario de partidos del recreo.
          </p>
        </div>

        {/* 4. Único botón principal de este estado */}
        <div className="pt-2">
          <button
            onClick={() => {
              const teamsTabBtn = document.querySelector('button[data-tab="teams"]') as HTMLElement;
              if (teamsTabBtn) teamsTabBtn.click();
            }}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <span>⚽ Ir a Inscribir Equipos</span>
          </button>
        </div>
      </div>
    );
  }

  // 5. Estado Vacío: Hay equipos pero todavía no se generó el fixture
  if (matches.length === 0) {
    return (
      <div className="bg-gradient-to-b from-emerald-950 to-black border-2 border-amber-400 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-3xl shadow-xl">
          ⚡
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white">
            ¡Listo para armar el fixture del recreo!
          </h3>
          <p className="text-base font-bold text-emerald-100 max-w-md mx-auto leading-relaxed">
            Tienes {teams.length} equipos inscritos. Pulsa el botón principal para programar los partidos donde todos juegan contra todos sin repeticiones.
          </p>
        </div>

        {/* 4. Único Botón Principal */}
        <div className="pt-2">
          <button
            onClick={onGenerateFixture}
            className="w-full sm:w-auto min-h-[52px] px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base rounded-2xl shadow-2xl transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            <Zap className="w-5 h-5 fill-slate-950" />
            <span>📅 Armar Calendario de Partidos Ahora</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-full">
      {/* Barra superior con navegación de fechas y acciones secundarias */}
      <div className="bg-black/90 p-4 rounded-2xl border-2 border-emerald-600/80 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Navegación táctil de fechas con botones de al menos 48px */}
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-emerald-950/90 p-1.5 rounded-xl border border-emerald-700">
            <button
              onClick={() => setActiveRound((prev) => Math.max(rounds[0], prev - 1))}
              disabled={activeRound === rounds[0]}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg bg-emerald-900 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              aria-label="Fecha anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <span className="text-base font-black text-amber-400 px-3 text-center">
              Fecha {activeRound} de {rounds.length}
            </span>

            <button
              onClick={() => setActiveRound((prev) => Math.min(rounds[rounds.length - 1], prev + 1))}
              disabled={activeRound === rounds[rounds.length - 1]}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg bg-emerald-900 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              aria-label="Fecha siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Botones secundarios (no compiten con el principal) */}
          <div className="flex items-center gap-2">
            {onOpenPenaltyGame && (
              <button
                onClick={() => onOpenPenaltyGame()}
                className="flex-1 sm:flex-none min-h-[48px] px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 border-2 border-emerald-500 text-emerald-100 font-bold text-base rounded-xl cursor-pointer"
              >
                <span>🥅 Penales</span>
              </button>
            )}

            <button
              onClick={onRepeatMatches}
              className="flex-1 sm:flex-none min-h-[48px] px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 border-2 border-emerald-500 text-emerald-100 font-bold text-base rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              title="Reiniciar goles para jugar la revancha"
            >
              <RotateCcw className="w-4 h-4" />
              <span>🔁 Revancha</span>
            </button>
          </div>
        </div>

        {/* Resumen del torneo en texto >= 16px */}
        <p className="text-base font-bold text-emerald-200">
          Partidos jugados: <strong className="text-white">{playedMatchesCount}</strong> de <strong className="text-white">{matches.length}</strong>
        </p>
      </div>

      {/* Tarjetas de Partidos de la Fecha Activa */}
      <div className="space-y-4">
        {currentMatches.map((match) => {
          const homeTeam = teamMap.get(match.homeTeamId);
          const awayTeam = teamMap.get(match.awayTeamId);

          if (!homeTeam || !awayTeam) return null;

          return (
            <div
              key={match.id}
              className={`bg-black/95 border-2 rounded-2xl p-4 sm:p-5 shadow-2xl transition-all ${
                match.isPlayed ? 'border-emerald-500' : 'border-emerald-700/80'
              }`}
            >
              {/* Turno de recreo */}
              <div className="flex items-center justify-between border-b border-emerald-800 pb-2 mb-3">
                <span className="text-base font-bold text-emerald-300">
                  {match.recessSlot || 'Recreo Escolar'}
                </span>
                <span
                  className={`text-base font-black px-3 py-1 rounded-full border ${
                    match.isPlayed
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400'
                  }`}
                >
                  {match.isPlayed ? '✓ Jugado' : 'Pendiente'}
                </span>
              </div>

              {/* Duelo de Equipos con Marcador */}
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 py-2">
                {/* Equipo Local */}
                <div className="flex items-center gap-2 justify-start sm:justify-end">
                  <span
                    className="w-5 h-5 rounded-full shrink-0 border-2 border-white"
                    style={{ backgroundColor: homeTeam.color }}
                  />
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-black text-white leading-tight">
                      {homeTeam.name}
                    </p>
                    <p className="text-base font-bold text-emerald-300">Local</p>
                  </div>
                </div>

                {/* Marcador Central en grande */}
                <div className="flex items-center justify-center">
                  <div className="bg-emerald-950 px-5 py-2.5 rounded-2xl border-2 border-emerald-500 font-mono font-black text-2xl text-amber-300 shadow-inner">
                    {match.isPlayed ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}` : 'VS'}
                  </div>
                </div>

                {/* Equipo Visitante */}
                <div className="flex items-center gap-2 justify-start">
                  <span
                    className="w-5 h-5 rounded-full shrink-0 border-2 border-white"
                    style={{ backgroundColor: awayTeam.color }}
                  />
                  <div className="text-left">
                    <p className="text-lg font-black text-white leading-tight">
                      {awayTeam.name}
                    </p>
                    <p className="text-base font-bold text-emerald-300">Visitante</p>
                  </div>
                </div>
              </div>

              {/* Botonera de control de goles táctil (Botones grandes min 48px para pulgar) */}
              <div className="mt-4 pt-3 border-t border-emerald-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 3. Campo con etiqueta visible: Goles Local */}
                  <div className="bg-emerald-950/70 p-3 rounded-xl border border-emerald-700/80 flex items-center justify-between">
                    <label className="text-base font-black text-white">
                      Goles {homeTeam.name}:
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickStep(match, 'home', -1)}
                        className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-white font-black text-xl flex items-center justify-center cursor-pointer active:scale-90"
                        title="Restar gol"
                        aria-label="Restar gol a local"
                      >
                        -
                      </button>
                      <span className="font-mono text-2xl font-black text-amber-300 min-w-[32px] text-center">
                        {match.homeScore ?? 0}
                      </span>
                      <button
                        onClick={() => handleQuickStep(match, 'home', 1)}
                        className="w-12 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-300 text-slate-950 font-black text-xl flex items-center justify-center cursor-pointer active:scale-90 shadow-md"
                        title="Sumar gol"
                        aria-label="Sumar gol a local"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 3. Campo con etiqueta visible: Goles Visitante */}
                  <div className="bg-emerald-950/70 p-3 rounded-xl border border-emerald-700/80 flex items-center justify-between">
                    <label className="text-base font-black text-white">
                      Goles {awayTeam.name}:
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickStep(match, 'away', -1)}
                        className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-white font-black text-xl flex items-center justify-center cursor-pointer active:scale-90"
                        title="Restar gol"
                        aria-label="Restar gol a visitante"
                      >
                        -
                      </button>
                      <span className="font-mono text-2xl font-black text-amber-300 min-w-[32px] text-center">
                        {match.awayScore ?? 0}
                      </span>
                      <button
                        onClick={() => handleQuickStep(match, 'away', 1)}
                        className="w-12 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 border-2 border-emerald-300 text-slate-950 font-black text-xl flex items-center justify-center cursor-pointer active:scale-90 shadow-md"
                        title="Sumar gol"
                        aria-label="Sumar gol a visitante"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Acciones auxiliares del partido */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  {match.isPlayed ? (
                    <button
                      onClick={() => handleScoreChange(match, null, null, false)}
                      className="min-h-[48px] px-3 text-base font-bold text-red-300 hover:text-white underline cursor-pointer"
                    >
                      Borrar resultado
                    </button>
                  ) : (
                    <button
                      onClick={() => handleScoreChange(match, match.homeScore ?? 0, match.awayScore ?? 0, true)}
                      className="min-h-[48px] px-4 bg-emerald-800 border-2 border-emerald-500 text-white font-bold text-base rounded-xl cursor-pointer"
                    >
                      Confirmar {match.homeScore ?? 0} a {match.awayScore ?? 0}
                    </button>
                  )}

                  {onOpenPenaltyGame && match.isPlayed && match.homeScore === match.awayScore && (
                    <button
                      onClick={() => onOpenPenaltyGame(match.homeTeamId, match.awayTeamId)}
                      className="min-h-[48px] px-4 bg-amber-400/20 border-2 border-amber-400 text-amber-300 font-bold text-base rounded-xl cursor-pointer"
                    >
                      🥅 Desempatar en Penales
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Único Botón Principal de la Pantalla de Fixture */}
      <div className="pt-2">
        <button
          onClick={onNavigateToStandings}
          className="w-full min-h-[52px] py-4 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base rounded-2xl shadow-2xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <Trophy className="w-5 h-5 text-slate-950" />
          <span>🏆 Ver Tabla de Posiciones y Desempates</span>
        </button>
      </div>
    </div>
  );
};
