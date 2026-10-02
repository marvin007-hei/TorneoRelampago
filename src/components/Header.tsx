/**
 * @file src/components/Header.tsx
 * @description Encabezado accesible para 320px, alto contraste al sol y texto >= 16px.
 */

import React, { useRef } from 'react';
import { RefreshCw, Download, Upload, Image as ImageIcon } from 'lucide-react';

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
    e.target.value = '';
  };

  return (
    <header className="bg-black/95 text-white border-b-2 border-emerald-500 sticky top-0 z-40 shadow-2xl">
      <div className="max-w-4xl mx-auto px-3 py-3 space-y-2.5">
        {/* Fila Principal: Logo y Título en texto de alto contraste */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg sm:text-xl tracking-tight text-white">
                  TORNEO RELÁMPAGO
                </h1>
                <span className="text-base font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                  Recreo
                </span>
              </div>
              <p className="text-base font-bold text-emerald-200 hidden sm:block">
                Fútbol escolar sin papeles perdidos
              </p>
            </div>
          </div>

          {/* Botón de Captura / Evidencia */}
          <button
            onClick={onOpenEvidence}
            className="min-h-[48px] px-3.5 py-2 rounded-xl bg-slate-900 border-2 border-amber-400/80 text-amber-300 font-bold text-base flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Ver imagen original y carpeta de Prompt 1"
          >
            <ImageIcon className="w-5 h-5 text-amber-300" />
            <span className="hidden xs:inline">Prompt 1</span>
          </button>
        </div>

        {/* Barra de Utilidades: Acciones secundarias para no competir con el botón principal */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-emerald-800/80 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-white">
              {teamsCount} equipos • {matchesCount} partidos
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Exportar JSON */}
            <button
              onClick={onExportBackup}
              className="min-h-[48px] px-3 py-2 rounded-xl bg-emerald-950 border-2 border-emerald-500 text-emerald-100 hover:text-white font-bold text-base flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Descargar copia de seguridad en archivo JSON"
            >
              <Download className="w-5 h-5 text-emerald-300" />
              <span className="hidden sm:inline">Respaldar</span>
            </button>

            {/* Restaurar JSON */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[48px] px-3 py-2 rounded-xl bg-emerald-950 border-2 border-emerald-500 text-emerald-100 hover:text-white font-bold text-base flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Restaurar datos desde archivo JSON"
            >
              <Upload className="w-5 h-5 text-emerald-300" />
              <span className="hidden sm:inline">Restaurar</span>
            </button>

            {/* Reiniciar Liga */}
            <button
              onClick={onReset}
              className="min-h-[48px] px-3 py-2 rounded-xl bg-red-950/80 border-2 border-red-600 text-red-200 hover:text-white font-black text-base flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Reiniciar toda la liga escolar"
            >
              <RefreshCw className="w-5 h-5 text-red-300" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
