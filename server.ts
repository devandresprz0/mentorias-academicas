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

  // Admin: Get all users
  app.get("/api/admin/usuarios", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });
    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded.rol !== 'admin') return res.status(403).json({ error: "Prohibido" });
      
      const users = db.prepare("SELECT id, nombre_completo, correo, rol, carrera FROM usuarios").all();
      res.json(users);
    } catch (error) {
      res.status(401).json({ error: "Token inválido" });
    }
  });

  // Admin: Delete user
  app.delete("/api/admin/usuarios/:id", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });
    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded.rol !== 'admin') return res.status(403).json({ error: "Prohibido" });
      
      db.prepare("DELETE FROM usuarios WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(401).json({ error: "Token inválido" });
    }
  });

  // Auth: Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const schema = z.object({
        nombre: z.string().min(3),
        correo: z.string().email().refine(e => e.endsWith("@universidad.edu"), "Solo correos @universidad.edu"),
        password: z.string().min(6),
        carrera: z.string()
      });
      const data = schema.parse(req.body);
      
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const stmt = db.prepare("INSERT INTO usuarios (nombre_completo, correo, password, carrera) VALUES (?, ?, ?, ?)");
      const info = stmt.run(data.nombre, data.correo, hashedPassword, data.carrera);
      
      res.status(201).json({ id: info.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Error al registrar usuario" });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { correo, password } = req.body;
      const user: any = db.prepare("SELECT * FROM usuarios WHERE correo = ?").get(correo);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }
      
      const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: "1d" });
      res.json({ token, user: { id: user.id, nombre: user.nombre_completo, rol: user.rol } });
    } catch (error) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  // Mentors: List with filters
  app.get("/api/mentores", (req, res) => {
    const { materia, carrera } = req.query;
    let query = `
      SELECT u.id, u.nombre_completo, u.carrera, u.biografia, m.nombre as materia_nombre, mm.metodo_contacto, mm.valor_contacto
      FROM usuarios u
      JOIN mentoria_materias mm ON u.id = mm.mentor_id
      JOIN materias m ON mm.materia_id = m.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (materia) {
      query += " AND m.nombre LIKE ?";
      params.push(`%${materia}%`);
    }
    if (carrera) {
      query += " AND u.carrera LIKE ?";
      params.push(`%${carrera}%`);
    }
    
    const mentores = db.prepare(query).all(...params);
    res.json(mentores);
  });

  // Subjects: List
  app.get("/api/materias", (req, res) => {
    const materias = db.prepare("SELECT * FROM materias").all();
    res.json(materias);
  });

  // Profile: Add Mentorship
  app.post("/api/perfil/mentoria", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No autorizado" });
    
    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      const { materia_id, metodo, valor } = req.body;
      
      // Basic WhatsApp validation if needed
      if (metodo === 'whatsapp' && !valor.startsWith('https://wa.me/')) {
        return res.status(400).json({ error: "Enlace de WhatsApp inválido. Debe empezar con https://wa.me/" });
      }

      const stmt = db.prepare("INSERT INTO mentoria_materias (mentor_id, materia_id, metodo_contacto, valor_contacto) VALUES (?, ?, ?, ?)");
      stmt.run(decoded.id, materia_id, metodo, valor);
      
      res.status(201).json({ success: true });
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
