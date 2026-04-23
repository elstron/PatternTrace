# Pattern Trace

Sitio web interactivo hecho con **Astro** para aprender patrones de diseño mediante **demos + diagramas animados + código**.

La idea del proyecto es que cada patrón tenga una página dedicada con:

- una explicación corta (qué resuelve y cuándo usarlo),
- una demo con controles (botones/toggles) y salida/logs,
- un diagrama en `<canvas>` que anima el “flujo” (llamadas/mensajes),
- y una sección de código resaltada.

Actualmente incluye páginas para patrones como **Adapter**, **Bridge**, **Factory Method** y **Observer**.

## Estructura del proyecto

- `src/pages/` — Rutas principales del sitio (home e índice de patrones).
- `src/layouts/BaseLayout.astro` — Layout base (estructura HTML y estilos globales).
- `src/components/` — Componentes compartidos (shell de demo, sección de código, etc.).
- `src/patterns/` — Implementación por patrón (página, meta, componentes y lógica JS/TS).
  - Cada patrón suele tener:
    - `*Page.astro` (página del patrón)
    - `*-logic.js` (lógica de la demo y animaciones de canvas)
    - `components/` (UI del patrón)
    - `meta.ts` (metadatos usados para construir listados/navegación)
- `public/vendor/` — Recursos estáticos de terceros (por ejemplo Prism “lite” para resaltado).

## Requisitos

- Node.js (versión moderna recomendada)
- pnpm (el repo declara `pnpm@10.28.2` en `package.json`)

## Cómo ejecutar

```zsh
pnpm install
pnpm dev
```

El script `dev` levanta Astro en el puerto `4321`.

## Build / preview

```zsh
pnpm build
pnpm preview
```

## Notas

- El resaltado de código usa archivos en `public/vendor/`.
- Las animaciones de cada patrón se orquestan en su `*-logic.js` correspondiente.
