/**
 * @file src/components/StandingsTable.tsx
 * @description Tabla de posiciones en tiempo real con diseño adaptable para 320px, alto contraste y texto >= 16px.
 */

import React, { useState } from 'react';
import { Standing, TiebreakDetail, Team, Match, AIStandingsAnalysis } from '../types/tournament';
import { Trophy, Sparkles, HelpCircle, Shield, AlertTriangle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

interface StandingsTableProps {
  standings: Standing[];
  tiebreaks: TiebreakDetail[];
  teams: Team[];
  matches: Match[];
  onNavigateToFixture: () => void;
  onNavigateToTeams?: () => void;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  tiebreaks,
  teams,
  matches,
  onNavigateToFixture,
  onNavigateToTeams,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIStandingsAnalysis | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const playedMatchesCount = matches.filter((m) => m.isPlayed).length;

  const handleRequestAIAnalysis = async () => {
    setLoadingAi(true);
    try {
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

      if (!res.ok) throw new Error('Servicio de análisis no disponible');
      const data: AIStandingsAnalysis = await res.json();
      setAiAnalysis(data);
    } catch {
      const leader = standings[0];
      const tiebreakTexts = tiebreaks.map((t) => t.description);
      setAiAnalysis({
        summary: `El torneo del recreo tiene ${playedMatchesCount} partidos jugados. La punta está liderada por ${leader ? leader.teamName : 'los equipos en competencia'} con ${leader ? leader.points : 0} puntos.`,
        championCandidate: leader ? `${leader.teamName} (por puntos y goles)` : 'A definir',
        tiebreakAnalysis:
          tiebreakTexts.length > 0
            ? tiebreakTexts
            : ['No se presentan empates en puntos en las primeras posiciones.'],
        recessAdvice: '¡Los siguientes partidos definirán al campeón escolar!',
        generatedBy: 'algorithmic',
      });
    } finally {
      setLoadingAi(false);
    }
  };

  // 5. Estado Vacío: Cuando todavía no hay ningún dato
  if (teams.length === 0) {
    return (
      <div className="bg-gradient-to-b from-emerald-950 to-black border-2 border-emerald-500 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center text-3xl">
          🏆
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white">
            ¡La tabla de posiciones está esperando a los equipos!
          </h3>
          <p className="text-base font-bold text-emerald-100 max-w-md mx-auto leading-relaxed">
            Inscribe los equipos o cursos en la primera pestaña para comenzar a registrar los goles y calcular las posiciones automáticamente.
          </p>
        </div>

        {/* 4. Único Botón Principal */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (onNavigateToTeams) {
                onNavigateToTeams();
              } else {
                const teamsTabBtn = document.querySelector('button[data-tab="teams"]') as HTMLElement;
                if (teamsTabBtn) teamsTabBtn.click();
              }
            }}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <span>⚽ Inscribir Equipos Ahora</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-full">
      {/* Encabezado de la tabla */}
      <div className="bg-black/90 p-4 rounded-2xl border-2 border-emerald-600/80 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>Tabla de Posiciones Oficial</span>
            </h2>
            <p className="text-base font-bold text-emerald-200">
              {playedMatchesCount} partidos jugados • Desempate oficial escolar
            </p>
          </div>

          {/* Acciones Secundarias (Botón secundario de IA y reglas) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRequestAIAnalysis}
              disabled={loadingAi}
              className="flex-1 sm:flex-none min-h-[48px] px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 border-2 border-emerald-500 text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>{loadingAi ? 'Analizando...' : 'Explicar con IA'}</span>
            </button>

            <button
              onClick={() => setShowRules(!showRules)}
              className="min-h-[48px] px-3.5 py-2.5 bg-emerald-950 border-2 border-emerald-600 text-emerald-200 hover:text-white font-bold text-base rounded-xl cursor-pointer"
              title="Ver reglas de desempate"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3. Selector de vista accesible con etiqueta visible */}
        <div className="flex items-center justify-between pt-2 border-t border-emerald-800">
          <span className="text-base font-black text-white">
            Modo de visualización:
          </span>
          <div className="flex items-center gap-1 bg-emerald-950 p-1 rounded-xl border border-emerald-700">
            <button
              onClick={() => setViewMode('cards')}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-base font-black cursor-pointer transition-all ${
                viewMode === 'cards'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Tarjetas Móvil
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-base font-black cursor-pointer transition-all ${
                viewMode === 'table'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              Tabla Completa
            </button>
          </div>
        </div>
      </div>

      {/* Reglas de Desempate desplegables */}
      {showRules && (
        <div className="bg-black/95 border-2 border-emerald-500 p-5 rounded-2xl shadow-xl space-y-2 text-base text-white">
          <h4 className="font-black text-amber-400 text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Criterios de Desempate Oficiales:
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 font-bold text-emerald-100 pl-1">
            <li><strong>Puntos (PTS):</strong> 3 por victoria, 1 por empate, 0 por derrota.</li>
            <li><strong>Diferencia de Gol (DG):</strong> Goles a favor menos goles en contra.</li>
            <li><strong>Mayor cantidad de Goles a Favor (GF).</strong></li>
            <li><strong>Partido directo:</strong> Resultado entre los equipos empatados.</li>
            <li><strong>Mayor cantidad de Partidos Ganados (PG).</strong></li>
          </ol>
        </div>
      )}

      {/* Informe de IA si fue solicitado */}
      {aiAnalysis && (
        <div className="bg-black/95 border-2 border-amber-400 p-5 rounded-2xl shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
            <span className="text-base font-black uppercase text-amber-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Informe del Árbitro Escolar (IA)
            </span>
            <span className="text-base font-bold text-emerald-300">
              {aiAnalysis.generatedBy === 'gemini' ? 'Gemini 3.8 Flash' : 'Motor Reglamentario'}
            </span>
          </div>

          <p className="text-base font-bold text-white leading-relaxed">
            {aiAnalysis.summary}
          </p>

          <div className="bg-emerald-950/80 p-3.5 rounded-xl border border-emerald-600 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400 shrink-0" />
            <div>
              <span className="text-base font-bold text-emerald-300 block">Candidato al título:</span>
              <span className="text-lg font-black text-white">{aiAnalysis.championCandidate}</span>
            </div>
          </div>

          {aiAnalysis.tiebreakAnalysis.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-base font-black text-amber-300 block">
                ⚖️ Resolución de Desempates:
              </span>
              {aiAnalysis.tiebreakAnalysis.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700 text-base font-bold text-emerald-100">
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 1 y 2. VISTA DE TARJETAS MÓVILES: Perfecta para 320px de ancho y lectura bajo el sol con texto >= 16px */}
      {viewMode === 'cards' && (
        <div className="space-y-3.5">
          {standings.map((team, idx) => {
            const isLeader = idx === 0 && team.points > 0;
            return (
              <div
                key={team.teamId}
                className={`bg-black/95 border-2 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 ${
                  isLeader ? 'border-amber-400 bg-amber-950/20' : 'border-emerald-700/80'
                }`}
              >
                {/* Cabecera de la tarjeta: Posición, Nombre y Puntos */}
                <div className="flex items-center justify-between gap-2 border-b border-emerald-800 pb-2.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-black text-base ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-white'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-emerald-950 text-white border border-emerald-600'
                      }`}
                    >
                      {team.position}°
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white"
                          style={{ backgroundColor: team.teamColor }}
                        />
                        <h3 className="font-black text-lg text-white">
                          {team.teamName}
                        </h3>
                        {isLeader && <span>👑</span>}
                      </div>
                      {team.tiebreakReason && (
                        <p className="text-base font-bold text-amber-300">
                          {team.tiebreakReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Puntos destacados */}
                  <div className="text-right">
                    <span className="block text-2xl font-black text-amber-400 font-mono">
                      {team.points}
                    </span>
                    <span className="text-base font-bold text-emerald-300">
                      PUNTOS
                    </span>
                  </div>
                </div>

                {/* Estadísticas en cuadrícula con texto >= 16px */}
                <div className="grid grid-cols-4 gap-2 text-center pt-1">
                  <div className="bg-emerald-950/70 p-2 rounded-xl border border-emerald-800">
                    <span className="text-base font-bold text-emerald-300 block">PJ</span>
                    <strong className="text-base font-black text-white">{team.played}</strong>
                  </div>
                  <div className="bg-emerald-950/70 p-2 rounded-xl border border-emerald-800">
                    <span className="text-base font-bold text-emerald-300 block">PG</span>
                    <strong className="text-base font-black text-emerald-400">{team.won}</strong>
                  </div>
                  <div className="bg-emerald-950/70 p-2 rounded-xl border border-emerald-800">
                    <span className="text-base font-bold text-emerald-300 block">PE</span>
                    <strong className="text-base font-black text-slate-300">{team.drawn}</strong>
                  </div>
                  <div className="bg-emerald-950/70 p-2 rounded-xl border border-emerald-800">
                    <span className="text-base font-bold text-emerald-300 block">PP</span>
                    <strong className="text-base font-black text-red-400">{team.lost}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-emerald-950/50 p-2 rounded-xl border border-emerald-800/80">
                    <span className="text-base font-bold text-emerald-300 block">GF (Favor)</span>
                    <strong className="text-base font-black text-white">{team.goalsFor}</strong>
                  </div>
                  <div className="bg-emerald-950/50 p-2 rounded-xl border border-emerald-800/80">
                    <span className="text-base font-bold text-emerald-300 block">GC (Contra)</span>
                    <strong className="text-base font-black text-white">{team.goalsAgainst}</strong>
                  </div>
                  <div className="bg-emerald-950/50 p-2 rounded-xl border border-emerald-800/80">
                    <span className="text-base font-bold text-emerald-300 block">DG (Dif.)</span>
                    <strong
                      className={`text-base font-black ${
                        team.goalDifference > 0
                          ? 'text-emerald-400'
                          : team.goalDifference < 0
                          ? 'text-red-400'
                          : 'text-white'
                      }`}
                    >
                      {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VISTA DE TABLA COMPLETA CON DESPLAZAMIENTO TÁCTIL */}
      {viewMode === 'table' && (
        <div className="bg-black/95 border-2 border-emerald-600/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-base text-white border-collapse min-w-[560px]">
              <thead className="bg-emerald-950 text-emerald-200 border-b-2 border-emerald-700">
                <tr>
                  <th className="py-3 px-3 text-center font-black">POS</th>
                  <th className="py-3 px-4 text-left font-black">EQUIPO</th>
                  <th className="py-3 px-3 text-center font-black text-amber-300">PTS</th>
                  <th className="py-3 px-3 text-center font-black">PJ</th>
                  <th className="py-3 px-3 text-center font-black">PG</th>
                  <th className="py-3 px-3 text-center font-black">PE</th>
                  <th className="py-3 px-3 text-center font-black">PP</th>
                  <th className="py-3 px-3 text-center font-black">GF</th>
                  <th className="py-3 px-3 text-center font-black">GC</th>
                  <th className="py-3 px-3 text-center font-black">DG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-800/80 font-bold">
                {standings.map((team, idx) => (
                  <tr key={team.teamId} className="hover:bg-emerald-950/40">
                    <td className="py-3.5 px-3 text-center font-black">{team.position}°</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: team.teamColor }} />
                        <span className="font-black text-white">{team.teamName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-black font-mono text-xl text-amber-300 bg-emerald-950/80">
                      {team.points}
                    </td>
                    <td className="py-3.5 px-3 text-center">{team.played}</td>
                    <td className="py-3.5 px-3 text-center text-emerald-400">{team.won}</td>
                    <td className="py-3.5 px-3 text-center text-slate-300">{team.drawn}</td>
                    <td className="py-3.5 px-3 text-center text-red-400">{team.lost}</td>
                    <td className="py-3.5 px-3 text-center">{team.goalsFor}</td>
                    <td className="py-3.5 px-3 text-center">{team.goalsAgainst}</td>
                    <td className="py-3.5 px-3 text-center font-black">
                      {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Único Botón Principal de la Pantalla de Tabla */}
      <div className="pt-2">
        <button
          onClick={onNavigateToFixture}
          className="w-full min-h-[52px] py-4 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base rounded-2xl shadow-2xl flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <Calendar className="w-5 h-5 text-slate-950" />
          <span>📅 Ir al Calendario de Partidos</span>
        </button>
      </div>
    </div>
  );
};
