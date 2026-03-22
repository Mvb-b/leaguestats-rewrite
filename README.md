# GameStats

Aplicación de estadísticas para ligas deportivas.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL + Prisma

## Setup Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env basado en .env.example

# Correr migraciones de Prisma
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de PostgreSQL | `postgresql://user:pass@localhost:5432/gamestats` |
| `NEXTAUTH_SECRET` | Secret para NextAuth | `random-string-32-chars` |
| `NEXTAUTH_URL` | URL de la app | `http://localhost:3000` |

## Comandos Útiles

```bash
# Build de producción
npm run build

# Comprobar build
npm run build 2>&1 | tail -20

# Linting
npm run lint

# Migraciones Prisma
npx prisma migrate dev --name migration_name
npx prisma generate
npx prisma studio

# Chequear status git
git status
```

## Estructura de Carpetas

```
app/
  (routes)/        # Rutas agrupadas con layout compartido
  api/             # API routes
  globals.css      # Estilos globales
  layout.tsx       # Layout raíz
  page.tsx         # Home page
components/ui/     # Componentes shadcn
lib/
  prisma.ts        # Cliente Prisma singleton
  utils.ts         # Utilidades (cn helper)
prisma/
  schema.prisma    # Esquema de base de datos
public/            # Archivos estáticos
types/             # Tipos TypeScript globales
```

## Estado del Proyecto

- [x] Next.js + TypeScript inicializado
- [x] Tailwind CSS configurado
- [x] shadcn/ui configurado
- [x] Componentes base instalados
- [ ] Modelos de datos Prisma (pendiente)
- [ ] API endpoints (pendiente)
- [ ] Frontend pages (pendiente)
