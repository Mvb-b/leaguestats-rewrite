# GameStats

Aplicación Next.js 14 para visualización de estadísticas de League of Legends.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma + PostgreSQL

## Requisitos

- Node.js 18+
- PostgreSQL

## Variables de entorno

Crear archivo `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gamestats"
```

## Comandos útiles

```bash
# Desarrollo local
npm run dev

# Build
npm run build

# Prisma
npx prisma generate    # Generar cliente Prisma
npx prisma db push     # Sincronizar schema con DB
npx prisma studio      # Abrir Prisma Studio

# Lint
npm run lint
```

## Estructura

```
app/
  (routes)/       # Rutas agrupadas
  api/            # API routes
  layout.tsx      # Root layout
components/
  ui/             # Componentes shadcn/ui
lib/
  prisma.ts       # Cliente Prisma
  utils.ts        # Utilidades (cn)
prisma/
  schema.prisma   # Schema de base de datos
types/            # Tipos TypeScript
```

## Estado

🚧 En desarrollo inicial
