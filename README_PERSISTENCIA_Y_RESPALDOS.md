# 💾 Persistencia de Datos y Respaldos JSON - Torneo Relámpago

Este documento explica cómo funciona el almacenamiento persistente y el sistema de copias de seguridad de **Torneo Relámpago** para garantizar que los datos nunca se pierdan al cerrar la aplicación o cambiar de celular.

---

## 🔒 1. ¿Cómo se asegura que no se pierdan los datos?

La aplicación implementa una estrategia de **doble persistencia**:

1. **Persistencia Local Automática (`localStorage`):**
   * Cada vez que se inscribe un equipo, se anota un gol o se juega un partido, el cambio se guarda inmediatamente en el almacenamiento local del dispositivo.
   * **Claves utilizadas:**
     * `torneo_relampago_teams_v1`: Nómina de equipos, capitanes, colores y jugadores.
     * `torneo_relampago_matches_v1`: Calendario de partidos, marcadores y estado `isPlayed`.
   * **Comportamiento:** Si cierras la pestaña, apagas el teléfono o reinicias el navegador, al volver a entrar la información estará intacta.

2. **Copia de Seguridad en Archivo JSON (Botón `Respaldar JSON`):**
   * Permite descargar un archivo `.json` con la foto completa del torneo a la memoria del dispositivo o computadora.
   * **Utilidad:** Protegerse si el usuario borra la memoria del navegador o si desea compartir el torneo con otro organizador escolar.

---

## 📲 2. ¿Qué ocurre ante eventos del navegador?

| Situación | ¿Se pierden los datos? | Explicación |
| :--- | :---: | :--- |
| **Cerrar la pestaña o navegador** | ❌ **NO** | `localStorage` guarda la información de manera indefinida en disco. |
| **Apagar o reiniciar el celular** | ❌ **NO** | La memoria local persiste entre reinicios del sistema operativo. |
| **Borrar caché web habitual** | ❌ **NO** | El caché de imágenes/scripts no afecta el almacenamiento local. |
| **Borrar cookies y datos de sitios web** | ⚠️ **SÍ** | Limpiar el almacenamiento del navegador borra `localStorage`. Se recupera con el archivo de respaldo JSON. |
| **Abrir en otro teléfono o PC** | ⚠️ **NO se sincronizan solos** | Cada navegador tiene su propio `localStorage` privado. Para transferirlo, usa **Respaldar JSON** y luego **Restaurar**. |

---

## 📥 3. Cómo Exportar e Importar Respaldos

### A. Para Exportar (Descargar respaldo)
1. En la barra superior, haz clic en el botón verde **`📥 Respaldar JSON`**.
2. Tu navegador descargará automáticamente un archivo con el formato:
   `torneo_relampago_respaldo_AAAA-MM-DD.json`.
3. Guárdalo o compártelo por WhatsApp, Drive o correo electrónico.

### B. Para Restaurar (Cargar respaldo en otro dispositivo)
1. En el nuevo dispositivo, haz clic en el botón **`Restaurar`** de la barra superior.
2. Selecciona el archivo `.json` descargado previamente.
3. ¡Listo! La aplicación cargará automáticamente todos los equipos, goles y posiciones.

---

## 💻 4. Código Fuente de Almacenamiento

El módulo responsable se encuentra en `src/utils/storage.ts`:

```typescript
// Guardar equipos
export function saveStoredTeams(teams: Team[]): void {
  localStorage.setItem('torneo_relampago_teams_v1', JSON.stringify(teams));
}

// Leer equipos
export function loadStoredTeams(): Team[] {
  const raw = localStorage.getItem('torneo_relampago_teams_v1');
  return raw ? JSON.parse(raw) : [];
}

// Descargar archivo JSON al dispositivo
export function downloadTournamentBackup(): void {
  const backup = {
    app: 'Torneo Relámpago',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    teams: loadStoredTeams(),
    matches: loadStoredMatches(),
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `torneo_relampago_respaldo_${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
```

---

## 📦 5. Ejemplo de Datos de Prueba

Si deseas probar la restauración, puedes guardar este bloque como un archivo `mi_torneo.json` e importarlo:

```json
{
  "app": "Torneo Relámpago",
  "version": "1.0",
  "exportedAt": "2026-10-02T12:00:00.000Z",
  "teams": [
    {
      "id": "team-5a",
      "name": "5to A - Los Rayos",
      "shortName": "5TO A",
      "color": "#3B82F6",
      "captainName": "Mateo González",
      "players": [
        { "id": "p1", "name": "Mateo González", "dorsal": 10 },
        { "id": "p2", "name": "Lucas Díaz", "dorsal": 7 }
      ]
    },
    {
      "id": "team-6b",
      "name": "6to B - La Máquina",
      "shortName": "6TO B",
      "color": "#EF4444",
      "captainName": "Santiago Rossi",
      "players": [
        { "id": "p3", "name": "Santiago Rossi", "dorsal": 8 },
        { "id": "p4", "name": "Facundo Pérez", "dorsal": 11 }
      ]
    }
  ],
  "matches": [
    {
      "id": "match-demo",
      "roundNumber": 1,
      "homeTeamId": "team-5a",
      "awayTeamId": "team-6b",
      "homeScore": 2,
      "awayScore": 1,
      "isPlayed": true
    }
  ]
}
```
