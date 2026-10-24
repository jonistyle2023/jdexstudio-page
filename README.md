# JdexStudio

Sitio web de la agencia JdexStudio, construido con **Astro 6**, CSS y JavaScript. Genera páginas estáticas e incluye servicios, equipo, partners, modo claro/oscuro y animaciones adaptadas a movimiento reducido.

## Desarrollo

Requiere **Node.js 22.12 o posterior** y npm.

```sh
npm ci
npm run dev
```

Disponible en `http://127.0.0.1:5173`.

## Comandos

| Comando | Función |
| --- | --- |
| `npm run build` | Genera el sitio estático en `dist/`. |
| `npm run preview` | Sirve la compilación localmente. |
| `npm run check:source` | Revisa imports, configuración y recursos de origen. |
| `npm run check` | Verifica la compilación; ejecutar después de build. |
| `npm run test:theme` | Comprueba las preferencias y persistencia del tema. |

## Estructura

- `src/pages/`: página principal, privacidad, robots y sitemap.
- `src/components/` y `src/layouts/`: secciones y estructura compartida.
- `src/styles.css` y `src/main.js`: estilos e interacciones.
- `src/data/team.js`: información del equipo.
- `assets/`: recursos originales; `public/assets/`: recursos publicados directamente.
- `scripts/`: comprobaciones del proyecto.

## Configuración

Copia `.env.example` a `.env` y define `PUBLIC_SITE_URL` con la URL HTTPS definitiva; admite subrutas. Sin esta variable, el sitio bloquea la indexación.

Las consultas de **40 minutos** y el correo siguen pendientes de activación. Configura el enlace público de Google Calendar y el correo en `src/site-config.js` cuando corresponda.

Los archivos de `assets/team/` aún son placeholders. Sustitúyelos por retratos reales para que reemplacen automáticamente las iniciales al compilar.

## Publicación

Publica el contenido de `dist/` en un alojamiento estático. El sitio no requiere backend ni base de datos. Conserva `package-lock.json`, `.env.example` y las licencias de los assets en el repositorio.
