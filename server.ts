/**
 * @file server.ts
 * @description Servidor Express full-stack para Torneo Relámpago.
 * Expone la API de análisis inteligente con Gemini (gemini-3.8-flash)
 * y monta el middleware de Vite en desarrollo o estáticos en producción.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Inicialización de cliente Gemini con telemetría aistudio-build
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * POST /api/ai/analyze-standings
 * Analiza la tabla de posiciones y explica los desempates con lenguaje de relator de fútbol escolar.
 */
app.post('/api/ai/analyze-standings', async (req: Request, res: Response) => {
  try {
    const { standings, matches, teams } = req.body;

    if (!standings || !Array.isArray(standings) || standings.length === 0) {
      return res.status(400).json({ error: 'Se requiere la tabla de posiciones.' });
    }

    // Si no hay API key o no está disponible el cliente, devolvemos fallback determinístico
    if (!ai) {
      return res.json({
        summary: 'El torneo se encuentra en plena disputa en el patio escolar.',
        championCandidate: standings[0]?.teamName || 'A definir',
        tiebreakAnalysis: [
          'Criterios aplicados: 1° Puntos, 2° Diferencia de Gol, 3° Goles a Favor, 4° Enfrentamiento Directo.',
        ],
        recessAdvice: '¡Anoten todos los goles del recreo para mantener la tabla al día!',
        generatedBy: 'algorithmic',
      });
    }

    const prompt = `Eres el relator y árbitro oficial de "TORNEO RELÁMPAGO", el campeonato de fútbol de los recreos de una escuela.
Tu labor es explicar con entusiasmo, precisión y deportividad cómo quedó la tabla de posiciones y explicar los desempates según el reglamento.

REGLAMENTO OFICIAL DE DESEMPATE:
1. Puntos (3 por triunfo, 1 por empate, 0 por derrota).
2. Diferencia de Gol (DG = GF - GC).
3. Goles a Favor (GF).
4. Enfrentamiento Directo entre los equipos igualados.
5. Mayor cantidad de victorias.

DATOS ACTUALES DEL TORNEO:
Equipos registrados: ${JSON.stringify(teams?.map((t: any) => t.name) || [])}
Tabla de Posiciones:
${standings
  .map(
    (s: any, idx: number) =>
      `${idx + 1}° ${s.teamName}: ${s.points} pts | PJ:${s.played} PG:${s.won} PE:${s.drawn} PP:${s.lost} | GF:${s.goalsFor} GC:${s.goalsAgainst} DG:${s.goalDifference > 0 ? '+' : ''}${s.goalDifference}`
  )
  .join('\n')}

Partidos disputados:
${
  matches
    ?.filter((m: any) => m.isPlayed)
    .map(
      (m: any) =>
        `Fecha ${m.roundNumber}: ${m.homeTeamName || m.homeTeamId} ${m.homeScore} - ${m.awayScore} ${m.awayTeamName || m.awayTeamId}`
    )
    .join('\n') || 'Ninguno aún'
}

RESPONDE ÚNICAMENTE CON UN OBJETO JSON que tenga exactamente esta estructura:
{
  "summary": "Resumen entretenido en 2 o 3 oraciones de la situación del campeonato escolar.",
  "championCandidate": "Nombre del equipo con más chances y por qué.",
  "tiebreakAnalysis": [
    "Explicación detallada de cada empate en puntos (por qué tal equipo quedó arriba de cuál, citando DG, GF o resultado directo)"
  ],
  "recessAdvice": "Consejo motivador para los partidos del próximo recreo."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Respuesta vacía de Gemini');
    }

    const parsed = JSON.parse(text);
    return res.json({
      ...parsed,
      generatedBy: 'gemini',
    });
  } catch (error: any) {
    console.warn('Fallo al llamar a Gemini, respondiendo con fallback:', error.message);
    const { standings } = req.body;
    return res.json({
      summary: 'Tabla actualizada con las reglas oficiales del recreo escolar.',
      championCandidate: standings?.[0]?.teamName || 'Por definirse',
      tiebreakAnalysis: [
        'Los empates en puntos se resolvieron considerando: 1) Diferencia de gol, 2) Goles anotados, 3) Duelo directo.',
      ],
      recessAdvice: '¡Cada gol en el recreo cuenta para la diferencia de gol!',
      generatedBy: 'algorithmic',
    });
  }
});

/**
 * POST /api/ai/fixture-advice
 * Brinda sugerencias sobre el fixture del torneo.
 */
app.post('/api/ai/fixture-advice', async (req: Request, res: Response) => {
  try {
    const { teams, matches } = req.body;
    const teamCount = teams?.length || 0;
    const matchCount = matches?.length || 0;

    return res.json({
      advice: `Fixture generado con sistema Berger (todos contra todos) para ${teamCount} equipos (${matchCount} partidos). Cada equipo tiene garantizado alternancia de local/visitante y tiempos equitativos de descanso entre recreos.`,
      status: 'balanced',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al procesar sugerencia de fixture' });
  }
});

// Inicialización de servidor con Vite o estáticos
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚽ Torneo Relámpago corriendo en http://localhost:${PORT}`);
  });
}

startServer();
