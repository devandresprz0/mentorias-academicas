import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./src/db";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Mentors: List with advanced filters
  app.get("/api/mentores", (req, res) => {
    const { materia, carrera, q } = req.query;
    let query = `
      SELECT 
        u.id, u.nombre, u.bio, c.nombre as carrera_nombre,
        GROUP_CONCAT(m.nombre) as materias,
        ct.tipo as contacto_tipo, ct.valor as contacto_valor
      FROM usuarios u
      JOIN carreras c ON u.carrera_id = c.id
      JOIN mentores_materias mm ON u.id = mm.usuario_id
      JOIN materias m ON mm.materia_id = m.id
      LEFT JOIN contacto ct ON u.id = ct.usuario_id
      WHERE u.rol = 'mentor'
    `;
    const params: any[] = [];
    
    if (materia) {
      query += " AND m.nombre LIKE ?";
      params.push(`%${materia}%`);
    }
    if (carrera) {
      query += " AND c.nombre LIKE ?";
      params.push(`%${carrera}%`);
    }
    if (q) {
      query += " AND (u.nombre LIKE ? OR u.bio LIKE ?)";
      params.push(`%${q}%`, `%${q}%`);
    }
    
    query += " GROUP BY u.id";
    
    const mentores = db.prepare(query).all(...params);
    res.json(mentores);
  });

  // Mentor: Get single mentor details
  app.get("/api/mentores/:id", (req, res) => {
    const { id } = req.params;
    const mentor: any = db.prepare(`
      SELECT u.id, u.nombre, u.bio, u.email, c.nombre as carrera_nombre
      FROM usuarios u
      JOIN carreras c ON u.carrera_id = c.id
      WHERE u.id = ? AND u.rol = 'mentor'
    `).get(id);

    if (!mentor) return res.status(404).json({ error: "Mentor no encontrado" });

    const materias = db.prepare(`
      SELECT m.nombre, mm.experiencia
      FROM mentores_materias mm
      JOIN materias m ON mm.materia_id = m.id
      WHERE mm.usuario_id = ?
    `).all(id);

    const contactos = db.prepare(`
      SELECT tipo, valor FROM contacto WHERE usuario_id = ?
    `).all(id);

    res.json({ ...mentor, materias, contactos });
  });

  // Catalogs
  app.get("/api/catalogos", (req, res) => {
    const materias = db.prepare("SELECT * FROM materias").all();
    const carreras = db.prepare("SELECT * FROM carreras").all();
    res.json({ materias, carreras });
  });

  // Auth: Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { nombre, email, password, rol, carrera_id } = req.body;
      
      if (!email.endsWith("@universidad.edu")) {
        return res.status(400).json({ error: "Solo correos institucionales @universidad.edu" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO usuarios (nombre, email, password, rol, carrera_id) VALUES (?, ?, ?, ?, ?)");
      const info = stmt.run(nombre, email, hashedPassword, rol, carrera_id);
      
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: "El correo ya está registrado o datos inválidos" });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { correo, password } = req.body;
      const user: any = db.prepare("SELECT * FROM usuarios WHERE email = ?").get(correo);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }
      
      const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: "1d" });
      res.json({ token, user: { id: user.id, nombre: user.nombre, rol: user.rol } });
    } catch (error) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  // Profile: Get current user data
  app.get("/api/perfil", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });
    
    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      const user: any = db.prepare(`
        SELECT u.id, u.nombre, u.email, u.bio, u.rol, u.carrera_id, c.nombre as carrera_nombre
        FROM usuarios u
        LEFT JOIN carreras c ON u.carrera_id = c.id
        WHERE u.id = ?
      `).get(decoded.id);

      if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

      const materias = db.prepare(`
        SELECT mm.materia_id, m.nombre, mm.experiencia
        FROM mentores_materias mm
        JOIN materias m ON mm.materia_id = m.id
        WHERE mm.usuario_id = ?
      `).all(decoded.id);

      const contactos = db.prepare(`
        SELECT id, tipo, valor FROM contacto WHERE usuario_id = ?
      `).all(decoded.id);

      res.json({ ...user, materias, contactos });
    } catch (error) {
      res.status(401).json({ error: "Token inválido" });
    }
  });

  // Profile: Update
  app.post("/api/perfil/actualizar", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });
    
    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const { bio, carrera_id } = req.body;
      
      db.prepare("UPDATE usuarios SET bio = ?, carrera_id = ? WHERE id = ?").run(bio, carrera_id, decoded.id);
      res.json({ success: true });
    } catch (error) {
      res.status(401).json({ error: "Token inválido" });
    }
  });

  // Profile: Add Mentorship
  app.post("/api/perfil/mentoria", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });
    
    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const { materia_id, experiencia } = req.body;
      
      db.prepare("INSERT OR REPLACE INTO mentores_materias (usuario_id, materia_id, experiencia) VALUES (?, ?, ?)")
        .run(decoded.id, materia_id, experiencia);
      
      res.status(201).json({ success: true });
    } catch (error) {
      res.status(401).json({ error: "Token inválido" });
    }
  });

  // Profile: Add Contact
  app.post("/api/perfil/contacto", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });
    
    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const { tipo, valor } = req.body;
      
      db.prepare("INSERT OR REPLACE INTO contacto (usuario_id, tipo, valor) VALUES (?, ?, ?)")
        .run(decoded.id, tipo, valor);
      
      res.status(201).json({ success: true });
    } catch (error) {
      res.status(401).json({ error: "Token inválido" });
    }
  });

  // Profile: Delete Mentorship
  app.delete("/api/perfil/mentoria/:materiaId", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });
    
    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const { materiaId } = req.params;
      
      db.prepare("DELETE FROM mentores_materias WHERE usuario_id = ? AND materia_id = ?")
        .run(decoded.id, materiaId);
      
      res.json({ success: true });
    } catch (error) {
      res.status(401).json({ error: "Token inválido" });
    }
  });

  // Profile: Delete Contact
  app.delete("/api/perfil/contacto/:id", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });
    
    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const { id } = req.params;
      
      db.prepare("DELETE FROM contacto WHERE id = ? AND usuario_id = ?")
        .run(id, decoded.id);
      
      res.json({ success: true });
    } catch (error) {
      res.status(401).json({ error: "Token inválido" });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
