/**
 * @file src/components/StandingsTable.tsx
 * @description Tabla de posiciones en tiempo real con criterios de desempate y análisis de IA.
 * Función 3 del requerimiento: Tabla de posiciones que se recalcula con cada resultado.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SUELE EQUIVOCARSE:
 * 1. Desbordamiento horizontal en pantallas móviles: Las tablas con 9 columnas (PJ, PG, PE, PP,
 *    GF, GC, DG, PTS) rompen el viewport de un teléfono. Se debe proveer un contenedor con
 *    overflow-x-auto suave y anchos mínimos fijos, además de destacar la columna PTS.
 * 2. Criterios de desempate invisibles: Los estudiantes discuten por qué un equipo está arriba
 *    de otro si tienen los mismos puntos. Se debe hacer visible de inmediato la regla aplicada
 *    (Diferencia de gol, goles a favor o duelo directo).
 * 3. Manejo de errores en la API de IA: Si el backend tarda o falla, se debe mantener
 *    siempre el desglose determinístico sin arrojar excepciones a la consola.
 */

import React, { useState } from 'react';
import { Standing, TiebreakDetail, Team, Match, AIStandingsAnalysis } from '../types/tournament';
import { Trophy, Sparkles, HelpCircle, Shield, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface StandingsTableProps {
  standings: Standing[];
  tiebreaks: TiebreakDetail[];
  teams: Team[];
  matches: Match[];
  onNavigateToFixture: () => void;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  tiebreaks,
  teams,
  matches,
  onNavigateToFixture,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIStandingsAnalysis | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const playedMatchesCount = matches.filter((m) => m.isPlayed).length;

  const handleRequestAIAnalysis = async () => {
    setLoadingAi(true);
    setAiError(null);

    try {
      // Preparamos payload enriquecido con nombres legibles
      const teamMap = new Map(teams.map((t) => [t.id, t.name]));
      const enrichedMatches = matches.map((m) => ({
        ...m,
        homeTeamName: teamMap.get(m.homeTeamId) || m.homeTeamId,
        awayTeamName: teamMap.get(m.awayTeamId) || m.awayTeamId,
      }));

      const res = await fetch('/api/ai/analyze-standings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standings,
          matches: enrichedMatches,
          teams,
        }),
      });

      if (!res.ok) {
        throw new Error('Error al conectar con el servicio de análisis');
      }

      const data: AIStandingsAnalysis = await res.json();
      setAiAnalysis(data);
    } catch (err: any) {
      console.warn('Fallback local de análisis:', err.message);
      // Generamos análisis algorítmico determinístico garantizado
      const leader = standings[0];
      const tiebreakTexts = tiebreaks.map((t) => t.description);

      setAiAnalysis({
        summary: `El torneo escolar cuenta con ${playedMatchesCount} partidos disputados. La punta está liderada por ${leader ? leader.teamName : 'equipos en competencia'} con ${leader ? leader.points : 0} unidades.`,
        championCandidate: leader ? `${leader.teamName} (por puntaje y rendimiento actual)` : 'A definir',
        tiebreakAnalysis:
          tiebreakTexts.length > 0
            ? tiebreakTexts
            : ['No se presentan empates en puntos en las posiciones clave del torneo.'],
        recessAdvice: '¡Los próximos partidos definirán quién se corona campeón del recreo!',
        generatedBy: 'algorithmic',
      });
    } finally {
      setLoadingAi(false);
    }
  };

  if (teams.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
          <Trophy className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No hay equipos registrados</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Inscribí a los equipos para comenzar a registrar resultados y calcular la tabla.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabecera de la tabla */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            Tabla de Posiciones
          </h2>
          <p className="text-[11px] text-slate-400">
            {playedMatchesCount === 0
              ? 'Todos los equipos comienzan con 0 puntos. ¡Cargá los partidos!'
              : `Recalculada automáticamente con ${playedMatchesCount} partido(s) jugados`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón de Análisis IA */}
          <button
            onClick={handleRequestAIAnalysis}
            disabled={loadingAi}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-lg shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>{loadingAi ? 'Analizando...' : 'Explicar con IA'}</span>
          </button>

          {/* Botón ver reglamento */}
          <button
            onClick={() => setShowRules(!showRules)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 border border-slate-700 cursor-pointer"
            title="Ver criterios de desempate oficiales"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            {showRules ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Panel Desplegable: Reglamento Oficial de Desempates */}
      {showRules && (
        <div className="bg-slate-900/90 border border-amber-500/30 p-3.5 rounded-xl text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold uppercase text-[11px]">
            <Shield className="w-3.5 h-3.5" />
            <span>Criterios Oficiales de Desempate (Fútbol Escolar)</span>
          </div>
          <ol className="list-decimal list-inside text-slate-300 space-y-1 pl-1 text-[11px]">
            <li>
              <strong>Puntos acumulados (PTS):</strong> Victoria = 3 pts, Empate = 1 pt, Derrota = 0 pts.
            </li>
            <li>
              <strong>Diferencia de Gol (DG):</strong> Goles a favor (GF) menos goles en contra (GC).
            </li>
            <li>
              <strong>Mayor cantidad de Goles a Favor (GF):</strong> Premia al equipo con mayor ataque.
            </li>
            <li>
              <strong>Enfrentamiento Directo:</strong> Si los equipos ya jugaron entre sí, clasifica arriba el ganador.
            </li>
            <li>
              <strong>Mayor cantidad de Partidos Ganados (PG).</strong>
            </li>
          </ol>
        </div>
      )}

      {/* Tarjeta de Análisis de IA (Criterio de aceptación explícito) */}
      {aiAnalysis && (
        <div className="bg-slate-900 border-2 border-amber-500/50 p-4 rounded-xl shadow-xl space-y-3 relative overflow-hidden animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Informe del Árbitro / IA del Recreo
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {aiAnalysis.generatedBy === 'gemini' ? 'Gemini 3.8 Flash' : 'Motor Reglamentario'}
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {aiAnalysis.summary}
          </p>

          {/* Candidato a Campeón */}
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 text-[11px] block">Candidato al título:</span>
              <span className="font-bold text-white">{aiAnalysis.championCandidate}</span>
            </div>
          </div>

          {/* Desglose de Desempates */}
          {aiAnalysis.tiebreakAnalysis.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300 block">
                ⚖️ Resolución de Criterios de Desempate:
              </span>
              <div className="space-y-1">
                {aiAnalysis.tiebreakAnalysis.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consejo del recreo */}
          {aiAnalysis.recessAdvice && (
            <div className="text-[11px] text-emerald-400 italic bg-emerald-950/20 p-2 rounded border border-emerald-500/20">
              📢 {aiAnalysis.recessAdvice}
            </div>
          )}
        </div>
      )}

      {/* Tabla de Posiciones Responsiva para Celular */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-black text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-2 text-center w-8">#</th>
                <th className="py-2.5 px-3 min-w-[140px]">Equipo</th>
                <th className="py-2.5 px-2 text-center font-black text-amber-400 bg-amber-500/10">
                  PTS
                </th>
                <th className="py-2.5 px-2 text-center">PJ</th>
                <th className="py-2.5 px-2 text-center">PG</th>
                <th className="py-2.5 px-2 text-center">PE</th>
                <th className="py-2.5 px-2 text-center">PP</th>
                <th className="py-2.5 px-2 text-center">GF</th>
                <th className="py-2.5 px-2 text-center">GC</th>
                <th className="py-2.5 px-2 text-center">DG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {standings.map((team, idx) => {
                const isLeader = idx === 0 && team.points > 0;
                const isPodium = idx < 3;

                return (
                  <tr
                    key={team.teamId}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      isLeader ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {/* Posición */}
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'text-slate-400'
                        }`}
                      >
                        {team.position}
                      </span>
                    </td>

                    {/* Nombre y color del equipo */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: team.teamColor }}
                        />
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1">
                            <span>{team.teamName}</span>
                            {isLeader && (
                              <span title="Líder del torneo" className="text-xs">
                                👑
                              </span>
                            )}
                          </div>
                          {team.tiebreakReason && (
                            <span className="text-[10px] text-amber-400/90 block leading-tight font-normal">
                              {team.tiebreakReason}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Puntos (destacado) */}
                    <td className="py-3 px-2 text-center font-black font-mono text-sm text-amber-400 bg-amber-500/10">
                      {team.points}
                    </td>

                    {/* Estadísticas */}
                    <td className="py-3 px-2 text-center text-slate-300">{team.played}</td>
                    <td className="py-3 px-2 text-center text-emerald-400 font-semibold">
                      {team.won}
                    </td>
                    <td className="py-3 px-2 text-center text-slate-400">{team.drawn}</td>
                    <td className="py-3 px-2 text-center text-red-400">{team.lost}</td>
                    <td className="py-3 px-2 text-center text-slate-300">{team.goalsFor}</td>
                    <td className="py-3 px-2 text-center text-slate-400">{team.goalsAgainst}</td>
                    <td
                      className={`py-3 px-2 text-center font-bold ${
                        team.goalDifference > 0
                          ? 'text-emerald-400'
                          : team.goalDifference < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Leyenda al pie de la tabla */}
        <div className="bg-slate-950/60 p-2.5 border-t border-slate-800 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span><strong>PTS:</strong> Puntos</span>
            <span><strong>PJ:</strong> Jugados</span>
            <span><strong>GF:</strong> Goles a favor</span>
            <span><strong>GC:</strong> Goles en contra</span>
            <span><strong>DG:</strong> Diferencia de gol</span>
          </div>

          {playedMatchesCount === 0 && (
            <button
              onClick={onNavigateToFixture}
              className="text-amber-400 hover:underline font-bold"
            >
              Cargar primeros resultados ➜
            </button>
          )}
        </div>
      </div>

      {/* Lista detallada de desempates matemáticos si existen empates */}
      {tiebreaks.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Desempates de Posición Resueltos ({tiebreaks.length})
          </h4>
          <div className="space-y-1.5">
            {tiebreaks.map((tb, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
              >
                <span className="text-amber-400 font-bold shrink-0">#{idx + 1}</span>
                <p className="text-[11px] leading-relaxed">{tb.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
