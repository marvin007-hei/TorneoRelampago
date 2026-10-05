# 📸 Carpeta de Evidencias y Capturas - Torneo Relámpago

Esta carpeta reúne todas las capturas de pantalla reales y evidencias de cada etapa de desarrollo (**Prompt 1**, **Prompt 2** y **Prompt 3**) del proyecto **Torneo Relámpago**.

---

## 🏆 Prompt 1: Organizador de Torneos del Recreo (Fixture, Tabla y Desempates)
- **Funcionalidades:** Registro de equipos y jugadores, generación de fixture equilibrado todos contra todos (Sistema Berger) y tabla de posiciones en tiempo real con criterios oficiales de desempate e informe del árbitro con IA.
- **Capturas de evidencia:**
  - ![Evidencia Prompt 1](prompt_1.jpg)
  - ![Captura Prompt 1](./Captura%20de%20pantalla%202026-10-02%20085915.png)

---

## 💾 Prompt 2: Persistencia Local (`localStorage`), Reinicio de Liga, Penales y Respaldo JSON
- **Funcionalidades:**
  - Persistencia automática en `localStorage` (`torneo_relampago_teams_v1` y `torneo_relampago_matches_v1`) para que los datos nunca se pierdan al cerrar la app.
  - Exportación e importación de copias de seguridad en archivo `.json` descargable.
  - Botón de **Reiniciar Liga** (nueva temporada), modo **Revancha** (repetir partidos) y **Minijuego de Tanda de Penales**.
- **Capturas de evidencia:**
  - ![Captura Prompt 2](./Captura%20de%20pantalla%202026-10-02%20095951.png)
  - ![Captura Real de la App](./Captura%20de%20pantalla%202026-10-02%20101618.png)

---

## 📱 Prompt 3: Accesibilidad Móvil (320 px), Alto Contraste al Sol y Jerarquía Visual
- **Funcionalidades:**
  1. Diseño adaptable desde **320 px de ancho**, operable con una sola mano y sin hacer zoom (botones táctiles de mínimo `48px`).
  2. Alto contraste para lectura bajo el sol del patio escolar y **texto nunca menor a 16 px** (`text-base`).
  3. **Etiquetas visibles (`<label>`)** en todos los campos de entrada, sin depender solo del *placeholder*.
  4. **Un solo botón principal por pantalla** (en ámbar destacado) y los demás botones con estilo secundario.
  5. **Estados vacíos** claros con frases que invitan a la primera acción.
  6. **Mensajes de éxito y error visibles** en español claro y sin palabras técnicas.
- **Captura de evidencia:**
  - ![Captura Prompt 3](./Captura%20de%20pantalla%202026-10-02%20102457.png)

---

## 🔗 Índice de Documentación en el Repositorio
- [README Principal](../README.md)
- [README Nuevos Cambios Futboleros, Revancha y Penales](../README_NUEVOS_CAMBIOS.md)
- [README Persistencia y Respaldos JSON](../README_PERSISTENCIA_Y_RESPALDOS.md)
- [README Accesibilidad 320px y Diseño al Sol](../README_ACCESIBILIDAD_Y_DISENO.md)
