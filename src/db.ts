import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

// Initialize schema with 3FN normalization
db.exec(`
  -- 1. Carreras
  CREATE TABLE IF NOT EXISTS carreras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
  );

  -- 2. Materias
  CREATE TABLE IF NOT EXISTS materias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
  );

  -- 3. Usuarios
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT CHECK(rol IN ('mentor', 'aprendiz', 'admin')) NOT NULL,
    carrera_id INTEGER,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id)
  );

  -- 4. Mentores_Materias (Relación N:M)
  CREATE TABLE IF NOT EXISTS mentores_materias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    materia_id INTEGER NOT NULL,
    experiencia TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, materia_id)
  );

  -- 5. Contacto
  CREATE TABLE IF NOT EXISTS contacto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    tipo TEXT CHECK(tipo IN ('whatsapp', 'email')) NOT NULL,
    valor TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  -- 6. Reportes
  CREATE TABLE IF NOT EXISTS reportes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_reportado_id INTEGER NOT NULL,
    usuario_denunciante_id INTEGER NOT NULL,
    motivo TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_reportado_id) REFERENCES usuarios(id),
    FOREIGN KEY (usuario_denunciante_id) REFERENCES usuarios(id)
  );

  -- SEED DATA
  INSERT OR IGNORE INTO carreras (nombre) VALUES 
  ('Ingeniería de Sistemas'), ('Ingeniería Industrial'), ('Derecho'), ('Administración de Empresas');

  INSERT OR IGNORE INTO materias (nombre) VALUES 
  ('Cálculo I'), ('Programación I'), ('Física I'), ('Derecho Civil'), ('Contabilidad');

  -- Admin Bootstrap (password: admin123)
  INSERT OR IGNORE INTO usuarios (nombre, email, password, rol, carrera_id, bio) 
  VALUES ('Admin Sistema', 'admin@universidad.edu', '$2a$10$6u.Y6RzX.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6', 'admin', 1, 'Administrador de la plataforma');
`);

export default db;

