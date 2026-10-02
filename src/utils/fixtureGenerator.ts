/**
 * @file src/utils/fixtureGenerator.ts
 * @description Generador de calendario (fixture) para torneos de recreo escolar.
 * Implementa el algoritmo de Berger (Round-Robin todos contra todos).
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. Cantidad impar de equipos: Se DEBE agregar un equipo fantasma ('BYE'/Libre)
 *    para que la rotación sea matemáticamente simétrica; de lo contrario se omiten cruces.
 * 2. Fijación del pivote: En el algoritmo de rotación, el primer elemento (índice 0)
 *    debe mantenerse ESTÁTICO y los restantes rotar en sentido horario. Si rotas el array
 *    completo, se repiten partidos y no se completan todas las fechas.
 * 3. Alternancia Local/Visitante: En cada fecha par o según la posición del pivote,
 *    se debe alternar la localía para que ningún equipo juegue siempre de local.
 */

import { Team, Match } from '../types/tournament';

// Identificador para el descanso en caso de número impar de equipos
export const BYE_TEAM_ID = '__FECHA_LIBRE__';

/**
 * Genera el fixture completo Round-Robin (todos contra todos a una rueda).
 * @param teams Lista de equipos registrados en el torneo.
 * @returns Lista de partidos organizados por fecha (roundNumber).
 */
export function generateFixture(teams: Team[]): Match[] {
  // ERROR COMÚN 1: Intentar generar fixture con menos de 2 equipos.
  if (teams.length < 2) {
    return [];
  }

  const matches: Match[] = [];
  
  // Copiamos la lista de IDs de equipos para no mutar el estado original
  const teamIds = teams.map((t) => t.id);

  // ERROR COMÚN 2: Si el número de equipos es impar, agregamos un elemento virtual
  // para que cada fecha un equipo quede libre (BYE).
  const isOdd = teamIds.length % 2 !== 0;
  if (isOdd) {
    teamIds.push(BYE_TEAM_ID);
  }

  const numTeams = teamIds.length;
  const numRounds = numTeams - 1; // En round-robin n-1 fechas para n equipos pares
  const matchesPerRound = numTeams / 2;

  // Franjas horarias típicas de recreos escolares para ambientar la app estudiantil
  const defaultRecessSlots = [
    'Recreo Mañana (10:00 - 10:20)',
    'Recreo Almuerzo (12:15 - 12:45)',
    'Recreo Tarde (15:00 - 15:20)',
    'Recreo Extendido (Viernes)',
  ];

  // Matriz de rotación: el índice 0 queda fijo (pivote) y el resto rota.
  const rotatingTeams = [...teamIds];

  for (let round = 0; round < numRounds; round++) {
    const roundNumber = round + 1;
    const recessSlot = defaultRecessSlots[round % defaultRecessSlots.length];

    for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
      const homeIdx = matchIdx;
      const awayIdx = numTeams - 1 - matchIdx;

      let homeId = rotatingTeams[homeIdx];
      let awayId = rotatingTeams[awayIdx];

      // ERROR COMÚN 3: Si uno de los equipos es el comodín 'BYE', este partido
      // representa que el rival descansa esa fecha. No lo incluimos en la lista
      // de partidos a jugar en cancha.
      if (homeId === BYE_TEAM_ID || awayId === BYE_TEAM_ID) {
        continue;
      }

      // ERROR COMÚN 4: Balance de localía.
      // Si siempre dejamos al pivote de local, jugará n-1 partidos seguidos de local.
      // Alternamos cuando la fecha es impar para equilibrar camisetas/canchas.
      if (round % 2 === 1 && matchIdx === 0) {
        const temp = homeId;
        homeId = awayId;
        awayId = temp;
      }

      matches.push({
        id: `match-r${roundNumber}-m${matchIdx + 1}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        roundNumber,
        homeTeamId: homeId,
        awayTeamId: awayId,
        homeScore: null,
        awayScore: null,
        isPlayed: false,
        recessSlot,
      });
    }

    // Rotación de los equipos: dejamos el primer elemento en su lugar
    // y rotamos los demás circularmente.
    // [0, 1, 2, 3] -> el '0' queda fijo, [1, 2, 3] rota a [3, 1, 2]
    const fixedTeam = rotatingTeams[0];
    const rest = rotatingTeams.slice(1);
    const lastElement = rest.pop();
    if (lastElement !== undefined) {
      rest.unshift(lastElement);
    }
    rotatingTeams.splice(0, rotatingTeams.length, fixedTeam, ...rest);
  }

  return matches;
}

/**
 * Valida si un fixture está equilibrado (ningún equipo juega dos veces en la misma fecha).
 */
export function validateFixtureBalance(matches: Match[]): { isBalanced: boolean; issues: string[] } {
  const issues: string[] = [];
  const rounds = new Map<number, Set<string>>();

  matches.forEach((m) => {
    if (!rounds.has(m.roundNumber)) {
      rounds.set(m.roundNumber, new Set());
    }
    const teamSet = rounds.get(m.roundNumber)!;
    if (teamSet.has(m.homeTeamId)) {
      issues.push(`El equipo ${m.homeTeamId} tiene más de un partido en la fecha ${m.roundNumber}`);
    }
    if (teamSet.has(m.awayTeamId)) {
      issues.push(`El equipo ${m.awayTeamId} tiene más de un partido en la fecha ${m.roundNumber}`);
    }
    teamSet.add(m.homeTeamId);
    teamSet.add(m.awayTeamId);
  });

  return {
    isBalanced: issues.length === 0,
    issues,
  };
}
