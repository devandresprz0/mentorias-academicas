import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('database.sqlite');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_completo TEXT NOT NULL,
    correo TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    carrera TEXT,
    biografia TEXT,
    rol TEXT DEFAULT 'estudiante',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS materias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    area TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS mentoria_materias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mentor_id INTEGER NOT NULL,
    materia_id INTEGER NOT NULL,
    metodo_contacto TEXT NOT NULL, -- 'whatsapp' or 'email'
    valor_contacto TEXT NOT NULL,
    FOREIGN KEY (mentor_id) REFERENCES usuarios(id),
    FOREIGN KEY (materia_id) REFERENCES materias(id)
  );

  -- Seed some initial subjects if empty
  INSERT OR IGNORE INTO materias (nombre, area) VALUES 
  ('Cálculo Diferencial', 'Matemáticas'),
  ('Programación Orientada a Objetos', 'Ingeniería'),
  ('Física Mecánica', 'Ciencias Básicas'),
  ('Estructuras de Datos', 'Ingeniería'),
  ('Química General', 'Ciencias Básicas');

  -- Bootstrap admin if not exists (password: admin123)
  INSERT OR IGNORE INTO usuarios (nombre_completo, correo, password, rol, carrera) 
  VALUES ('Administrador', 'admin@universidad.edu', '$2a$10$6u.Y6RzX.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6', 'admin', 'Administración');

  -- Seed Test Users (password: admin123)
  INSERT OR IGNORE INTO usuarios (nombre_completo, correo, password, rol, carrera, biografia) VALUES 
  ('Ana García', 'ana.mentor@universidad.edu', '$2a$10$6u.Y6RzX.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6', 'estudiante', 'Ingeniería de Sistemas', 'Apasionada por el desarrollo web y las matemáticas. He ganado concursos de programación.'),
  ('Carlos Ruiz', 'carlos.mentor@universidad.edu', '$2a$10$6u.Y6RzX.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6', 'estudiante', 'Ingeniería Industrial', 'Experto en optimización de procesos y física mecánica. Me gusta enseñar con ejemplos prácticos.'),
  ('Elena Torres', 'elena.estudiante@universidad.edu', '$2a$10$6u.Y6RzX.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6.6', 'estudiante', 'Derecho', 'Buscando apoyo en materias básicas de ciencias.');

  -- Seed Mentorships
  INSERT OR IGNORE INTO mentoria_materias (mentor_id, materia_id, metodo_contacto, valor_contacto) VALUES 
  (2, 1, 'whatsapp', 'https://wa.me/573001234567'), -- Ana -> Cálculo
  (2, 2, 'email', 'ana.mentor@universidad.edu'),      -- Ana -> Programación
  (3, 3, 'whatsapp', 'https://wa.me/573119876543'), -- Carlos -> Física
  (3, 5, 'email', 'carlos.mentor@universidad.edu');    -- Carlos -> Química
`);

export default db;
