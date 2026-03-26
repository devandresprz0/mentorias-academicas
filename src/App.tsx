import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { 
  Search, 
  User, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  LogOut, 
  ChevronRight, 
  Filter,
  GraduationCap,
  Plus,
  Trash2,
  ArrowLeft,
  Settings,
  Shield,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Types ---
interface Mentor {
  id: number;
  nombre: string;
  bio: string;
  carrera_nombre: string;
  materias: string;
  contacto_tipo?: string;
  contacto_valor?: string;
}

interface FullMentor {
  id: number;
  nombre: string;
  bio: string;
  email: string;
  carrera_nombre: string;
  materias: { materia_id: number; nombre: string; experiencia: string }[];
  contactos: { id: number; tipo: string; valor: string }[];
}

interface UserSession {
  id: number;
  nombre: string;
  rol: string;
  token: string;
}

// --- Components ---

const Navbar = ({ user, onLogout }: { user: UserSession | null, onLogout: () => void }) => (
  <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">EduLink</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors hidden sm:block">
                Hola, {user.nombre}
              </Link>
              <Link to="/dashboard" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
              <button 
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </div>
  </nav>
);

const MentorCard: React.FC<{ mentor: Mentor }> = ({ mentor }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-100 transition-colors">
        <User className="text-indigo-600 w-6 h-6" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
        {mentor.carrera_nombre}
      </span>
    </div>
    
    <h3 className="text-lg font-bold text-gray-900 mb-1">{mentor.nombre}</h3>
    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{mentor.bio || "Sin biografía disponible."}</p>
    
    <div className="flex flex-wrap gap-2 mb-4">
      {mentor.materias?.split(',').map((m, i) => (
        <span key={i} className="text-[10px] font-bold bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100">
          {m}
        </span>
      ))}
    </div>
    
    <Link 
      to={`/mentor/${mentor.id}`}
      className="flex items-center text-indigo-600 text-sm font-bold group-hover:gap-2 transition-all"
    >
      Ver perfil <ChevronRight className="w-4 h-4" />
    </Link>
  </motion.div>
);

// --- Pages ---

const Home = () => {
  const [mentores, setMentores] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalogos, setCatalogos] = useState<{ materias: any[], carreras: any[] }>({ materias: [], carreras: [] });

  const q = searchParams.get("q") || "";
  const materia = searchParams.get("materia") || "";
  const carrera = searchParams.get("carrera") || "";

  useEffect(() => {
    fetchCatalogos();
  }, []);

  useEffect(() => {
    fetchMentores();
  }, [q, materia, carrera]);

  const fetchCatalogos = async () => {
    const res = await fetch("/api/catalogos");
    const data = await res.json();
    setCatalogos(data);
  };

  const fetchMentores = async () => {
    setLoading(true);
    const res = await fetch(`/api/mentores?${searchParams.toString()}`);
    const data = await res.json();
    setMentores(data);
    setLoading(false);
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  return (
    <div>
      {/* Hero Section */}
      <header className="bg-white border-b border-gray-100 pt-16 pb-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl font-black text-gray-900 mb-6 tracking-tight"
          >
            Encuentra tu <span className="text-indigo-600">Mentor</span> Académico
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto"
          >
            Conecta con estudiantes de años superiores para potenciar tu aprendizaje. 
            Gratis, rápido y directo.
          </motion.p>

          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-2">
              <div className="pl-4 pr-2 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text"
                placeholder="Busca por materia, carrera o nombre..."
                className="flex-1 py-3 outline-none text-gray-700 font-medium"
                value={q}
                onChange={(e) => updateFilter("q", e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-4 h-4 text-indigo-600" />
                <h2 className="font-bold text-gray-900">Filtros</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Carrera</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-300"
                    value={carrera}
                    onChange={(e) => updateFilter("carrera", e.target.value)}
                  >
                    <option value="">Todas las carreras</option>
                    {catalogos.carreras.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Materia</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-300"
                    value={materia}
                    onChange={(e) => updateFilter("materia", e.target.value)}
                  >
                    <option value="">Todas las materias</option>
                    {catalogos.materias.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl"></div>
                ))}
              </div>
            ) : mentores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mentores.map(mentor => (
                  <MentorCard key={mentor.id} mentor={mentor} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-300 w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No encontramos mentores</h3>
                <p className="text-gray-500">Intenta ajustando tus filtros de búsqueda.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const MentorProfile = () => {
  const { id } = useParams();
  const [mentor, setMentor] = useState<FullMentor | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/mentores/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) navigate("/");
        else setMentor(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-20 text-center">Cargando...</div>;
  if (!mentor) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 font-bold transition-colors">
        <ArrowLeft className="w-5 h-5" /> Volver
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-indigo-600"></div>
        <div className="px-8 pb-12 -mt-12">
          <div className="bg-white p-2 rounded-2xl inline-block shadow-lg mb-6">
            <div className="bg-indigo-50 p-6 rounded-xl">
              <User className="text-indigo-600 w-12 h-12" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <h1 className="text-4xl font-black text-gray-900 mb-2">{mentor.nombre}</h1>
              <p className="text-indigo-600 font-bold text-lg mb-6">{mentor.carrera_nombre}</p>
              
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sobre mí</h4>
              <p className="text-gray-600 leading-relaxed mb-8">{mentor.bio || "Sin biografía."}</p>
              
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Materias</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mentor.materias.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{m.nombre}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{m.experiencia}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Contactar</h4>
                <div className="space-y-3">
                  {mentor.contactos.map((c, i) => (
                    <a 
                      key={i}
                      href={c.tipo === 'whatsapp' ? `https://wa.me/${c.valor}?text=Hola%20${mentor.nombre},%20vi%20tu%20perfil%20en%20EduLink.` : `mailto:${c.valor}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all group"
                    >
                      {c.tipo === 'whatsapp' ? <MessageCircle className="w-5 h-5 text-green-500" /> : <Mail className="w-5 h-5 text-indigo-500" />}
                      <span className="font-bold text-gray-700 capitalize">{c.tipo}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-indigo-500 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = ({ onLogin }: { onLogin: (u: UserSession) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", email: "", password: "", rol: "aprendiz", carrera_id: "" });
  const [catalogos, setCatalogos] = useState<{ carreras: any[] }>({ carreras: [] });
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/catalogos").then(res => res.json()).then(setCatalogos);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister ? formData : { correo: formData.email, password: formData.password };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      if (isRegister) {
        setIsRegister(false);
        alert("¡Registro exitoso! Ahora inicia sesión.");
      } else {
        onLogin({ ...data.user, token: data.token });
        navigate("/");
      }
    } else alert(data.error);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-black text-gray-900 mb-2">{isRegister ? "Únete" : "Entrar"}</h2>
        <p className="text-gray-500 mb-8">{isRegister ? "Crea tu cuenta institucional." : "Ingresa tus credenciales."}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre</label>
                <input type="text" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-300" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Carrera</label>
                <select required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-300" value={formData.carrera_id} onChange={e => setFormData({...formData, carrera_id: e.target.value})}>
                  <option value="">Selecciona carrera</option>
                  {catalogos.carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Rol</label>
                <div className="grid grid-cols-2 gap-4">
                  {['aprendiz', 'mentor'].map(r => (
                    <button key={r} type="button" onClick={() => setFormData({...formData, rol: r})} className={`py-3 rounded-xl font-bold border-2 transition-all capitalize ${formData.rol === r ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 text-gray-400'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Email</label>
            <input type="email" required placeholder="usuario@universidad.edu" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-300" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Contraseña</label>
            <input type="password" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:border-indigo-300" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all mt-4">
            {isRegister ? "Registrarse" : "Ingresar"}
          </button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} className="w-full mt-6 text-indigo-600 font-bold hover:underline">
          {isRegister ? "¿Ya tienes cuenta? Entra" : "¿No tienes cuenta? Regístrate"}
        </button>
      </div>
    </div>
  );
};

const Dashboard = ({ user, token }: { user: UserSession, token: string }) => {
  const [catalogos, setCatalogos] = useState<{ materias: any[], carreras: any[] }>({ materias: [], carreras: [] });
  const [profile, setProfile] = useState<FullMentor | null>(null);
  const [bio, setBio] = useState("");
  const [carreraId, setCarreraId] = useState("");
  const [mentoria, setMentoria] = useState({ materia_id: "", experiencia: "Básico" });
  const [contacto, setContacto] = useState({ tipo: "whatsapp", valor: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalogos();
    fetchProfile();
  }, []);

  const fetchCatalogos = async () => {
    const res = await fetch("/api/catalogos");
    const data = await res.json();
    setCatalogos(data);
  };

  const fetchProfile = async () => {
    setLoading(true);
    const res = await fetch("/api/perfil", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      setProfile(data);
      setBio(data.bio || "");
      setCarreraId(data.carrera_id?.toString() || "");
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/perfil/actualizar", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ bio, carrera_id: carreraId })
    });
    if (res.ok) {
      alert("Perfil actualizado");
      fetchProfile();
    }
  };

  const handleAddMentoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentoria.materia_id) return alert("Selecciona una materia");
    const res = await fetch("/api/perfil/mentoria", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(mentoria)
    });
    if (res.ok) {
      alert("Materia agregada");
      fetchProfile();
      setMentoria({ materia_id: "", experiencia: "Básico" });
    }
  };

  const handleDeleteMentoria = async (materiaId: number) => {
    if (!confirm("¿Eliminar esta materia?")) return;
    const res = await fetch(`/api/perfil/mentoria/${materiaId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) fetchProfile();
  };

  const handleAddContacto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contacto.valor) return alert("Ingresa un valor de contacto");
    const res = await fetch("/api/perfil/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(contacto)
    });
    if (res.ok) {
      alert("Contacto agregado");
      fetchProfile();
      setContacto({ tipo: "whatsapp", valor: "" });
    }
  };

  const handleDeleteContacto = async (id: number) => {
    if (!confirm("¿Eliminar este método de contacto?")) return;
    const res = await fetch(`/api/perfil/contacto/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) fetchProfile();
  };

  if (loading) return <div className="p-20 text-center font-bold text-gray-400">Cargando panel...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-12">
        <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-100">
          <Settings className="text-white w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Panel de Control</h1>
          <p className="text-gray-500 font-medium">Gestiona tu perfil y mentorías</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" /> Información Básica
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Biografía</label>
                <textarea 
                  placeholder="Cuéntanos sobre ti, tus intereses y por qué quieres ser mentor..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 outline-none focus:border-indigo-300 transition-all h-32 resize-none font-medium text-gray-700" 
                  value={bio} 
                  onChange={e => setBio(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Carrera</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 outline-none focus:border-indigo-300 transition-all font-medium text-gray-700" 
                  value={carreraId} 
                  onChange={e => setCarreraId(e.target.value)}
                >
                  <option value="">Selecciona tu carrera</option>
                  {catalogos.carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                Actualizar Perfil
              </button>
            </form>
          </section>

          {/* Mentorships */}
          {user.rol === 'mentor' && (
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" /> Mis Materias de Mentoría
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <form onSubmit={handleAddMentoria} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nueva Materia</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-indigo-300 transition-all font-medium text-gray-700" 
                      value={mentoria.materia_id} 
                      onChange={e => setMentoria({...mentoria, materia_id: e.target.value})}
                    >
                      <option value="">Selecciona materia</option>
                      {catalogos.materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nivel de Experiencia</label>
                    <select 
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-indigo-300 transition-all font-medium text-gray-700" 
                      value={mentoria.experiencia} 
                      onChange={e => setMentoria({...mentoria, experiencia: e.target.value})}
                    >
                      <option value="Básico">Básico</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>
                  <button className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                    <Plus className="w-5 h-5" /> Agregar Materia
                  </button>
                </form>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Materias Actuales</label>
                  {profile?.materias.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No has agregado materias aún.</p>
                  ) : (
                    profile?.materias.map((m, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{m.nombre}</p>
                          <p className="text-[10px] text-indigo-500 uppercase font-black">{m.experiencia}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteMentoria(m.materia_id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          {/* Contact Methods */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-indigo-600" /> Contacto
            </h2>
            <form onSubmit={handleAddContacto} className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tipo</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-indigo-300 transition-all font-medium text-gray-700" 
                  value={contacto.tipo} 
                  onChange={e => setContacto({...contacto, tipo: e.target.value})}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Valor</label>
                <input 
                  type="text" 
                  placeholder={contacto.tipo === 'whatsapp' ? "Ej: 573001234567" : "Ej: correo@universidad.edu"} 
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-indigo-300 transition-all font-medium text-gray-700" 
                  value={contacto.valor} 
                  onChange={e => setContacto({...contacto, valor: e.target.value})} 
                />
              </div>
              <button className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                Agregar Contacto
              </button>
            </form>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tus Contactos</label>
              {profile?.contactos.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No has agregado métodos de contacto.</p>
              ) : (
                profile?.contactos.map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      {c.tipo === 'whatsapp' ? <MessageCircle className="w-4 h-4 text-green-500" /> : <Mail className="w-4 h-4 text-indigo-500" />}
                      <div>
                        <p className="font-bold text-gray-900 text-sm capitalize">{c.tipo}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{c.valor}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteContacto(c.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Account Info */}
          <section className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100">
            <Shield className="w-8 h-8 mb-4 opacity-50" />
            <h3 className="text-xl font-black mb-2">Cuenta Verificada</h3>
            <p className="text-indigo-100 text-sm font-medium mb-6">Tu perfil está vinculado a tu correo institucional: <strong>{profile?.email}</strong></p>
            <div className="bg-indigo-500/30 p-4 rounded-2xl border border-indigo-400/30">
              <p className="text-xs font-bold uppercase tracking-widest mb-1">Rol Actual</p>
              <p className="text-2xl font-black capitalize">{profile?.rol}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
const Footer = () => (
  <footer className="bg-white border-t border-gray-100 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">EduLink</span>
        </div>
        
        <div className="flex gap-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Inicio</Link>
          <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Panel</Link>
          <a href="#" className="hover:text-indigo-600 transition-colors">Términos</a>
        </div>

        <p className="text-sm text-gray-400 font-medium">
          © {new Date().getFullYear()} EduLink. Hecho con ❤️ para estudiantes.
        </p>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (u: UserSession) => {
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 flex flex-col">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/mentor/:id" element={<MentorProfile />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} token={user.token} /> : <Login onLogin={handleLogin} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}