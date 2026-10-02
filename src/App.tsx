/**
 * @file src/App.tsx
 * @description Aplicación principal de TORNEO RELÁMPAGO.
 * Organizador estudiantil de torneos de fútbol para los recreos.
 * 
 * Cumple con las 3 funciones requeridas:
 * 1. Registrar equipos y jugadores (TeamManager).
 * 2. Generar el calendario de partidos (FixtureView).
 * 3. Tabla de posiciones que se recalcula en tiempo real con cada resultado (StandingsTable).
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. Sincronización de estado reactivo: El cálculo de la tabla (calculateStandings)
 *    debe ejecutarse con useMemo dependiente de [teams, matches]. Si se guarda en un estado
 *    separado con useEffect desfasado, la tabla muestra datos desactualizados tras un gol.
 * 2. Persistencia en localStorage: Siempre guardar tanto `teams` como `matches` juntos.
 *    Si eliminas un equipo que ya tiene partidos en el fixture, los partidos quedan huérfanos;
 *    por eso al eliminar un equipo se limpian o regeneran los partidos vinculados.
 * 3. Diseño Mobile-First: En el patio escolar los estudiantes usan celulares con una sola mano;
 *    la barra de navegación inferior y los botones con tamaño de toque mínimo (44px) evitan toques erróneos.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Team, Match, Player } from './types/tournament';
import { generateFixture } from './utils/fixtureGenerator';
import { calculateStandings } from './utils/standingsCalculator';
import {
  loadStoredTeams,
  saveStoredTeams,
  loadStoredMatches,
  saveStoredMatches,
  getSampleTournament,
  clearTournamentStorage,
} from './utils/storage';
import { Header } from './components/Header';
import { TeamManager } from './components/TeamManager';
import { FixtureView } from './components/FixtureView';
import { StandingsTable } from './components/StandingsTable';
import { Users, Calendar, Trophy, AlertCircle } from 'lucide-react';

type TabType = 'teams' | 'fixture' | 'standings';

export default function App() {
  // Estado principal
  const [teams, setTeams] = useState<Team[]>(() => loadStoredTeams());
  const [matches, setMatches] = useState<Match[]>(() => loadStoredMatches());
  const [activeTab, setActiveTab] = useState<TabType>('teams');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-mostrar mensaje toast temporal
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Guardar en localStorage cada vez que cambien equipos o partidos
  useEffect(() => {
    saveStoredTeams(teams);
  }, [teams]);

  useEffect(() => {
    saveStoredMatches(matches);
  }, [matches]);

  // Recálculo automático instantáneo de la tabla de posiciones con useMemo
  // ERROR COMÚN: No memorizar o calcular fuera del ciclo de render de React
  const { standings, tiebreaks } = useMemo(() => {
    return calculateStandings(teams, matches);
  }, [teams, matches]);

  // --- Handlers de Equipos ---
  const handleAddTeam = (newTeam: Team) => {
    setTeams((prev) => [...prev, newTeam]);
    showToast(`¡Equipo "${newTeam.name}" inscripto con éxito!`);
  };

  const handleDeleteTeam = (teamId: string) => {
    const teamToDelete = teams.find((t) => t.id === teamId);
    if (!teamToDelete) return;

    if (
      matches.length > 0 &&
      !window.confirm(
        `Eliminar a "${teamToDelete.name}" borrará los partidos generados del torneo. ¿Continuar?`
      )
    ) {
      return;
    }

    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    // Limpiamos partidos afectados
    setMatches([]);
    showToast(`Equipo "${teamToDelete.name}" eliminado. Podés regenerar el fixture.`);
  };

  const handleAddPlayer = (teamId: string, player: Player) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            players: [...t.players, player],
          };
        }
        return t;
      })
    );
    showToast(`Jugador ${player.name} sumado al equipo.`);
  };

  const handleRemovePlayer = (teamId: string, playerId: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            players: t.players.filter((p) => p.id !== playerId),
          };
        }
        return t;
      })
    );
  };

  // --- Handlers de Fixture y Partidos ---
  const handleGenerateFixture = () => {
    if (teams.length < 2) {
      showToast('Se necesitan mínimo 2 equipos para armar el fixture.');
      return;
    }

    if (
      matches.some((m) => m.isPlayed) &&
      !window.confirm('Ya hay partidos con resultados cargados. ¿Deseas reiniciar el calendario?')
    ) {
      return;
    }

    const newMatches = generateFixture(teams);
    setMatches(newMatches);
    setActiveTab('fixture');
    showToast(`¡Fixture equilibrado generado con ${newMatches.length} partidos!`);
  };

  const handleUpdateMatchScore = (
    matchId: string,
    homeScore: number | null,
    awayScore: number | null,
    isPlayed: boolean
  ) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            homeScore,
            awayScore,
            isPlayed,
            playedAt: isPlayed ? Date.now() : undefined,
          };
        }
        return m;
      })
    );
  };

  // --- Handlers de Demostración y Reinicio ---
  const handleLoadSample = () => {
    const sample = getSampleTournament();
    setTeams(sample.teams);
    setMatches(sample.matches);
    setActiveTab('standings');
    showToast('¡Torneo de ejemplo cargado con 4 cursos y resultados para ver desempates!');
  };

  const handleResetTournament = () => {
    if (window.confirm('¿Seguro que querés reiniciar el torneo y borrar todos los datos del recreo?')) {
      clearTournamentStorage();
      setTeams([]);
      setMatches([]);
      setActiveTab('teams');
      showToast('Torneo reiniciado. Podés registrar nuevos equipos.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20 sm:pb-8 selection:bg-amber-500 selection:text-slate-950">
      {/* Encabezado Principal */}
      <Header
        teamsCount={teams.length}
        matchesCount={matches.length}
        onLoadSample={handleLoadSample}
        onReset={handleResetTournament}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* Barra de Navegación de Pestañas Superior (para tablets y escritorio) */}
        <div className="hidden sm:grid grid-cols-3 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'teams'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Equipos y Jugadores ({teams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fixture')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'fixture'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>2. Calendario de Partidos ({matches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('standings')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'standings'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>3. Tabla de Posiciones</span>
          </button>
        </div>

        {/* Vista Activa */}
        <div className="animate-fadeIn">
          {activeTab === 'teams' && (
            <TeamManager
              teams={teams}
              onAddTeam={handleAddTeam}
              onDeleteTeam={handleDeleteTeam}
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
              onGenerateFixturePrompt={() => {
                if (matches.length === 0) {
                  handleGenerateFixture();
                } else {
                  setActiveTab('fixture');
                }
              }}
            />
          )}

          {activeTab === 'fixture' && (
            <FixtureView
              teams={teams}
              matches={matches}
              onGenerateFixture={handleGenerateFixture}
              onUpdateMatchScore={handleUpdateMatchScore}
              onNavigateToStandings={() => setActiveTab('standings')}
            />
          )}

          {activeTab === 'standings' && (
            <StandingsTable
              standings={standings}
              tiebreaks={tiebreaks}
              teams={teams}
              matches={matches}
              onNavigateToFixture={() => setActiveTab('fixture')}
            />
          )}
        </div>
      </main>

      {/* Barra de Navegación Inferior Móvil (Mobile-first, táctil) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-2xl px-2 py-1.5">
        <div className="grid grid-cols-3 gap-1 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'teams'
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span>Equipos ({teams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fixture')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'fixture'
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span>Fixture ({matches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('standings')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer relative ${
              activeTab === 'standings'
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-5 h-5 mb-0.5" />
            <span>Tabla</span>
            {standings.length > 0 && standings[0].points > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>
      </nav>

      {/* Notificación Toast Flotante */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-amber-500/50 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
