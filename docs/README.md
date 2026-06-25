# Flujo de la aplicación — Relacionador de propiedades

Este documento describe el flujo completo de la aplicación: desde que el usuario escribe una relación y pulsa **Analizar** hasta que la UI muestra las propiedades calculadas.

## Resumen rápido
- **Entrada:** el usuario escribe una relación en la caja de texto de la página principal y pulsa el botón **Analizar**.
- **Parseo:** el texto se parsea en pares y conjunto base.
- **Análisis:** se calculan propiedades (reflexiva, simétrica, transitiva, etc.).
- **Salida:** la interfaz muestra los resultados en la sección de propiedades y muestra la relación parseada.

## Punto de entrada y enrutado
- La ejecución del cliente comienza en [src/main.jsx](src/main.jsx). Ahí se monta React en `#root` y se renderiza `<App />`.
- El ruteo está en [src/App.jsx](src/App.jsx). La ruta raíz (`/`) renderiza `HomePage` (archivo [src/pages/HomePage.jsx](src/pages/HomePage.jsx)).

## Componentes y flujo de datos (paso a paso)
1. Usuario escribe la relación en el input de la página principal y pulsa **Analizar**.
   - Componente: [src/components/RelationEditor.jsx](src/components/RelationEditor.jsx)
   - Comportamiento: `RelationEditor` mantiene el texto en un `useState` local y, al hacer submit del `form`, ejecuta la función `onAnalyze(text)` recibida por props.

2. `HomePage` recibe el texto y lo procesa en `handleAnalyze`.
   - Archivo: [src/pages/HomePage.jsx](src/pages/HomePage.jsx)
   - `handleAnalyze(text)`:
     - Limpia el estado de `error`.
     - Llama a `parseRelationText(text)` (ver siguiente paso).
     - Si `parseRelationText` devuelve `error`, actualiza los estados `analysis`, `pairs`, `baseSet` y `error` en consecuencia y sale.
     - Si el parseo es correcto, guarda `pairs` y `baseSet` en estados locales (`useState`) y llama a `analyzeRelation(pairs, baseSet)`.
     - Guarda el resultado de `analyzeRelation` en el estado `analysis`.

3. Parseo del texto de la relación
   - Archivo: [src/relations/relations.js](src/relations/relations.js)
   - `parseRelationText(text)`:
     - Normaliza el texto (quita llaves externas, trim).
     - Extrae pares con una expresión regular del tipo `(A,B)`.
     - Genera `pairs` como array de arrays: `[ ["A","B"], ["B","C"] ]`.
     - Crea `baseSet` como array con los elementos únicos que aparecen en los pares.
     - Si no hay pares válidos devuelve `{ error: '...' }`.

4. Análisis de propiedades
   - Archivo: [src/relations/relations.js](src/relations/relations.js)
   - `analyzeRelation(pairs, baseSet)` devuelve un objeto con las propiedades:
     - `reflexive`, `irreflexive`, `symmetric`, `asymmetric`, `antisymmetric`, `transitive`.
     - Cada propiedad es un objeto `{ holds, explanation, evidence }`:
       - `holds`: booleano que indica si la propiedad se cumple.
       - `explanation`: texto corto para mostrar en la UI.
       - `evidence`: detalles/contraejemplos (pares faltantes o pares que incumplen).

5. Renderizado de resultados
   - Componente que muestra las propiedades: [src/components/ResultsPanel.jsx](src/components/ResultsPanel.jsx)
     - Recibe `analysis` por props desde `HomePage`.
     - Si `analysis` es `null` no renderiza nada.
     - Para cada propiedad muestra un `PropertyRow` con un indicador visual (verde/rojo), `Sí`/`No` y la `explanation`.

6. Visualización de la relación parseada
   - Componente: [src/components/ParsedRelation.jsx](src/components/ParsedRelation.jsx)
   - Recibe `pairs` y `baseSet` por props y muestra ambos en texto formateado.

7. Otros elementos del flujo
   - Header y controles: [src/components/Header.jsx](src/components/Header.jsx)
     - Permite abrir guías/modales (`SyntaxGuideModal`, `PropertiesGuideModal`) y alternar tema.
   - Manejo de errores: `HomePage` muestra `error` cuando `parseRelationText` retorna un error legible.

## Forma de los datos
- `pairs`: array de pares donde cada par es `[a,b]` (strings).
- `baseSet`: array de strings (elementos únicos).
- `analysis`: objeto con claves por propiedad; cada clave -> `{ holds: boolean, explanation: string, evidence: any }`.

## Ejemplo de flujo (resumen)
1. Usuario escribe `{(A,B),(B,C),(C,C)}` y pulsa **Analizar**.
2. `RelationEditor` llama `onAnalyze('{(A,B),(B,C),(C,C)}')`.
3. `HomePage.handleAnalyze`:
   - `parseRelationText` → `{ pairs: [['A','B'],['B','C'],['C','C']], baseSet: ['A','B','C'] }`.
   - `analyzeRelation` → devuelve estructura con `reflexive`, `transitive`, etc.
   - `HomePage` guarda `analysis`, `pairs`, `baseSet` en su estado.
4. `ResultsPanel` y `ParsedRelation` reciben los props actualizados y re-renderizan mostrando resultados.

## Archivos clave (lista)
- [src/main.jsx](src/main.jsx)
- [src/App.jsx](src/App.jsx)
- [src/pages/HomePage.jsx](src/pages/HomePage.jsx)
- [src/components/RelationEditor.jsx](src/components/RelationEditor.jsx)
- [src/relations/relations.js](src/relations/relations.js)
- [src/components/ResultsPanel.jsx](src/components/ResultsPanel.jsx)
- [src/components/ParsedRelation.jsx](src/components/ParsedRelation.jsx)
- [src/components/Header.jsx](src/components/Header.jsx)

## Siguientes mejoras sugeridas
- Documentar más ejemplos de entrada en `docs/` y casos límite (espacios, símbolos, duplicados).
- Añadir tests unitarios para `parseRelationText` y cada propiedad en `relations.js`.
- Mostrar evidencia detallada en un modal al hacer click en la explicación.

---
Si querés, puedo generar un diagrama del flujo (Mermaid) para incluir aquí o añadir ejemplos y tests.
