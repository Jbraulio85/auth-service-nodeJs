-- Ejecutar una vez en Supabase: SQL Editor > New query > Run
-- Crea el schema de auth-node en PostgreSQL
--
-- Nota: el usuario admin NO va en este SQL (la contraseña debe hashearse con Argon2).
-- Se crea automaticamente al primer arranque si no hay usuarios (helpers/admin-seed.js):
--   username: admin
--   email:    admin@ksports.local
--   password: Admin1234!
-- Cambia la contraseña despues del primer login en produccion.

CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(16) PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(16) PRIMARY KEY,
  name VARCHAR(25) NOT NULL,
  surname VARCHAR(25) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_emails (
  id VARCHAR(16) PRIMARY KEY,
  user_id VARCHAR(16) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verification_token VARCHAR(256),
  email_verification_token_expiry TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_password_resets (
  id VARCHAR(16) PRIMARY KEY,
  user_id VARCHAR(16) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  password_reset_token VARCHAR(256),
  password_reset_token_expiry TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(16) PRIMARY KEY,
  user_id VARCHAR(16) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  profile_picture VARCHAR(512) NOT NULL DEFAULT '',
  phone VARCHAR(8) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
  id VARCHAR(16) PRIMARY KEY,
  user_id VARCHAR(16) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id VARCHAR(16) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  user_id VARCHAR(16) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS ix_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user_id ON refresh_tokens(user_id);
