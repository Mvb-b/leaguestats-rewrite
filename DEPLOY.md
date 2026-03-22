# GameStats - Deploy en Coolify

## Pre-requisitos

1. Acceso a Coolify en `https://manager.misrravb.com`
2. Token de API de Coolify (ya configurado)
3. Repo en GitHub (para deploy automático)

## Paso 1: Crear Database PostgreSQL (en Coolify UI)

1. Ir a Coolify → Resources → New → Database
2. Seleccionar **PostgreSQL**
3. Configurar:
   - Name: `gamestats-db`
   - Database Name: `gamestats`
   - Username: `postgres`
   - Password: (generar fuerte)
   - Port: `5432`
4. Guardar

## Paso 2: Crear Aplicación (en Coolify UI)

1. Ir a Coolify → Resources → New → Application
2. Seleccionar fuente GitHub
3. Buscar repo: (aún no está en GitHub - ver Paso 3)
4. Configurar:
   - Name: `gamestats`
   - Build Pack: `Dockerfile`
   - Dockerfile: `./Dockerfile`
   - Port: `3000`
   - Domain: `gamestats.misrravb.com`

## Paso 3: Subir a GitHub (manualemente)

```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "feat: ready for Coolify deploy"
git remote add origin https://github.com/Mvb-b/gamestats-rewrite.git
git push -u origin main
```

## Paso 4: Configurar Variables de Entorno

En Coolify UI → Application → Environment:

```
DATABASE_URL=postgresql://postgres:TU_PASSWORD@gamestats-db:5432/gamestats?schema=public
RIOT_API_KEY=(obtener de developer.riotgames.com)
NEXTAUTH_SECRET=(generar con: openssl rand -base64 32)
NEXTAUTH_URL=https://gamestats.misrravb.com
```

## Paso 5: Deploy y Migrations

En Coolify UI:
1. Click "Deploy"
2. Esperar build exitoso
3. Abrir terminal del contenedor
4. Ejecutar migraciones:
```bash
npx prisma migrate deploy
```

## Paso 6: Verificar

- Health check: `https://gamestats.misrravb.com/api/health`
- Home: `https://gamestats.misrravb.com`

## Estructura de Archivos en Repo

```
gamestats-rewrite/
├── Dockerfile
├── docker-compose.coolify.yml
├── prisma/
│   └── schema.prisma
├── src/
├── package.json
└── DEPLOY.md (este archivo)
```

## Troubleshooting

### Error al conectar a la DB
Verificar que DATABASE_URL esté correcta y que el servicio de DB esté en la misma network.

### Build falla
Verificar que `package-lock.json` esté en el repo y no en `.dockerignore`.

### NextAuth no funciona
Verificar que NEXTAUTH_URL coincida con el dominio configurado y tenga `https://`.
