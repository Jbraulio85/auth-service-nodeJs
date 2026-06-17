# Auth Node - Servicio de Autenticacion (Node.js)

API RESTful de autenticacion construida con Node.js, Express y PostgreSQL.

## Rol en la arquitectura

Servicio de autenticacion del **stack movil/usuario**:

- Consumido por **client-user** (login, registro, refresh)
- Validado por **server-user** (JWT)
- Paralelo a **auth-service** (.NET), que atiende el stack admin

Ambos servicios comparten PostgreSQL y emiten JWT con configuracion compatible.

## Descripcion

Registro, login, gestion de perfiles, verificacion de email, recuperacion de contrasenas y administracion de roles. Usa JWT stateless y Argon2 para hashing.

## Tech Stack

- **Node.js** 18+ (ESM), **Express** 5.x
- **PostgreSQL** + **Sequelize** 6.x
- **JWT**, **Argon2**, **Cloudinary**, **Nodemailer**
- **Helmet**, **CORS**, **Rate Limiting**

## Instalacion

```bash
git clone https://github.com/6toInformatica/auth-node.git
cd auth-node
pnpm install
cp .env.example .env
pnpm dev
```

## Variables de Entorno

Ver `.env.example`. Valores clave:

```env
NODE_ENV=development
PORT=3000                    # local; Docker Compose usa 3007
DATABASE_URL=postgresql://IN6AV:change-me-postgres-password@localhost:5435/kinal_sports
JWT_SECRET=change-me-jwt-secret-min-256-bits
JWT_ISSUER=AuthService
JWT_AUDIENCE=AuthService
FRONTEND_URL=http://localhost:5173
```

Ver `.env.example` para SMTP, Cloudinary y demas variables. Con Postgres del stack Docker desde el host, usa puerto **5435**.

## Estructura

```
auth-node/
├── configs/
├── helpers/
├── middlewares/
├── src/
│   ├── auth/          # auth.routes.js, auth.controller.js
│   └── users/         # user.routes.js (roles admin)
└── index.js
```

## Scripts

```bash
pnpm dev            # Desarrollo con nodemon
pnpm start          # Produccion
pnpm lint           # ESLint
pnpm lint:fix       # ESLint con auto-fix
pnpm format         # Prettier (escribir)
pnpm format:check   # Prettier (verificar)
pnpm commit         # Commit interactivo (Commitizen)
```

Los hooks de Husky ejecutan lint-staged en cada commit.

## Endpoints

**Prefijo:** `/api/v1`  
**Puerto Docker:** `3007`  
**Health:** `GET /api/v1/health`

### Autenticacion (`/api/v1/auth`)

| Metodo | Endpoint                       | Descripcion                       | Auth |
| ------ | ------------------------------ | --------------------------------- | ---- |
| POST   | `/auth/refresh`                | Renovar access token              | No   |
| POST   | `/auth/logout`                 | Cerrar sesion (invalidar refresh) | No   |
| POST   | `/auth/register`               | Registrar usuario (multipart)     | No   |
| POST   | `/auth/login`                  | Iniciar sesion                    | No   |
| POST   | `/auth/verify-email`           | Verificar email                   | No   |
| POST   | `/auth/resend-verification`    | Reenviar verificacion             | No   |
| POST   | `/auth/forgot-password`        | Solicitar reset                   | No   |
| POST   | `/auth/reset-password`         | Resetear contrasena               | No   |
| GET    | `/auth/profile`                | Perfil del usuario autenticado    | JWT  |
| POST   | `/auth/profile/picture`        | Actualizar foto (multipart)       | JWT  |
| POST   | `/auth/profile/picture/avatar` | Alias de avatar (multipart)       | JWT  |
| POST   | `/auth/profile/by-id`          | Perfil por userId                 | No   |
| POST   | `/auth/profile/by-username`    | Perfil por username               | No   |

### Usuarios / roles (`/api/v1/users`)

| Metodo | Endpoint                   | Descripcion      | Auth  |
| ------ | -------------------------- | ---------------- | ----- |
| PUT    | `/users/:userId/role`      | Actualizar rol   | Admin |
| GET    | `/users/:userId/roles`     | Roles de usuario | Admin |
| GET    | `/users/by-role/:roleName` | Usuarios por rol | Admin |

## Ejemplos

**Registro:**

```bash
curl -X POST http://localhost:3007/api/v1/auth/register \
  -F "username=johndoe" \
  -F "email=john@example.com" \
  -F "password=SecurePass123!" \
  -F "name=John" \
  -F "surname=Doe" \
  -F "phone=12345678"
```

**Login:**

```bash
curl -X POST http://localhost:3007/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"john@example.com","password":"SecurePass123!"}'
```

**Perfil:**

```bash
curl http://localhost:3007/api/v1/auth/profile \
  -H "Authorization: Bearer <token>"
```

## Roles

- **USER** (default al registrarse)
- **ADMIN_ROLE** (administrador)
- Otros roles segun seeds en PostgreSQL

## Dependencias

| Consumidor  | Uso                                        |
| ----------- | ------------------------------------------ |
| client-user | Login, registro, refresh                   |
| server-user | Validacion JWT y enriquecimiento de perfil |

## Docker

Stack completo desde [kinalsports-stack](https://github.com/6toInformatica/kinalsports-stack). En contenedor escucha en puerto **3007**; la base Postgres es el servicio `postgres` del compose (host **5435**).

## Autor y licencia

**Braulio Echeverría** — Fundación Kinal, Guatemala (2026)

Proyecto educativo desarrollado en el marco del plan de estudio **PESNUM** de la carrera de **Perito en Computación**, bajo supervisión del Catedrático (PEM).

Licencia **MIT** con fines educativos — texto completo en [LICENSE](LICENSE).
