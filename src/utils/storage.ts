/**
 * @file src/utils/storage.ts
 * @description Gestión de persistencia local (localStorage) para Torneo Relámpago.
 * Permite que los datos del torneo escolar no se pierdan al cerrar la pestaña o recargar.
 * Incluye un set de datos de prueba predefinido para demostración instantánea.
 */

import { Team, Match } from '../types/tournament';
import { generateFixture } from './fixtureGenerator';

const STORAGE_KEY_TEAMS = 'torneo_relampago_teams_v1';
const STORAGE_KEY_MATCHES = 'torneo_relampago_matches_v1';

export const SAMPLE_TEAMS: Team[] = [
  {
    id: 'team-5a',
    name: '5to A - Los Rayos',
    shortName: '5TO A',
    color: '#3B82F6', // Azul eléctrico
    captainName: 'Mateo González',
    players: [
      { id: 'p1', name: 'Mateo González', dorsal: 10 },
      { id: 'p2', name: 'Lucas Díaz', dorsal: 7 },
      { id: 'p3', name: 'Tomás Ruiz', dorsal: 1 },
      { id: 'p4', name: 'Nicolás Benítez', dorsal: 5 },
      { id: 'p5', name: 'Joaquín Silva', dorsal: 9 },
    ],
    createdAt: Date.now() - 100000,
  },
  {
    id: 'team-6b',
    name: '6to B - La Máquina',
    shortName: '6TO B',
    color: '#EF4444', // Rojo furia
    captainName: 'Santiago Rossi',
    players: [
      { id: 'p6', name: 'Santiago Rossi', dorsal: 8 },
      { id: 'p7', name: 'Facundo Pérez', dorsal: 11 },
      { id: 'p8', name: 'Esteban Sosa', dorsal: 1 },
      { id: 'p9', name: 'Bruno Romero', dorsal: 4 },
      { id: 'p10', name: 'Matías Godoy', dorsal: 3 },
    ],
    createdAt: Date.now() - 90000,
  },
  {
    id: 'team-4c',
    name: '4to C - Furia FC',
    shortName: '4TO C',
    color: '#10B981', // Verde esmeralda
    captainName: 'Ignacio Morales',
    players: [
      { id: 'p11', name: 'Ignacio Morales', dorsal: 10 },
      { id: 'p12', name: 'Julián Castro', dorsal: 6 },
      { id: 'p13', name: 'Lautaro Vega', dorsal: 1 },
      { id: 'p14', name: 'Agustín Medina', dorsal: 2 },
    ],
    createdAt: Date.now() - 80000,
  },
  {
    id: 'team-5b',
    name: '5to B - Galácticos',
    shortName: '5TO B',
    color: '#F59E0B', // Ámbar dorado
    captainName: 'Valentín Ortiz',
    players: [
      { id: 'p15', name: 'Valentín Ortiz', dorsal: 9 },
      { id: 'p16', name: 'Ramiro Acosta', dorsal: 7 },
      { id: 'p17', name: 'Benjamín Cruz', dorsal: 1 },
      { id: 'p18', name: 'Maxi Flores', dorsal: 5 },
    ],
    createdAt: Date.now() - 70000,
  },
];

export function loadStoredTeams(): Team[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEAMS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error al leer equipos de localStorage:', error);
    return [];
  }
}

export function saveStoredTeams(teams: Team[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(teams));
  } catch (error) {
    console.error('Error al guardar equipos en localStorage:', error);
  }
}

export function loadStoredMatches(): Match[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MATCHES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error al leer partidos de localStorage:', error);
    return [];
  }
}

export function saveStoredMatches(matches: Match[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(matches));
  } catch (error) {
    console.error('Error al guardar partidos en localStorage:', error);
  }
}

/**
 * Carga un torneo de ejemplo completo con fixture y algunos partidos ya jugados
 * para que el usuario pueda apreciar de inmediato la tabla y los desempates.
 */
export function getSampleTournament(): { teams: Team[]; matches: Match[] } {
  const teams = [...SAMPLE_TEAMS];
  const generatedMatches = generateFixture(teams);

  // Cargamos resultados realistas para las 2 primeras fechas para demostrar empates
  // y criterios de desempate en acción:
  // Fecha 1:
  // 5to A 3 - 1 5to B (5to A +3, DG +2)
  // 6to B 2 - 0 4to C (6to B +3, DG +2)
  // En este punto 5to A y 6to B empatan en PTS (+3) y en DG (+2), pero 5to A tiene 3 GF vs 2 GF!
  if (generatedMatches.length >= 2) {
    generatedMatches[0].homeScore = 3;
    generatedMatches[0].awayScore = 1;
    generatedMatches[0].isPlayed = true;

    generatedMatches[1].homeScore = 2;
    generatedMatches[1].awayScore = 0;
    generatedMatches[1].isPlayed = true;
  }

  return {
    teams,
    matches: generatedMatches,
  };
}

export function clearTournamentStorage(): void {
  localStorage.removeItem(STORAGE_KEY_TEAMS);
  localStorage.removeItem(STORAGE_KEY_MATCHES);
}

/**
 * Exporta todos los datos del torneo a un string JSON formateado
 */
export function exportTournamentData(): string {
  const teams = loadStoredTeams();
  const matches = loadStoredMatches();
  const backup = {
    app: 'Torneo Relámpago',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    teams,
    matches,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Dispara la descarga del archivo JSON de respaldo en el dispositivo del usuario
 */
export function downloadTournamentBackup(): void {
  const jsonString = exportTournamentData();
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `torneo_relampago_respaldo_${dateStr}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Restaura los datos del torneo desde un archivo JSON previamente exportado
 */
export function importTournamentData(jsonString: string): { teams: Team[]; matches: Match[] } {
  const parsed = JSON.parse(jsonString);
  if (!parsed.teams || !Array.isArray(parsed.teams)) {
    throw new Error('El archivo JSON no contiene una lista válida de equipos.');
  }
  saveStoredTeams(parsed.teams);
  const matches = Array.isArray(parsed.matches) ? parsed.matches : [];
  saveStoredMatches(matches);
  return {
    teams: parsed.teams,
    matches,
  };
}

