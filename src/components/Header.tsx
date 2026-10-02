/**
 * @file src/components/Header.tsx
 * @description Encabezado principal de Torneo Relámpago con diseño móvil y acciones rápidas.
 */

import React from 'react';
import { Trophy, RefreshCw, Sparkles, PlusCircle } from 'lucide-react';

interface HeaderProps {
  teamsCount: number;
  matchesCount: number;
  onLoadSample: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  teamsCount,
  matchesCount,
  onLoadSample,
  onReset,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo y Título */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                  TORNEO RELÁMPAGO
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Recreo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Organizador estudiantil de fútbol escolar sin papeles perdidos
              </p>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="flex items-center gap-2">
            {teamsCount === 0 ? (
              <button
                onClick={onLoadSample}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                title="Cargar 4 equipos y resultados de ejemplo para probar"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cargar Ejemplo</span>
              </button>
            ) : (
              <button
                onClick={onReset}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-700 text-xs transition-colors active:scale-95 cursor-pointer"
                title="Reiniciar torneo y limpiar datos"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden xs:inline">Reiniciar</span>
              </button>
            )}
          </div>
        </div>

        {/* Resumen rápido de estado */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            <strong>{teamsCount}</strong> equipos
          </span>
          <span>•</span>
          <span>
            <strong>{matchesCount}</strong> partidos programados
          </span>
          <span className="ml-auto text-amber-400/90 font-medium">
            ¡Guardado automático en este celular!
          </span>
        </div>
      </div>
    </header>
  );
};
