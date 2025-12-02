import React, { useState, useEffect } from 'react';
import { Dumbbell, Lock, Mail, ArrowRight, Loader2, Download, Smartphone, Share, PlusSquare } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { UserRole, Client, Staff } from '../types';

interface LoginProps {
  onLogin: (role: UserRole, userData?: Client | Staff) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para PWA (Instalación)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Chequear si ya está instalada (Modo Standalone)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode);

    // 2. Detectar si es dispositivo iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Capturar evento de instalación (Android/PC Chrome)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // Evita que Chrome muestre el banner nativo feo
      setDeferredPrompt(e); // Guardamos el evento para dispararlo con nuestro botón
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    // Lógica para Android / Desktop
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } 
    // Lógica para iOS (Mostrar instrucciones)
    else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Buscar en colección STAFF (Admins e Instructores)
      const staffQuery = query(collection(db, 'staff'), where('email', '==', email));
      const staffSnapshot = await getDocs(staffQuery);

      if (!staffSnapshot.empty) {
        const staffDoc = staffSnapshot.docs[0];
        const staffData = staffDoc.data() as Staff;
        
        if (staffData.password === password) {
          onLogin(staffData.role, { ...staffData, id: staffDoc.id });
          return;
        } else {
           setError('Contraseña incorrecta.');
           setLoading(false);
           return;
        }
      }

      // 2. Si no es staff, buscar en CLIENTES
      const clientQuery = query(collection(db, 'clients'), where('email', '==', email));
      const clientSnapshot = await getDocs(clientQuery);

      if (!clientSnapshot.empty) {
        const clientDoc = clientSnapshot.docs[0];
        const clientData = clientDoc.data() as Client;
        // Si no tiene contraseña, usa '1234' por defecto
        const storedPass = clientData.password || '1234';

        if (password === storedPass) {
          onLogin('client', { ...clientData, id: clientDoc.id });
          return;
        } else {
           setError('Contraseña incorrecta.');
           setLoading(false);
           return;
        }
      }

      // Si llegamos aquí, no se encontró el email
      setError('Usuario no encontrado.');

    } catch (err) {
      console.error(err);
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative">
      
      {/* BOTÓN DE INSTALACIÓN (Solo si no está instalada ya) */}
      {!isStandalone && (deferredPrompt || isIOS) && (
        <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-top-4">
          <button 
            onClick={handleInstallClick}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <Download size={18} />
            <span className="text-sm">Instalar App</span>
          </button>
        </div>
      )}

      {/* MODAL INSTRUCCIONES iOS */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setShowIOSInstructions(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowIOSInstructions(false)} className="absolute top-4 right-4 text-slate-400">✕</button>
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                 <Smartphone className="text-slate-900" size={24}/>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instalar en iPhone</h3>
              <p className="text-slate-600 text-sm mb-4">iOS no permite instalación automática. Sigue estos pasos:</p>
              
              <div className="bg-slate-50 rounded-lg p-4 text-left space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <Share size={20} className="text-blue-500"/>
                  <span>1. Toca el botón <b>Compartir</b> en la barra inferior.</span>
                </div>
                <div className="flex items-center gap-3">
                  <PlusSquare size={20} className="text-slate-900"/>
                  <span>2. Busca y selecciona <b>"Agregar a Inicio"</b>.</span>
                </div>
              </div>
              
              <button onClick={() => setShowIOSInstructions(false)} className="mt-6 w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Entendido</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8 text-center bg-indigo-600">
           <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
             <Dumbbell size={40} className="text-white" />
           </div>
           <h1 className="text-3xl font-bold text-white mb-1">GymFlow</h1>
           <p className="text-indigo-200 text-sm">Sistema de Gestión Integral</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Iniciar Sesión</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  required 
                  type="email" 
                  className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="usuario@email.com" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  required 
                  type="password" 
                  className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center border border-red-100">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Ingresar <ArrowRight size={20} /></>}
            </button>
          </form>
        </div>
      </div>
      
      <p className="text-slate-500 text-xs mt-8">Versión 2.0 - Modo Box Compatible</p>
    </div>
  );
};
