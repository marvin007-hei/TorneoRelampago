/**
 * @file src/components/FixtureView.tsx
 * @description Vista del calendario de partidos (Fixture) y carga de resultados.
 * Función 2 del requerimiento: Generar el calendario de partidos.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. Modificar partidos en memoria sin actualizar `isPlayed`: Si el usuario pone
 *    goles 0 - 0, el sistema debe marcar explícitamente `isPlayed: true` para que la tabla
 *    distinga entre "no jugado" y "empate en cero".
 * 2. Validación de números negativos: Los goles no pueden ser menores a cero.
 * 3. Filtrar por fecha activa sin perder el estado de las otras fechas.
 */

import React, { useState } from 'react';
import { Team, Match } from '../types/tournament';
import { Calendar, CheckCircle2, Clock, RotateCcw, Sparkles, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface FixtureViewProps {
  teams: Team[];
  matches: Match[];
  onGenerateFixture: () => void;
  onUpdateMatchScore: (matchId: string, homeScore: number | null, awayScore: number | null, isPlayed: boolean) => void;
  onNavigateToStandings: () => void;
}

export const FixtureView: React.FC<FixtureViewProps> = ({
  teams,
  matches,
  onGenerateFixture,
  onUpdateMatchScore,
  onNavigateToStandings,
}) => {
  // Mapa rápido de ID de equipo a objeto Team
  const teamMap = new Map<string, Team>(teams.map((t) => [t.id, t]));

  // Obtenemos las fechas únicas del fixture
  const rounds = Array.from(new Set(matches.map((m) => m.roundNumber))).sort((a, b) => a - b);
  const [activeRound, setActiveRound] = useState<number>(rounds[0] || 1);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Partidos correspondientes a la fecha seleccionada
  const currentMatches = matches.filter((m) => m.roundNumber === activeRound);

  // Estadísticas globales del fixture
  const totalMatches = matches.length;
  const playedMatchesCount = matches.filter((m) => m.isPlayed).length;

  const handleScoreChange = (match: Match, home: number | null, away: number | null, played: boolean) => {
    // Si ambos son null, se marca como no jugado
    if (home === null || away === null) {
      onUpdateMatchScore(match.id, null, null, false);
      return;
    }

    // Evitamos goles negativos
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

    // Al tocar un botón de gol, se asume que el partido ya se jugó o se está jugando
    onUpdateMatchScore(match.id, newHome, newAway, true);
  };

  const handleAskFixtureAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const response = await fetch('/api/ai/fixture-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams, matches }),
      });
      const data = await response.json();
      setAiAdvice(data.advice || 'Fixture equilibrado con sistema todos contra todos.');
    } catch (e) {
      setAiAdvice(
        `Fixture de ${teams.length} equipos con rotación equitativa en ${rounds.length} fechas de recreo.`
      );
    } finally {
      setLoadingAdvice(false);
    }
  };

  // Si no hay equipos suficientes
  if (teams.length < 2) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Necesitás al menos 2 equipos</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Inscribí a los equipos de los distintos cursos para poder generar el fixture del recreo.
        </p>
      </div>
    );
  }

  // Si hay equipos pero aún no se generó el fixture
  if (matches.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
          ⚡
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">
            Generar Calendario de Partidos
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Se creará un fixture equilibrado (todos contra todos) con turnos distribuidos para los recreos de la escuela.
          </p>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 max-w-xs mx-auto text-xs text-slate-300 text-left space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Equipos listos: {teams.length}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Se disputarán {(teams.length * (teams.length - 1)) / 2} partidos en{' '}
            {teams.length % 2 === 0 ? teams.length - 1 : teams.length} fechas de recreo.
          </p>
        </div>

        <button
          onClick={onGenerateFixture}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>¡Armar Fixture Equilibrado Ahora!</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra superior de control de fechas y progreso */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              Partidos del Recreo
            </h2>
            <p className="text-[11px] text-slate-400">
              Progreso: {playedMatchesCount} de {totalMatches} partidos jugados (
              {Math.round((playedMatchesCount / totalMatches) * 100)}%)
            </p>
          </div>

          <button
            onClick={onGenerateFixture}
            className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 cursor-pointer"
            title="Regenerar fixture desde cero"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Rehacer</span>
          </button>
        </div>

        {/* Pestañas horizontales de Fechas (desplazables en pantalla pequeña) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {rounds.map((round) => {
            const roundMatches = matches.filter((m) => m.roundNumber === round);
            const isCompleted = roundMatches.every((m) => m.isPlayed);

            return (
              <button
                key={round}
                onClick={() => setActiveRound(round)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  activeRound === round
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                <span>Fecha {round}</span>
                {isCompleted && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      activeRound === round ? 'bg-slate-950' : 'bg-emerald-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Consejo o análisis de IA del Fixture */}
      {aiAdvice && (
        <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>{aiAdvice}</p>
        </div>
      )}

      {/* Lista de partidos de la fecha seleccionada */}
      <div className="space-y-3">
        {currentMatches.map((match) => {
          const homeTeam = teamMap.get(match.homeTeamId);
          const awayTeam = teamMap.get(match.awayTeamId);

          if (!homeTeam || !awayTeam) return null;

          return (
            <div
              key={match.id}
              className={`bg-slate-900 border rounded-xl p-3.5 shadow-sm transition-all ${
                match.isPlayed ? 'border-slate-800 bg-slate-900/90' : 'border-slate-700/80'
              }`}
            >
              {/* Encabezado del partido: Franja horaria y estado */}
              <div className="flex items-center justify-between text-[11px] pb-2 mb-2 border-b border-slate-800 text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {match.recessSlot || 'Recreo Escolar'}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    match.isPlayed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {match.isPlayed ? '✓ Jugado' : '⏳ Pendiente'}
                </span>
              </div>

              {/* Marcador táctil interactivo */}
              <div className="grid grid-cols-7 items-center gap-2 py-1">
                {/* Equipo Local */}
                <div className="col-span-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-white truncate">
                      {homeTeam.name}
                    </span>
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20 shadow-sm"
                      style={{ backgroundColor: homeTeam.color }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {homeTeam.captainName ? `Cap: ${homeTeam.captainName}` : 'Local'}
                  </span>
                </div>

                {/* Marcador Central */}
                <div className="col-span-1 text-center flex flex-col items-center justify-center">
                  <div className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 font-mono font-black text-base text-amber-400 tracking-wider shadow-inner">
                    {match.isPlayed ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}` : 'VS'}
                  </div>
                </div>

                {/* Equipo Visitante */}
                <div className="col-span-3 text-left">
                  <div className="flex items-center justify-start gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20 shadow-sm"
                      style={{ backgroundColor: awayTeam.color }}
                    />
                    <span className="font-extrabold text-sm sm:text-base text-white truncate">
                      {awayTeam.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {awayTeam.captainName ? `Cap: ${awayTeam.captainName}` : 'Visitante'}
                  </span>
                </div>
              </div>

              {/* Botonera de control de goles táctil para celulares */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 bg-slate-950/50 p-2 rounded-lg">
                {/* Controles Local */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleQuickStep(match, 'home', -1)}
                    className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center active:scale-90 transition-transform cursor-pointer border border-slate-700"
                    title="Restar gol a local"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs font-bold text-white px-1.5">
                    {match.homeScore ?? 0}
                  </span>
                  <button
                    onClick={() => handleQuickStep(match, 'home', 1)}
                    className="w-7 h-7 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-sm"
                    title="Sumar gol a local"
                  >
                    +
                  </button>
                </div>

                {/* Botón estado o reset */}
                <div className="text-center">
                  {match.isPlayed ? (
                    <button
                      onClick={() => handleScoreChange(match, null, null, false)}
                      className="text-[10px] text-slate-400 hover:text-red-400 underline decoration-dotted cursor-pointer"
                    >
                      Limpiar
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleScoreChange(
                          match,
                          match.homeScore ?? 0,
                          match.awayScore ?? 0,
                          true
                        )
                      }
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded cursor-pointer transition-colors"
                    >
                      Marcar jugado
                    </button>
                  )}
                </div>

                {/* Controles Visitante */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleQuickStep(match, 'away', -1)}
                    className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center active:scale-90 transition-transform cursor-pointer border border-slate-700"
                    title="Restar gol a visitante"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs font-bold text-white px-1.5">
                    {match.awayScore ?? 0}
                  </span>
                  <button
                    onClick={() => handleQuickStep(match, 'away', 1)}
                    className="w-7 h-7 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-sm"
                    title="Sumar gol a visitante"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón de acceso directo a la tabla de posiciones */}
      <div className="pt-2 flex items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <button
          onClick={handleAskFixtureAdvice}
          disabled={loadingAdvice}
          className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loadingAdvice ? 'Analizando...' : 'Verificar balance con IA'}</span>
        </button>

        <button
          onClick={onNavigateToStandings}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
        >
          Ver Tabla de Posiciones ➜
        </button>
      </div>
    </div>
  );
};
