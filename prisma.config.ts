import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prisma 7: la configuración de conexión vive aquí, no en schema.prisma.
// DATABASE_URL → consultas de la app (pooled en producción).
// Para migraciones sin pooler en producción, apuntar DATABASE_URL a la conexión directa
// al ejecutar `prisma migrate` (o usar DIRECT_URL vía script). Ver docs/ARCHITECTURE.md.
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrations: {
    // Prisma 7: el comando de seed se declara aquí (ya no en package.json).
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
