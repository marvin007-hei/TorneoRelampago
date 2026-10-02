/**
 * @file src/components/Header.tsx
 * @description Encabezado principal de Torneo Relámpago con diseño móvil y acciones rápidas.
 */

import React, { useRef } from 'react';
import { Trophy, RefreshCw, Sparkles, Image as ImageIcon, Download, Upload } from 'lucide-react';

interface HeaderProps {
  teamsCount: number;
  matchesCount: number;
  onLoadSample: () => void;
  onReset: () => void;
  onOpenEvidence: () => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  teamsCount,
  matchesCount,
  onLoadSample,
  onReset,
  onOpenEvidence,
  onExportBackup,
  onImportBackup,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportBackup(content);
      }
    };
    reader.readAsText(file);
    // Reset para permitir seleccionar el mismo archivo de nuevo
    e.target.value = '';
  };
  return (
    <header className="bg-gradient-to-r from-emerald-950 via-[#062411] to-emerald-950 text-white border-b-2 border-emerald-700/80 sticky top-0 z-40 shadow-xl">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo y Título */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 text-slate-950 font-black text-xl">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                  TORNEO RELÁMPAGO
                </h1>
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 border border-emerald-400">
                  Cancha N° 1
                </span>
              </div>
              <p className="text-[11px] text-emerald-300 font-medium hidden sm:block">
                Organizador estudiantil de fútbol escolar sin papeles perdidos
              </p>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenEvidence}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors active:scale-95 cursor-pointer"
              title="Ver imagen y carpeta de Prompt 1"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Prompt 1</span>
            </button>

            {teamsCount === 0 && (
              <button
                onClick={onLoadSample}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                title="Cargar 4 equipos y resultados de ejemplo para probar"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cargar Ejemplo</span>
              </button>
            )}

            {/* Botón Exportar Respaldo JSON */}
            <button
              onClick={onExportBackup}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-600/70 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Descargar copia de seguridad en archivo JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Respaldar JSON</span>
            </button>

            {/* Input oculto para restaurar respaldo JSON */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Restaurar torneo desde archivo JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Restaurar</span>
            </button>

            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-200 hover:text-white border border-red-700/80 text-xs font-black transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Reiniciar toda la liga escolar para una nueva temporada"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reiniciar Liga</span>
            </button>
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
