/**
 * @file src/components/TeamManager.tsx
 * @description Componente para el registro de equipos y sus respectivos jugadores.
 * Función 1 del requerimiento: Registrar equipos y jugadores.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. IDs duplicados: Generar identificadores únicos robustos basados en timestamp + random
 *    para evitar colisiones si se crean dos equipos o jugadores rápidamente en el recreo.
 * 2. Validación de nombres vacíos: Limpiar con .trim() para evitar que se registren
 *    equipos sin nombre o con solo espacios en blanco.
 * 3. Inmutabilidad del estado en React: Al agregar un jugador a un equipo, NO mutar
 *    el array de jugadores in-place; clonar el equipo y el array de jugadores.
 */

import React, { useState } from 'react';
import { Team, Player } from '../types/tournament';
import { Users, UserPlus, Shield, Trash2, Plus, Sparkles, AlertCircle } from 'lucide-react';

interface TeamManagerProps {
  teams: Team[];
  onAddTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
  onAddPlayer: (teamId: string, player: Player) => void;
  onRemovePlayer: (teamId: string, playerId: string) => void;
  onGenerateFixturePrompt: () => void;
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
}) => {
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [showAddForm, setShowAddForm] = useState(teams.length === 0);

  // Estados locales para agregar jugador a un equipo específico
  const [activePlayerTeamId, setActivePlayerTeamId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerDorsal, setNewPlayerDorsal] = useState<string>('');

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = teamName.trim();
    if (!cleanName) return;

    // Generamos un ID seguro y nombre corto sugerido
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
    // Rotar color predeterminado para el siguiente equipo
    const nextColorIdx = (PRESET_COLORS.indexOf(selectedColor) + 1) % PRESET_COLORS.length;
    setSelectedColor(PRESET_COLORS[nextColorIdx]);
    setShowAddForm(false);
  };

  const handleCreatePlayer = (teamId: string) => {
    const cleanPlayerName = newPlayerName.trim();
    if (!cleanPlayerName) return;

    const dorsalNum = newPlayerDorsal ? parseInt(newPlayerDorsal, 10) : undefined;

    const player: Player = {
      id: `player-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanPlayerName,
      dorsal: isNaN(dorsalNum || NaN) ? undefined : dorsalNum,
    };

    onAddPlayer(teamId, player);
    setNewPlayerName('');
    setNewPlayerDorsal('');
    setActivePlayerTeamId(null);
  };

  return (
    <div className="space-y-4">
      {/* Barra de estado y botón para abrir formulario */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" />
            Equipos del Recreo ({teams.length})
          </h2>
          <p className="text-xs text-slate-400">
            Registrá los cursos o grupos que van a competir en el patio
          </p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-transform active:scale-95 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Equipo</span>
          </button>
        )}
      </div>

      {/* Formulario de Alta de Equipo */}
      {showAddForm && (
        <form
          onSubmit={handleCreateTeam}
          className="bg-slate-900 border-2 border-amber-500/40 p-4 rounded-xl shadow-lg space-y-3 relative"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-extrabold uppercase text-amber-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Inscribir Nuevo Equipo
            </span>
            {teams.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-0.5"
              >
                Cancelar
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre del equipo o curso <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Ej: 5to B - Los Rayos, 4to C..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Capitán o delegado (opcional)
            </label>
            <input
              type="text"
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              placeholder="Ej: Mateo (N° 10)"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Color de camiseta / distintivo
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    selectedColor === color
                      ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-md'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Seleccionar color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-lg shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Confirmar e Inscribir Equipo
            </button>
          </div>
        </form>
      )}

      {/* Lista de Equipos */}
      {teams.length === 0 ? (
        <div className="text-center py-8 px-4 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-300">
            No hay equipos inscriptos todavía
          </p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Comenzá agregando los equipos del curso o cargá el torneo de ejemplo para ver cómo funciona el fixture y la tabla.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm space-y-3 relative overflow-hidden"
            >
              {/* Barra de color identificador en el lateral izquierdo */}
              <div
                className="absolute top-0 left-0 bottom-0 w-1.5"
                style={{ backgroundColor: team.color }}
              />

              {/* Cabecera de la tarjeta del equipo */}
              <div className="flex items-start justify-between pl-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-inner"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.shortName.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white tracking-tight">
                      {team.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {team.captainName ? `Capitán: ${team.captainName}` : 'Sin capitán asignado'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTeam(team.id)}
                  className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                  title="Eliminar equipo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de Jugadores */}
              <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>JUGADORES ({team.players.length})</span>
                  <button
                    onClick={() =>
                      setActivePlayerTeamId(activePlayerTeamId === team.id ? null : team.id)
                    }
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Agregar</span>
                  </button>
                </div>

                {/* Formulario rápido para agregar jugador */}
                {activePlayerTeamId === team.id && (
                  <div className="p-2 bg-slate-900 rounded border border-amber-500/30 space-y-1.5 animate-fadeIn">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Nombre del jugador"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        autoFocus
                      />
                      <input
                        type="number"
                        placeholder="N°"
                        value={newPlayerDorsal}
                        onChange={(e) => setNewPlayerDorsal(e.target.value)}
                        className="w-12 bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-xs text-white text-center placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActivePlayerTeamId(null)}
                        className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreatePlayer(team.id)}
                        className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded hover:bg-amber-400 cursor-pointer"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                )}

                {/* Chips de jugadores */}
                {team.players.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">
                    Sin jugadores registrados. ¡Sumá a los del recreo!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {team.players.map((player) => (
                      <span
                        key={player.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] border border-slate-700/80"
                      >
                        {player.dorsal !== undefined && (
                          <span className="font-mono text-amber-400 font-bold">
                            #{player.dorsal}
                          </span>
                        )}
                        <span>{player.name}</span>
                        <button
                          type="button"
                          onClick={() => onRemovePlayer(team.id, player.id)}
                          className="text-slate-400 hover:text-red-400 ml-0.5 cursor-pointer"
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

      {/* Sugerencia o aviso para generar fixture */}
      {teams.length >= 2 && (
        <div className="bg-gradient-to-r from-slate-900 to-amber-950/30 p-3.5 rounded-xl border border-amber-500/30 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">
                ¡Ya tenés {teams.length} equipos registrados!
              </p>
              <p className="text-[11px] text-slate-400">
                Podés generar el calendario de partidos para los recreos.
              </p>
            </div>
          </div>
          <button
            onClick={onGenerateFixturePrompt}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            Ir al Fixture ➜
          </button>
        </div>
      )}
    </div>
  );
};
