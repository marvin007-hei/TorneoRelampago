/**
 * @file src/types/tournament.ts
 * @description Definición de tipos para Torneo Relámpago.
 * Representa los modelos fundamentales: Jugador, Equipo, Partido, Fecha y Posición.
 */

export interface Player {
  id: string;
  name: string;
  dorsal?: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string; // Color HEX o clase Tailwind para identificación visual en móvil
  captainName?: string;
  players: Player[];
  createdAt: number;
}

export interface Match {
  id: string;
  roundNumber: number; // Número de fecha (1, 2, 3...)
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null; // null indica que el partido aún no se disputó
  awayScore: number | null;
  isPlayed: boolean;
  recessSlot?: string; // Ejemplo: "Recreo Mañana (10:15)"
  playedAt?: number;
}

export interface Standing {
  teamId: string;
  teamName: string;
  teamShortName: string;
  teamColor: string;
  played: number; // PJ: Partidos jugados
  won: number; // PG: Partidos ganados
  drawn: number; // PE: Partidos empatados
  lost: number; // PP: Partidos perdidos
  goalsFor: number; // GF: Goles a favor
  goalsAgainst: number; // GC: Goles en contra
  goalDifference: number; // DG: Diferencia de gol (GF - GC)
  points: number; // PTS: Puntos acumulados (G=3, E=1, P=0)
  position: number; // 1ro, 2do, etc.
  tiebreakReason?: string; // Explicación del criterio de desempate aplicado
}

export interface TiebreakDetail {
  teamIdA: string;
  teamNameA: string;
  teamIdB: string;
  teamNameB: string;
  points: number;
  criterion: 'goalDifference' | 'goalsFor' | 'headToHead' | 'wins' | 'fairPlayOrDraw';
  description: string;
}

export interface AIStandingsAnalysis {
  summary: string;
  championCandidate: string;
  tiebreakAnalysis: string[];
  recessAdvice: string;
  generatedBy: 'gemini' | 'algorithmic';
}
