-- Pilot account explicitly requested by project owner. Password is bcrypt-hashed.
INSERT INTO users(id,email,name,password_hash,role) VALUES ('22222222-2222-4222-8222-222222222222','admin@boiler.local','Admin','$2b$12$sXGz3q0i2sdUpJGGTWE5JeeGDp30rSLWcCNywnqfYYcMACntN6w.C','admin') ON CONFLICT(email) DO UPDATE SET name='Admin',password_hash=excluded.password_hash,role='admin';
CREATE TABLE IF NOT EXISTS attachments (id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES users(id), content_type text NOT NULL, data bytea NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
