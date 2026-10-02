/**
 * @file src/utils/standingsCalculator.ts
 * @description Calculadora de tabla de posiciones y resolución de criterios de desempate.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. Confundir null/undefined con 0 goles: Un partido 0 - 0 es un empate jugado (suma 1 pt cada uno).
 *    Un partido con homeScore: null aún NO se jugó y NO debe contabilizarse en la tabla.
 * 2. Mutar el arreglo original durante el sort: Array.prototype.sort muta el array in-place.
 *    Siempre hay que hacer una copia `[...standings]` para no generar efectos secundarios en React.
 * 3. Criterio de desempate en cascada: Al comparar equipos con mismos puntos,
 *    se debe evaluar ordenadamente: Puntos -> Diferencia de Gol -> Goles a Favor ->
 *    Enfrentamiento Directo -> Partidos Ganados. Si se evalúa solo diferencia de gol,
 *    quedan empates sin resolver.
 * 4. Enfrentamiento directo (Head to Head): Solo aplica si los equipos empatados
 *    ya jugaron entre sí y uno resultó ganador. Si empataron o aún no jugaron, debe pasar
 *    al siguiente criterio sin romper el ordenamiento.
 */

import { Team, Match, Standing, TiebreakDetail } from '../types/tournament';

/**
 * Recalcula la tabla de posiciones completa a partir de los partidos jugados.
 * @param teams Lista de equipos participantes.
 * @param matches Lista de todos los partidos del torneo (jugados y pendientes).
 * @returns Lista de posiciones ordenadas de 1° a último con detalles de desempates.
 */
export function calculateStandings(teams: Team[], matches: Match[]): {
  standings: Standing[];
  tiebreaks: TiebreakDetail[];
} {
  // Inicializamos las estadísticas en cero para todos los equipos registrados
  const statsMap = new Map<string, Standing>();

  teams.forEach((team) => {
    statsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      teamShortName: team.shortName || team.name.slice(0, 3).toUpperCase(),
      teamColor: team.color,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      position: 1,
      tiebreakReason: undefined,
    });
  });

  // Filtramos únicamente los partidos que ya fueron disputados
  // ERROR COMÚN 1: No verificar `isPlayed` o contar partidos pendientes con valores por defecto.
  const playedMatches = matches.filter(
    (m) => m.isPlayed && m.homeScore !== null && m.awayScore !== null
  );

  // Acumulamos resultados
  for (const match of playedMatches) {
    const home = statsMap.get(match.homeTeamId);
    const away = statsMap.get(match.awayTeamId);

    // Si alguno de los equipos fue eliminado o no existe, continuamos
    if (!home || !away) continue;

    const hScore = Number(match.homeScore);
    const aScore = Number(match.awayScore);

    // Partidos jugados
    home.played += 1;
    away.played += 1;

    // Goles
    home.goalsFor += hScore;
    home.goalsAgainst += aScore;
    home.goalDifference = home.goalsFor - home.goalsAgainst;

    away.goalsFor += aScore;
    away.goalsAgainst += hScore;
    away.goalDifference = away.goalsFor - away.goalsAgainst;

    // Asignación de puntos según victoria, empate o derrota
    if (hScore > aScore) {
      // Gana local (+3 pts)
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (hScore < aScore) {
      // Gana visitante (+3 pts)
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      // Empate (+1 pt cada uno)
      home.drawn += 1;
      home.points += 1;
      away.drawn += 1;
      away.points += 1;
    }
  }

  const rawList = Array.from(statsMap.values());
  const tiebreaks: TiebreakDetail[] = [];

  // Helper para buscar el resultado de enfrentamiento directo entre 2 equipos
  const getHeadToHead = (teamAId: string, teamBId: string): number => {
    const directMatches = playedMatches.filter(
      (m) =>
        (m.homeTeamId === teamAId && m.awayTeamId === teamBId) ||
        (m.homeTeamId === teamBId && m.awayTeamId === teamAId)
    );

    if (directMatches.length === 0) return 0; // No jugaron aún

    let scoreA = 0;
    let scoreB = 0;

    for (const dm of directMatches) {
      const hScore = Number(dm.homeScore);
      const aScore = Number(dm.awayScore);
      if (dm.homeTeamId === teamAId) {
        if (hScore > aScore) scoreA += 3;
        else if (hScore < aScore) scoreB += 3;
        else {
          scoreA += 1;
          scoreB += 1;
        }
      } else {
        if (aScore > hScore) scoreA += 3;
        else if (aScore < hScore) scoreB += 3;
        else {
          scoreA += 1;
          scoreB += 1;
        }
      }
    }

    if (scoreA > scoreB) return 1; // A ganó la serie directa
    if (scoreA < scoreB) return -1; // B ganó la serie directa
    return 0; // Empataron en la serie directa
  };

  // ERROR COMÚN 2 y 3: Ordenamiento estricto con criterios de desempate completos.
  // Usamos copia con [...rawList] para inmutabilidad.
  const sorted = [...rawList].sort((a, b) => {
    // 1. Criterio Puntos
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    // --- EMPATE EN PUNTOS DETECTADO: Aplicamos criterios sucesivos ---

    // 2. Criterio Diferencia de Gol (DG)
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }

    // 3. Criterio Goles a Favor (GF)
    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }

    // 4. Criterio Enfrentamiento Directo (Head to Head)
    const h2h = getHeadToHead(a.teamId, b.teamId);
    if (h2h !== 0) {
      // Si h2h es 1, A va arriba (-1 para sort); si es -1, B va arriba (1 para sort)
      return -h2h;
    }

    // 5. Criterio Mayor Partidos Ganados (PG)
    if (b.won !== a.won) {
      return b.won - a.won;
    }

    // 6. Criterio Alfabético / Sorteo
    return a.teamName.localeCompare(b.teamName);
  });

  // Asignar posiciones ordinales y registrar la justificación de desempates
  sorted.forEach((item, index) => {
    item.position = index + 1;

    // Verificamos si comparte puntos con su vecino inmediato para documentar el desempate
    const prev = sorted[index - 1];
    const next = sorted[index + 1];

    if (prev && prev.points === item.points) {
      // Explicar por qué 'prev' está por encima de 'item'
      if (prev.goalDifference > item.goalDifference) {
        item.tiebreakReason = `Debajo de ${prev.teamName} por Diferencia de Gol (${item.goalDifference > 0 ? '+' : ''}${item.goalDifference} vs ${prev.goalDifference > 0 ? '+' : ''}${prev.goalDifference})`;
        tiebreaks.push({
          teamIdA: prev.teamId,
          teamNameA: prev.teamName,
          teamIdB: item.teamId,
          teamNameB: item.teamName,
          points: item.points,
          criterion: 'goalDifference',
          description: `${prev.teamName} supera a ${item.teamName} con ${item.points} pts por mejor Diferencia de Gol (${prev.goalDifference > 0 ? '+' : ''}${prev.goalDifference} vs ${item.goalDifference > 0 ? '+' : ''}${item.goalDifference}).`,
        });
      } else if (prev.goalsFor > item.goalsFor) {
        item.tiebreakReason = `Debajo de ${prev.teamName} por Goles a Favor (${item.goalsFor} vs ${prev.goalsFor})`;
        tiebreaks.push({
          teamIdA: prev.teamId,
          teamNameA: prev.teamName,
          teamIdB: item.teamId,
          teamNameB: item.teamName,
          points: item.points,
          criterion: 'goalsFor',
          description: `${prev.teamName} supera a ${item.teamName} con ${item.points} pts por mayor cantidad de Goles a Favor (${prev.goalsFor} vs ${item.goalsFor}).`,
        });
      } else {
        const h2h = getHeadToHead(prev.teamId, item.teamId);
        if (h2h === 1) {
          item.tiebreakReason = `Debajo de ${prev.teamName} por Enfrentamiento Directo`;
          tiebreaks.push({
            teamIdA: prev.teamId,
            teamNameA: prev.teamName,
            teamIdB: item.teamId,
            teamNameB: item.teamName,
            points: item.points,
            criterion: 'headToHead',
            description: `${prev.teamName} supera a ${item.teamName} con ${item.points} pts por haber ganado el partido entre ambos.`,
          });
        } else if (prev.won > item.won) {
          item.tiebreakReason = `Debajo de ${prev.teamName} por Partidos Ganados (${item.won} vs ${prev.won})`;
          tiebreaks.push({
            teamIdA: prev.teamId,
            teamNameA: prev.teamName,
            teamIdB: item.teamId,
            teamNameB: item.teamName,
            points: item.points,
            criterion: 'wins',
            description: `${prev.teamName} supera a ${item.teamName} con ${item.points} pts por mayor cantidad de victorias (${prev.won} vs ${item.won}).`,
          });
        } else {
          item.tiebreakReason = `Empate total en criterios con ${prev.teamName} (orden alfabético / sorteo)`;
          tiebreaks.push({
            teamIdA: prev.teamId,
            teamNameA: prev.teamName,
            teamIdB: item.teamId,
            teamNameB: item.teamName,
            points: item.points,
            criterion: 'fairPlayOrDraw',
            description: `${prev.teamName} y ${item.teamName} están empatados en todos los criterios deportivos (${item.points} pts, DG ${item.goalDifference}, GF ${item.goalsFor}).`,
          });
        }
      }
    } else if (next && next.points === item.points) {
      // Es el puntero del empate
      if (item.goalDifference > next.goalDifference) {
        item.tiebreakReason = `Supera a ${next.teamName} por Diferencia de Gol (${item.goalDifference > 0 ? '+' : ''}${item.goalDifference} vs ${next.goalDifference > 0 ? '+' : ''}${next.goalDifference})`;
      } else if (item.goalsFor > next.goalsFor) {
        item.tiebreakReason = `Supera a ${next.teamName} por Goles a Favor (${item.goalsFor} vs ${next.goalsFor})`;
      }
    }
  });

  return {
    standings: sorted,
    tiebreaks,
  };
}
