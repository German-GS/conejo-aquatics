# Sistema Conejo Aquatics

Sistema para un negocio de acuarios: punto de venta (POS), inventario, informes, facturación electrónica (Costa Rica, esquema v4.4) y tienda en línea.

Desarrollado por **German Garcia Siles**.

## Piezas

- `backend/` — API en NestJS (TypeScript) con TypeORM y PostgreSQL: catálogo, inventario, clientes, facturación, contabilidad, usuarios y acceso.
- `admin/` — panel de administración en React + Vite + Tailwind CSS.
- `web/` — tienda en línea pública en Next.js.
- `docker-compose.yml` — PostgreSQL para desarrollo local.

## Desarrollo local

```bash
# 1. Variables de entorno: copiar los .env.example a .env y completar los valores
cp .env.example .env
cp backend/.env.example backend/.env

# 2. Base de datos
docker compose up -d

# 3. Backend
cd backend && npm install && npm run start:dev

# 4. Panel de administración y tienda (cada una en su terminal)
cd admin && npm install && npm run dev
cd web && npm install && npm run dev
```

## Notas

Las claves, variables de entorno, fotos subidas y documentos internos de diseño del negocio no forman parte de este repositorio.
