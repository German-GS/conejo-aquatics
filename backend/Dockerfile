# ── Etapa 1: Build ──────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Etapa 2: Producción ─────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar build compilado
COPY --from=builder /app/dist ./dist

# Carpeta uploads (fotos de inventario) — en Cloud Run es almacenamiento
# efímero: se pierde en cada redeploy/reinicio/escalado. Sirve para
# arrancar, pero para que las fotos persistan de verdad hay que migrar
# este storage a Google Cloud Storage más adelante.
RUN mkdir -p uploads/inventario

EXPOSE 3001

CMD ["node", "dist/main"]
