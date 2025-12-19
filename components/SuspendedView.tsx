import React from 'react';
import { Lock, AlertTriangle, Phone, Mail, MessageCircle } from 'lucide-react';

export const SuspendedView: React.FC = () => {
  // TUS DATOS DE CONTACTO (Soporte Centrol-Soft)
  const SUPPORT_WHATSAPP = "5493825625422"; 
  const SUPPORT_EMAIL = "edur900@gmail.com"; 

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center p-4">
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-overlay filter blur-3xl opacity-40"></div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full text-center relative z-10 animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-lg shadow-red-900/30">
          <Lock size={48} className="text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Servicio Pausado</h1>
        <p className="text-slate-300 mb-8 leading-relaxed text-sm">
          La licencia operativa de GymFlow ha sido suspendida temporalmente.
        </p>

        <div className="bg-black/20 rounded-2xl p-5 border border-white/5 text-left mb-8 flex gap-4">
          <div className="bg-amber-500/20 p-2 rounded-lg h-fit text-amber-500">
             <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 text-sm">Estado Administrativo</h3>
            <p className="text-xs text-slate-400 mt-1">
              Sus datos están seguros. El acceso se restablecerá automáticamente al regularizar el estado de la cuenta.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <a 
            href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Hola,%20necesito%20reactivar%20mi%20licencia%20de%20GymFlow.`}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all group"
          >
            <MessageCircle size={20} className="group-hover:scale-110 transition-transform"/> 
            Contactar Soporte
          </a>

          <a 
            href={`mailto:${SUPPORT_EMAIL}?subject=Reactivación%20GymFlow`}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl font-bold shadow-lg border border-white/10 flex items-center justify-center gap-2 transition-all"
          >
            <Mail size={20} /> 
            Enviar Correo
          </a>
        </div>
        
        <div className="mt-8 text-[10px] text-slate-500 font-mono tracking-widest uppercase opacity-60">
          ID: GYM-IND-001
        </div>
      </div>
    </div>
  );
};
