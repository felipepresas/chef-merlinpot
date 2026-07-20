# Despliegue — Chef en Dokploy

Servidor Dokploy: **`zimaserver` / `192.168.50.69` (`.69`)** · Docker Swarm ·
red overlay `dokploy-network` · UI: `http://192.168.50.69:3000` (o vía Cloudflare).
API: `http://192.168.50.69:3000/api` con header `x-api-key: $DOKPLOY_TOKEN`.

## Prerrequisitos (fuera del código)

1. **DNS** — `chef.merlinpot.com` apuntando al servidor (A record a la IP pública de `.69`,
   o túnel Cloudflare como `dokploy.merlinwolf.com`). Necesario para el certificado y el dominio.
2. **PostgreSQL** — una base para Chef (ver decisión más abajo).
3. **Firebase** — proyecto de Auth para Chef (claves cliente + service account admin).
4. **GitHub** — el GitHub App de Dokploy con acceso al repo `felipepresas/chef-merlinpot`.
5. **Token de API de Dokploy** — regenerar en Dokploy → perfil → API/Swagger (el guardado
   está caducado). Guardarlo en `.claude/settings.local.json` (env `DOKPLOY_TOKEN`).

## Configuración de la app en Dokploy

**Create → Application** (no Compose; Chef es una app única).

| Campo | Valor |
|-------|-------|
| Source | GitHub · `felipepresas/chef-merlinpot` · branch `main` |
| Build Type | **Dockerfile** |
| Docker Context Path | `.` |
| Dockerfile Path | `Dockerfile` |
| Puerto | `3000` |
| Health check | `GET /api/health` |
| Dominio | `chef.merlinpot.com` → contenedor `:3000`, HTTPS (Let's Encrypt) |

### Build args (se hornean en el bundle — pestaña Build)
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_APP_URL=https://chef.merlinpot.com
```

### Variables de entorno (runtime — pestaña Environment)
```
DATABASE_URL=postgresql://chef:...@<host-postgres>:5432/chef
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
NEXT_PUBLIC_APP_URL=https://chef.merlinpot.com
```
> Si el Postgres está en `dokploy-network`, `DATABASE_URL` usa el **DNS interno** del
> servicio (no `localhost`). Para migraciones sin pooler, `DIRECT_URL` a la conexión directa.

## Migraciones y seed (primer despliegue)

El esquema aún no tiene migraciones (`prisma/migrations` vacío). Con el Postgres ya disponible:

```bash
# 1) crear la migración inicial (local, contra la BD de Chef)
DATABASE_URL="postgresql://chef:...@HOST:5432/chef" npx prisma migrate dev --name init
git add prisma/migrations && git commit -m "Migración inicial" && git push

# 2) aplicar en prod + seed
DATABASE_URL="postgresql://chef:...@HOST:5432/chef" npx prisma migrate deploy
DATABASE_URL="postgresql://chef:...@HOST:5432/chef" npx prisma db seed
```

## Despliegue por API (cuando haya token válido)

```bash
# redeploy de la app
curl -sS -H "x-api-key: $DOKPLOY_TOKEN" -X POST \
  "$DOKPLOY_API_URL/application.redeploy" \
  -H "Content-Type: application/json" -d '{"applicationId":"<id>"}'
```

## Notas

- Imagen: Next.js **standalone** (`output: "standalone"`), runtime `node:20-alpine`,
  usuario no-root, `HEALTHCHECK` a `/api/health`.
- Prisma 7 con **driver adapter** (`@prisma/adapter-pg`): no necesita el engine nativo en
  Alpine, la conexión la lleva `pg`.
