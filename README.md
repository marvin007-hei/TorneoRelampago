# ⚡ TORNEO RELÁMPAGO - Organizador de Torneos del Recreo

> **Solución definitiva para el recreo escolar:** Los torneos armados en hojas de papel se pierden, se manchan o generan discusiones interminables sobre los puntos y desempates. **Torneo Relámpago** digitaliza el campeonato directamente desde el celular del organizador estudiantil.

---

## 🎯 Las 3 Funciones Principales

1. **Registrar Equipos y Jugadores:**
   - Alta rápida de cursos o equipos con nombre, capitán, distintivo de color y nómina de jugadores con dorsales.
   - Edición y baja en tiempo real con almacenamiento persistente local.
2. **Generar el Calendario de Partidos (Fixture Equilibrado):**
   - Algoritmo de rotación **Round-Robin (Sistema Berger)** que garantiza que todos jueguen contra todos a una rueda.
   - Balance automático de localía y distribución equitativa de turnos para los recreos de la escuela (Mañana, Almuerzo, Tarde).
   - Manejo matemático de fechas libres en caso de cantidad impar de equipos.
   - Marcador interactivo táctil (`+` y `-`) pensado para usar con una mano en el patio.
3. **Tabla de Posiciones en Tiempo Real con Criterios de Desempate:**
   - Se recalcula al instante tras registrar cada gol o finalizar un partido.
   - Aplica el reglamento oficial de fútbol escolar:
     1. Puntos acumulados (3 por victoria, 1 por empate, 0 por derrota).
     2. Diferencia de Gol ($DG = GF - GC$).
     3. Mayor cantidad de Goles a Favor ($GF$).
     4. Enfrentamiento Directo (*Head-to-Head* entre los empatados).
     5. Mayor cantidad de Partidos Ganados ($PG$).
   - **Explicación con IA (Gemini 3.8 Flash):** Botón *"Explicar con IA"* que genera un informe narrativo detallando cómo se resolvió cada desempate y quién tiene las mejores chances de salir campeón.

---

## 📱 Experiencia Mobile-First
- Diseñado pensando en la pantalla de un celular en el patio del colegio.
- Botones de gol grandes para evitar errores al tocar la pantalla.
- Navegación inferior accesible con el pulgar.
- Persistencia inmediata en `localStorage` (no se pierden los datos si se recarga la página o se cierra el navegador).

---

## 🛠️ Tecnologías Utilizadas
- **Frontend:** React 19 + TypeScript + Vite 8
- **Estilos:** Tailwind CSS 4
- **Íconos:** Lucide React
- **Backend / API:** Express + `@google/genai` (Modelo `gemini-3.8-flash`)
- **Arquitectura:** Full-Stack integrado con Vite middlewares en desarrollo y bundle estático en producción.

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js 18+ instalado.
- (Opcional) Clave `GEMINI_API_KEY` en el archivo `.env` para la explicación extendida con IA (el sistema cuenta con fallback algorítmico si no se dispone de API key).

### Pasos
```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd torneo-relampago

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional)
cp .env.example .env

# 4. Iniciar en modo desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

---

## ⚠️ Puntos Críticos y Prevención de Errores (Documentación del Código)

1. **Partidos pendientes vs Empate 0-0:**
   - En `src/utils/standingsCalculator.ts`, un partido no jugado tiene `isPlayed: false` y marcadores `null`. Solo los partidos con `isPlayed: true` suman para la tabla. Un 0 a 0 jugado suma 1 punto a cada equipo; un partido no jugado no suma puntos ni partidos jugados.
2. **Rotación Berger con equipos impares:**
   - En `src/utils/fixtureGenerator.ts`, cuando la cantidad de equipos es impar, se añade un equipo comodín (`__FECHA_LIBRE__`). El primer equipo de la lista permanece estático como pivote mientras los demás rotan en sentido horario.
3. **Inmutabilidad de datos en React:**
   - Los métodos de ordenamiento y cálculo nunca mutan los arrays originales; siempre generan copias superficiales mediante spread operator (`[...teams]`, `[...matches]`) para garantizar la reactividad en React.
4. **Resiliencia ante fallos de conexión:**
   - Si la llamada a la IA de Gemini falla o no tiene credenciales, el sistema activa de forma transparente el motor de desempates algorítmico local, asegurando **cero errores en la consola**.

---

## 🆕 Nuevas Actualizaciones y Documentación Complementaria

Para ver los detalles específicos de las últimas funciones añadidas, consulta los nuevos documentos:

1. 📖 **[README_NUEVOS_CAMBIOS.md](./README_NUEVOS_CAMBIOS.md):**
   - **Botón Reiniciar Liga:** Comienza una temporada escolar desde cero con trazabilidad en el servidor.
   - **Botón Repetir Partidos (Modo Revancha):** Reinicia los marcadores sin borrar los equipos.
   - **Minijuego de Penales Interactivos:** Tanda de 3 a 5 penales con arco, arquero animado y coronación del campeón.
   - **Nueva Interfaz Cancha de Fútbol:** Textura de césped, líneas de cal y marcadores de estadio digital.

2. 💾 **[README_PERSISTENCIA_Y_RESPALDOS.md](./README_PERSISTENCIA_Y_RESPALDOS.md):**
   - Explicación de almacenamiento local con `localStorage`.
   - Guía paso a paso para **Exportar Respaldos JSON** y **Restaurar** torneos entre diferentes celulares o computadoras.
   - Qué ocurre si el usuario borra caché o cambia de dispositivo.
   - Código fuente completo de guardar, leer, borrar y exportar.

