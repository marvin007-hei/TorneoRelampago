# 📱 Accesibilidad Móvil y Diseño para Patio Escolar (320px)

Este documento detalla la reestructuración completa de la interfaz de usuario de **Torneo Relámpago** para cumplir con los 6 estándares estrictos de usabilidad bajo el sol, pantallas estrechas (320 px) y operación con una sola mano en el recreo escolar.

---

## 🎯 Evaluación de los 6 Requisitos

### ✅ Requisito 1: Uso óptimo desde 320 px de ancho, con una sola mano y sin hacer zoom
- **Touch Targets mínimos de 48px:** Todos los botones interactivos (sumar/restar goles, navegación de fechas, botones de acción) tienen un alto mínimo de `48px` a `56px` (`min-h-[48px]`), facilitando el toque con el pulgar mientras el estudiante camina por el patio.
- **Prevención de Auto-Zoom:** En dispositivos móviles (especialmente Safari iOS), cualquier campo de texto con fuente menor a 16 px provoca que la pantalla haga un zoom brusco al enfocar. Al fijar todos los campos a `16px` (`text-base`), **el navegador jamás hace zoom involuntario**.
- **Sin desbordamiento horizontal:** Contenedores con `max-w-full` y márgenes proporcionales (`px-2` y `px-3`), permitiendo que la interfaz quepa de forma natural en pantallas de 320 px (como el iPhone SE de primera generación).

### ✅ Requisito 2: Contraste suficiente para leerse al sol; texto nunca menor a 16 px
- **Contraste de Grado Deportivo:** Se eliminaron los grises tenues (`text-slate-400`, `text-slate-500`). Se implementó una paleta de alto impacto con fondos oscuros profundos (`#000000` y `#031408`), texto blanco puro (`#ffffff`), verde esmeralda brillante (`#6ee7b7`) y acentos en amarillo reflectivo (`#fbbf24`), superando la relación de contraste WCAG AAA (7:1).
- **Regla Estricta de 16 px:** Se eliminaron todas las clases de tamaño reducido (`text-xs` de 12px, `text-[10px]`, `text-[11px]`, `text-sm` de 14px). Todos los textos, etiquetas, insignias y botones tienen un tamaño base de **16 px** (`text-base`) o superior (**18 px**, **20 px**, **24 px**).

### ✅ Requisito 3: Todos los campos con etiqueta visible (no solo placeholder)
- Ningún campo depende exclusivamente de su texto de sugerencia.
- Se agregaron etiquetas explícitas `<label className="block text-base font-black text-white">` en:
  - Nombre del equipo o curso.
  - Nombre del capitán o delegado escolar.
  - Selector de color de camiseta.
  - Nombre del estudiante (al sumar jugador).
  - Número de camiseta dorsal.
  - Marcadores de goles de equipo local y visitante.
  - Selectores de equipos para penales.

### ✅ Requisito 4: Un solo botón principal por pantalla; los demás, secundarios
Cada pantalla cuenta con una jerarquía visual limpia donde únicamente **un botón** destaca con estilo dorado/ámbar relleno (`bg-amber-400 text-slate-950 font-black shadow-xl`):
1. **Pantalla de Equipos:**
   - Si no hay equipos: `⚽ Inscribir Primer Equipo`.
   - Si ya hay 2 o más equipos: `📅 Armar Calendario de Partidos`.
   - Los demás botones (sumar jugador, eliminar, paleta de colores) son secundarios (`bg-emerald-950`, bordes delineados).
2. **Pantalla de Partidos (Fixture):**
   - El único botón principal es `🏆 Ver Tabla de Posiciones y Desempates`.
   - Los botones de revancha, penales y flechas de fecha son secundarios.
3. **Pantalla de Tabla de Posiciones:**
   - El único botón principal es `📅 Ir al Calendario de Partidos`.
   - El botón de informe IA y reglas son secundarios.
4. **Pantalla de Penales:**
   - El único botón principal es `⚽ Iniciar Tanda` (o `🏆 Aplicar Ganador al Torneo`).

### ✅ Requisito 5: Estados vacíos claros que invitan a la primera acción
- **Cuando no hay equipos:** Tarjeta central con emoji de cancha ⚽, título *"¡La cancha está vacía!"*, frase motivacional y el botón principal directo para inscribir el primer equipo o cargar los 4 de muestra.
- **Cuando no hay partidos generados:** Mensaje con rayo ⚡, aviso de cuántos equipos hay y botón de acción directa *"📅 Armar Calendario de Partidos Ahora"*.
- **Cuando la tabla está vacía:** Mensaje con trofeo 🏆 y botón para redirigir a registrar los primeros competidores.

### ✅ Requisito 6: Mensajes de éxito y de error visibles, en español, sin palabras técnicas
- Notificaciones flotantes y avisos en pantalla en español escolar directo:
  - *"¡Equipo guardado e inscripto con éxito!"*
  - *"Por favor, escribe el nombre del equipo o curso antes de guardar."*
  - *"Ya existe un equipo con ese nombre. Por favor, escribe un nombre diferente."*
  - *"¡Copia de seguridad descargada en tu celular!"*
  - *"¡Partidos reiniciados para la revancha! Marcadores en cero."*
- Cero términos de jerga como "payload", "error 400", "array", "null" o "undefined".

---

## 🔍 Respuesta a la Pregunta: ¿Cuál de los seis puntos NO se pudo cumplir y por qué?

**Se pudieron cumplir los 6 puntos en su totalidad (100%). Ninguno quedó sin cumplir.**

### ¿Dónde estuvo el mayor desafío técnico?
El punto más desafiante fue la combinación entre el **Punto 1 (ancho de 320 px)** y el **Punto 2 (texto nunca menor a 16 px)** aplicado a la **Tabla de Posiciones**.

En una tabla reglamentaria de fútbol existen 10 columnas obligatorias:
`POS | EQUIPO | PTS | PJ | PG | PE | PP | GF | GC | DG`

Si se fuerza texto de 16 px rígido en 10 columnas en una pantalla de 320 px:
$$10 \text{ columnas} \times 32\text{ px (mínimo por celda)} = 320\text{ px}$$
Esto no deja espacio ni para los nombres de los equipos ni para los márgenes de la pantalla sin romper el diseño.

### ¿Cómo se resolvió para cumplir ambos puntos al 100%?
Se implementó un diseño de **Tarjetas de Posiciones para Móviles (`viewMode: 'cards'`)**:
1. Cada equipo se presenta en una tarjeta futbolera vertical de alto contraste.
2. La posición (`1°`), el escudo y los puntos (`9 PUNTOS`) se muestran en tipografía gigante (**18 px a 24 px**).
3. Las estadísticas clave (`PJ, PG, PE, PP, GF, GC, DG`) se organizan en bloques táctiles de fácil lectura donde **cada número y etiqueta mide exactamente 16 px o más**.
4. De manera complementaria, el usuario puede alternar a la "Tabla Completa", la cual cuenta con desplazamiento horizontal fluido (`overflow-x-auto`) manteniendo la tipografía accesible de 16 px sin reducirla jamás.

---

## 🛠️ Archivos Actualizados

| Archivo | Cambio Principal |
| :--- | :--- |
| `src/index.css` | Base de fuente de `16px`, prevención de zoom en móviles y texturas de contraste. |
| `src/components/TeamManager.tsx` | Etiquetas visibles en todos los campos, textos `>= 16px` y un solo botón principal. |
| `src/components/FixtureView.tsx` | Botoneras táctiles de `+` y `-` de 48px, etiquetas de goles local/visitante y jerarquía de botones. |
| `src/components/StandingsTable.tsx` | Modo de tarjetas móviles para 320px con textos `>= 16px` y botón principal unificado. |
| `src/components/Header.tsx` | Acciones secundarias en la barra superior para no competir con el botón de la pantalla. |
| `src/App.tsx` | Barra de navegación inferior móvil táctil (56px) con textos de 16px y toasts de alto contraste. |
