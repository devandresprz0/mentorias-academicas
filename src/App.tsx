import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { Search, User, LogIn, LogOut, BookOpen, MessageCircle, Mail, Settings, Plus, Trash2, Shield, ArrowLeft, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- COMPONENTS ---

const Navbar = ({ user, onLogout }: { user: any; onLogout: () => void }) => (
  <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <span className="font-bold text-xl tracking-tight text-gray-900">Mentoría Académica</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/perfil" className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
                <User className="w-6 h-6" />
              </Link>
              {user.rol === 'admin' && (
                <Link to="/admin" className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
                  <Shield className="w-6 h-6" />
                </Link>
              )}
              <button onClick={onLogout} className="text-gray-600 hover:text-red-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
                <LogOut className="w-6 h-6" />
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </div>
  </nav>
);

const MentorCard = ({ mentor }: { mentor: any; key?: any }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{mentor.nombre_completo}</h3>
        <p className="text-sm text-blue-600 font-medium">{mentor.carrera}</p>
      </div>
      <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
        {mentor.materia_nombre}
      </div>
    </div>
    <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">{mentor.biografia || "Sin biografía disponible."}</p>
    <div className="flex flex-col gap-2">
      <Link 
        to={`/mentor/${mentor.id}`}
        className="w-full bg-gray-50 text-gray-700 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors border border-gray-100"
      >
        Ver perfil completo
      </Link>
      <div className="flex gap-2">
        {mentor.metodo_contacto === 'whatsapp' ? (
          <a 
            href={mentor.valor_contacto} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-green-500 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        ) : (
          <a 
            href={`mailto:${mentor.valor_contacto}`}
            className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email
          </a>
        )}
      </div>
    </div>
  </motion.div>
);

// --- PAGES ---

const Home = () => {
  const [mentores, setMentores] = useState([]);
  const [search, setSearch] = useState("");
  const [carrera, setCarrera] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentores();
  }, [search, carrera]);

  const fetchMentores = async () => {
    setLoading(true);
    const res = await fetch(`/api/mentores?materia=${search}&carrera=${carrera}`);
    const data = await res.json();
    setMentores(data);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Encuentra tu Mentor</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Aprende de estudiantes que ya dominan las materias que necesitas. Vinculación directa y gratuita.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por materia..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm appearance-none cursor-pointer"
          value={carrera}
          onChange={(e) => setCarrera(e.target.value)}
        >
          <option value="">Todas las carreras</option>
          <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
          <option value="Ingeniería Industrial">Ingeniería Industrial</option>
          <option value="Administración de Empresas">Administración de Empresas</option>
          <option value="Derecho">Derecho</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : mentores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {mentores.map((mentor: any) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron mentores</h3>
          <p className="text-gray-500">Intenta buscar con otros términos o sugiere esta materia a un amigo.</p>
        </div>
      )}
    </div>
  );
};

const Login = ({ onLogin }: { onLogin: (user: any, token: string) => void }) => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password })
    });
    const data = await res.json();
    if (res.ok) {
      onLogin(data.user, data.token);
      navigate("/");
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Bienvenido de nuevo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Institucional</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="usuario@universidad.edu"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Ingresar
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes cuenta? <Link to="/registro" className="text-blue-600 font-bold">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

const Register = () => {
  const [form, setForm] = useState({ nombre: "", correo: "", password: "", carrera: "Ingeniería de Sistemas" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      navigate("/login");
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Crea tu cuenta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={form.nombre}
              onChange={(e) => setForm({...form, nombre: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Institucional</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="usuario@universidad.edu"
              value={form.correo}
              onChange={(e) => setForm({...form, correo: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={form.carrera}
              onChange={(e) => setForm({...form, carrera: e.target.value})}
            >
              <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
              <option value="Ingeniería Industrial">Ingeniería Industrial</option>
              <option value="Administración de Empresas">Administración de Empresas</option>
              <option value="Derecho">Derecho</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
};

const Profile = ({ user, token }: { user: any; token: string }) => {
  const [materias, setMaterias] = useState([]);
  const [form, setForm] = useState({ materia_id: "", metodo: "whatsapp", valor: "" });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/materias").then(res => res.json()).then(setMaterias);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/perfil/mentoria", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setSuccess(true);
      setForm({ ...form, valor: "" });
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded-full">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.nombre}</h2>
            <p className="text-gray-500">Configura tus mentorías</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Materia a impartir</label>
            <select 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={form.materia_id}
              onChange={(e) => setForm({...form, materia_id: e.target.value})}
            >
              <option value="">Selecciona una materia</option>
              {materias.map((m: any) => (
                <option key={m.id} value={m.id}>{m.nombre} ({m.area})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Método de contacto</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setForm({...form, metodo: 'whatsapp'})}
                className={cn(
                  "py-3 rounded-xl font-bold border-2 transition-all",
                  form.metodo === 'whatsapp' ? "border-green-500 bg-green-50 text-green-600" : "border-gray-100 text-gray-400"
                )}
              >
                WhatsApp
              </button>
              <button 
                type="button"
                onClick={() => setForm({...form, metodo: 'email'})}
                className={cn(
                  "py-3 rounded-xl font-bold border-2 transition-all",
                  form.metodo === 'email' ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-100 text-gray-400"
                )}
              >
                Email
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {form.metodo === 'whatsapp' ? "Enlace de WhatsApp (wa.me)" : "Correo de contacto"}
            </label>
            <input 
              type="text" 
              required
              placeholder={form.metodo === 'whatsapp' ? "https://wa.me/57300..." : "tu@correo.com"}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={form.valor}
              onChange={(e) => setForm({...form, valor: e.target.value})}
            />
          </div>
          {success && <p className="text-green-600 text-sm font-bold">¡Materia agregada con éxito!</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Publicar Mentoría
          </button>
        </form>
      </div>
    </div>
  );
};

const MentorProfile = () => {
  const { id } = useParams();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/mentores/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          navigate("/");
        } else {
          setMentor(data);
        }
        setLoading(false);
      });
  }, [id, navigate]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!mentor) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 font-medium transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-6 mb-8">
              <div className="bg-blue-100 p-6 rounded-3xl">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{mentor.nombre_completo}</h1>
                <p className="text-blue-600 font-bold text-lg">{mentor.carrera}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Sobre mí</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {mentor.biografia || "Este mentor aún no ha añadido una biografía."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Materias que imparto</h3>
                <div className="flex flex-wrap gap-3">
                  {mentor.materias.map((m: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-gray-700 font-medium">
                      {m.materia_nombre}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Contactar ahora</h3>
            <div className="space-y-4">
              {mentor.materias.map((m: any, idx: number) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">{m.materia_nombre}</p>
                  {m.metodo_contacto === 'whatsapp' ? (
                    <a 
                      href={m.valor_contacto} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-green-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </a>
                  ) : (
                    <a 
                      href={`mailto:${m.valor_contacto}`}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      Enviar Email
                    </a>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <Mail className="w-4 h-4" />
                <span>{mentor.correo}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  const handleLogin = (u: any, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("token", t);
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/perfil" element={user ? <Profile user={user} token={token} /> : <Login onLogin={handleLogin} />} />
            <Route path="/mentor/:id" element={<MentorProfile />} />
            <Route path="/admin" element={<div className="p-20 text-center">Panel de Administración (Próximamente)</div>} />
          </Routes>
        </main>
        
        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
          <Link to="/" className="text-gray-400 hover:text-blue-600"><Search className="w-6 h-6" /></Link>
          <Link to="/perfil" className="text-gray-400 hover:text-blue-600"><User className="w-6 h-6" /></Link>
          <Link to="/admin" className="text-gray-400 hover:text-blue-600"><Settings className="w-6 h-6" /></Link>
        </div>
      </div>
    </Router>
  );
}
