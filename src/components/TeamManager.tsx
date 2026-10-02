/**
 * @file src/components/TeamManager.tsx
 * @description Registro de equipos y jugadores optimizado para móvil (320px), alto contraste y accesibilidad al sol.
 */

import React, { useState } from 'react';
import { Team, Player } from '../types/tournament';
import { Users, Shield, Trash2, Plus, Sparkles, Check, AlertCircle } from 'lucide-react';

interface TeamManagerProps {
  teams: Team[];
  onAddTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
  onAddPlayer: (teamId: string, player: Player) => void;
  onRemovePlayer: (teamId: string, playerId: string) => void;
  onGenerateFixturePrompt: () => void;
  onLoadSamplePrompt?: () => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Azul
  '#EF4444', // Rojo
  '#10B981', // Verde
  '#F59E0B', // Ámbar
  '#8B5CF6', // Púrpura
  '#EC4899', // Rosa
  '#06B6D4', // Cian
  '#F97316', // Naranja
];

export const TeamManager: React.FC<TeamManagerProps> = ({
  teams,
  onAddTeam,
  onDeleteTeam,
  onAddPlayer,
  onRemovePlayer,
  onGenerateFixturePrompt,
  onLoadSamplePrompt,
}) => {
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Estados para agregar jugador
  const [activePlayerTeamId, setActivePlayerTeamId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerDorsal, setNewPlayerDorsal] = useState<string>('');
  const [playerError, setPlayerError] = useState<string | null>(null);

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = teamName.trim();
    if (!cleanName) {
      setFormError('Por favor, escribe el nombre del equipo o curso antes de guardar.');
      return;
    }

    const exists = teams.some((t) => t.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      setFormError('Ya existe un equipo con ese nombre. Por favor, escribe un nombre diferente.');
      return;
    }

    const newTeam: Team = {
      id: `team-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      shortName: cleanName.length > 5 ? cleanName.substring(0, 5).toUpperCase() : cleanName.toUpperCase(),
      color: selectedColor,
      captainName: captainName.trim() || undefined,
      players: captainName.trim()
        ? [{ id: `p-cap-${Date.now()}`, name: captainName.trim(), dorsal: 10 }]
        : [],
      createdAt: Date.now(),
    };

    onAddTeam(newTeam);
    setTeamName('');
    setCaptainName('');
    setFormError(null);
    const nextColorIdx = (PRESET_COLORS.indexOf(selectedColor) + 1) % PRESET_COLORS.length;
    setSelectedColor(PRESET_COLORS[nextColorIdx]);
    setShowAddForm(false);
  };

  const handleCreatePlayer = (teamId: string) => {
    const cleanPlayerName = newPlayerName.trim();
    if (!cleanPlayerName) {
      setPlayerError('Por favor, escribe el nombre del estudiante.');
      return;
    }

    const dorsalNum = newPlayerDorsal ? parseInt(newPlayerDorsal, 10) : undefined;

    const player: Player = {
      id: `player-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanPlayerName,
      dorsal: isNaN(dorsalNum || NaN) ? undefined : dorsalNum,
    };

    onAddPlayer(teamId, player);
    setNewPlayerName('');
    setNewPlayerDorsal('');
    setPlayerError(null);
    setActivePlayerTeamId(null);
  };

  return (
    <div className="space-y-5 w-full max-w-full">
      {/* 5. Estado Vacío: Cuando todavía no hay ningún dato */}
      {teams.length === 0 && !showAddForm && (
        <div className="bg-gradient-to-b from-emerald-950 to-black border-2 border-emerald-500 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center text-3xl">
            ⚽
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white tracking-wide">
              ¡La cancha está vacía!
            </h3>
            <p className="text-base font-bold text-emerald-100 max-w-md mx-auto leading-relaxed">
              Inscribe el primer equipo escolar o carga los 4 cursos de ejemplo para dar el pitazo inicial al campeonato del recreo.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Único botón principal de esta pantalla */}
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>⚽ Inscribir Primer Equipo</span>
            </button>

            {onLoadSamplePrompt && (
              <button
                onClick={onLoadSamplePrompt}
                className="w-full sm:w-auto min-h-[48px] px-5 py-3.5 bg-emerald-900/80 hover:bg-emerald-800 text-white font-bold text-base rounded-2xl border-2 border-emerald-600/80 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Cargar 4 Cursos de Ejemplo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Barra de Encabezado cuando ya hay equipos */}
      {teams.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-emerald-950/90 p-4 rounded-2xl border-2 border-emerald-700/80 shadow-lg">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Equipos del Campeonato ({teams.length})</span>
            </h2>
            <p className="text-base font-bold text-emerald-200">
              Cursos registrados para jugar en los recreos
            </p>
          </div>

          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="min-h-[48px] px-4 py-3 bg-emerald-900 hover:bg-emerald-800 text-white border-2 border-emerald-500 font-bold text-base rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Agregar Otro Equipo</span>
            </button>
          )}
        </div>
      )}

      {/* Formulario de Alta de Equipo */}
      {showAddForm && (
        <form
          onSubmit={handleCreateTeam}
          className="bg-black/90 border-2 border-amber-400 p-5 rounded-2xl shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-2.5">
            <span className="text-base font-black uppercase text-amber-400 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Inscribir Equipo Escolar
            </span>
            {teams.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormError(null);
                }}
                className="min-h-[48px] px-3 text-base font-bold text-red-300 hover:text-white underline cursor-pointer"
              >
                Cerrar
              </button>
            )}
          </div>

          {/* Mensaje de error visible en español */}
          {formError && (
            <div className="bg-red-950 border-2 border-red-500 text-white p-3 rounded-xl flex items-center gap-2 text-base font-bold">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 3. Campo con etiqueta visible */}
          <div className="space-y-1.5">
            <label className="block text-base font-black text-white">
              Nombre del equipo o curso <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                setFormError(null);
              }}
              placeholder="Ej: 5to A - Los Rayos, 6to B..."
              className="w-full min-h-[48px] bg-slate-900 border-2 border-emerald-600 rounded-xl px-4 py-3 text-base font-bold text-white placeholder-emerald-400/60 focus:outline-none focus:border-amber-400"
              autoFocus
            />
          </div>

          {/* 3. Campo con etiqueta visible */}
          <div className="space-y-1.5">
            <label className="block text-base font-black text-white">
              Nombre del capitán o delegado escolar
            </label>
            <input
              type="text"
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              placeholder="Ej: Mateo González (N° 10)"
              className="w-full min-h-[48px] bg-slate-900 border-2 border-emerald-600 rounded-xl px-4 py-3 text-base font-bold text-white placeholder-emerald-400/60 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* 3. Campo con etiqueta visible para colores */}
          <div className="space-y-2">
            <label className="block text-base font-black text-white">
              Color de camiseta o distintivo:
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-11 h-11 rounded-full transition-transform cursor-pointer border-2 ${
                    selectedColor === color
                      ? 'scale-110 border-white ring-4 ring-amber-400 shadow-xl'
                      : 'border-black/50 opacity-85 hover:opacity-100'
                  }`}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* 4. Único Botón Principal */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="w-full min-h-[48px] px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <Check className="w-5 h-5" />
              <span>⚽ Guardar e Inscribir Equipo</span>
            </button>

            {teams.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormError(null);
                }}
                className="w-full sm:w-auto min-h-[48px] px-5 py-3 bg-emerald-950 text-emerald-200 border-2 border-emerald-700 font-bold text-base rounded-xl hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {/* Lista de Equipos */}
      {teams.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-black/85 border-2 border-emerald-600/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3"
            >
              {/* Encabezado del Equipo */}
              <div className="flex items-center justify-between gap-2 border-b border-emerald-800 pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full shrink-0 border-2 border-white shadow-md"
                    style={{ backgroundColor: team.color }}
                  />
                  <div>
                    <h3 className="font-black text-lg text-white">
                      {team.name}
                    </h3>
                    <p className="text-base font-bold text-emerald-300">
                      {team.captainName ? `Capitán: ${team.captainName}` : 'Equipo sin capitán asignado'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteTeam(team.id)}
                  className="min-h-[48px] min-w-[48px] px-3 rounded-xl bg-red-950/70 border-2 border-red-700/80 text-red-200 hover:text-white flex items-center justify-center cursor-pointer active:scale-95"
                  title="Eliminar este equipo"
                  aria-label="Eliminar este equipo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Sección de Jugadores */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-amber-400">
                    Nómina de Jugadores ({team.players.length})
                  </span>
                  {activePlayerTeamId !== team.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setActivePlayerTeamId(team.id);
                        setPlayerError(null);
                      }}
                      className="min-h-[48px] px-3 py-1.5 text-base font-bold text-emerald-200 hover:text-white underline cursor-pointer"
                    >
                      + Sumar Jugador
                    </button>
                  )}
                </div>

                {/* Formulario rápido para sumar jugador con etiquetas visibles */}
                {activePlayerTeamId === team.id && (
                  <div className="bg-emerald-950/90 border-2 border-emerald-500 p-4 rounded-xl space-y-3">
                    {playerError && (
                      <p className="text-base font-bold text-red-300">
                        {playerError}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-base font-black text-white">
                          Nombre del estudiante <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={newPlayerName}
                          onChange={(e) => {
                            setNewPlayerName(e.target.value);
                            setPlayerError(null);
                          }}
                          placeholder="Nombre y apellido"
                          className="w-full min-h-[48px] bg-black border-2 border-emerald-500 rounded-xl px-3 py-2 text-base font-bold text-white focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-base font-black text-white">
                          N° de Camiseta
                        </label>
                        <input
                          type="number"
                          value={newPlayerDorsal}
                          onChange={(e) => setNewPlayerDorsal(e.target.value)}
                          placeholder="Ej: 10"
                          className="w-full min-h-[48px] bg-black border-2 border-emerald-500 rounded-xl px-3 py-2 text-base font-bold text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActivePlayerTeamId(null);
                          setPlayerError(null);
                        }}
                        className="min-h-[48px] px-4 py-2 text-base font-bold text-slate-300 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreatePlayer(team.id)}
                        className="min-h-[48px] px-5 py-2 bg-emerald-500 text-slate-950 font-black text-base rounded-xl hover:bg-emerald-400 cursor-pointer"
                      >
                        Guardar Jugador
                      </button>
                    </div>
                  </div>
                )}

                {/* Chips de jugadores */}
                {team.players.length === 0 ? (
                  <p className="text-base text-emerald-300/80 italic font-medium">
                    Sin jugadores inscritos aún. Haz clic en "+ Sumar Jugador".
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {team.players.map((player) => (
                      <span
                        key={player.id}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-base font-bold border-2 border-emerald-700 shadow-sm"
                      >
                        {player.dorsal !== undefined && (
                          <span className="text-amber-400 font-mono font-black">
                            #{player.dorsal}
                          </span>
                        )}
                        <span>{player.name}</span>
                        <button
                          type="button"
                          onClick={() => onRemovePlayer(team.id, player.id)}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-red-300 hover:text-red-100 cursor-pointer text-lg font-black"
                          title="Quitar jugador"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Único Botón Principal de la Pantalla cuando ya hay 2 o más equipos */}
      {teams.length >= 2 && (
        <div className="bg-gradient-to-r from-emerald-950 to-black p-5 rounded-2xl border-2 border-amber-400 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-lg font-black text-white">
              ¡Hay {teams.length} equipos listos en la cancha!
            </p>
            <p className="text-base font-bold text-emerald-200">
              Genera los partidos equilibrados para todos los recreos escolares.
            </p>
          </div>

          <button
            onClick={onGenerateFixturePrompt}
            className="w-full sm:w-auto min-h-[52px] px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <span>📅 Armar Calendario de Partidos</span>
          </button>
        </div>
      )}
    </div>
  );
};
