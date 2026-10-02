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
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [imageTimestamp, setImageTimestamp] = useState<number>(() => Date.now());

  const handleUploadImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch('/api/upload-evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, filename: file.name }),
        });
        const data = await res.json();
        if (res.ok) {
          setImageTimestamp(Date.now());
          showToast('¡Captura original actualizada y subida a tu GitHub!');
        } else {
          showToast('Error al subir: ' + (data.error || 'Intente nuevamente'));
        }
      } catch (err: any) {
        showToast('Error al procesar: ' + err.message);
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.onerror = () => {
      showToast('Error al leer el archivo seleccionado');
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

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
        onOpenEvidence={() => setShowEvidenceModal(true)}
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

      {/* Modal para visualizar la captura y carpeta de Prompt 1 */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  📁
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Carpeta y Captura: Prompt 1
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ubicación en el repositorio: <code className="text-amber-300">/prompt-1/</code> y <code className="text-amber-300">/evidencias/</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Vista previa de la captura */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">📸 Captura de pantalla de la tabla y desempates:</span>
                <a
                  href={`/prompt-1/prompt_1.jpg?t=${imageTimestamp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline font-medium"
                >
                  Abrir imagen completa ➜
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-1">
                <img
                  src={`/prompt-1/prompt_1.jpg?t=${imageTimestamp}`}
                  alt="Captura de Prompt 1"
                  className="w-full h-auto rounded-lg object-contain max-h-[45vh]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Subir archivo original del usuario */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-amber-400">
                    📤 Reemplazar con tu archivo original exacto
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Selecciona tu archivo <code className="text-white font-mono">Captura de pantalla 2026-10-02 085915.png</code> y se guardará y sincronizará a tu GitHub al instante.
                  </p>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow cursor-pointer transition-all active:scale-95">
                <span>{isUploadingImage ? 'Subiendo y sincronizando a GitHub...' : '📁 Elegir archivo desde mi PC'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImageFile}
                  disabled={isUploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {/* Guía de archivos y enlace a GitHub */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-400">Archivos en tu repositorio:</h4>
                <a
                  href="https://github.com/marvin007-hei/TorneoRelampago/tree/main/prompt-1"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Ver en GitHub ➜
                </a>
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                <li><code className="text-emerald-400 font-mono">/prompt-1/prompt_1.jpg</code></li>
                <li><code className="text-emerald-400 font-mono">/prompt-1/Captura_de_pantalla_2026-10-02_085915.png</code></li>
                <li><code className="text-emerald-400 font-mono">/prompt-1/README.md</code></li>
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Entendido / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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
