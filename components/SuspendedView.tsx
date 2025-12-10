// Archivo: src/components/SuspendedView.tsx
import React from 'react';
import { PROJECT_STATUS } from '../config';
import { Lock, Smartphone, Mail, AlertTriangle } from 'lucide-react';

export const SuspendedView: React.FC = () => {
  const wsMessage = `Hola, necesito regularizar el estado de mi licencia de software (GymFlow).`;
  const wsLink = `https://wa.me/${PROJECT_STATUS.providerWhatsapp}?text=${encodeURIComponent(wsMessage)}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
        
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={40} className="text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">Servicio Pausado</h1>
        <p className="text-slate-500 mb-8">
          La licencia de uso ha expirado o requiere atención administrativa.
        </p>

        <div className="space-y-3">
          <a 
            href={wsLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors"
          >
            <Smartphone size={20} />
            Contactar Soporte
          </a>
          
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mt-4">
            <Mail size={14} />
            <span>{PROJECT_STATUS.providerEmail}</span>
          </div>
        </div>
        
        <div className="mt-8 bg-orange-50 p-3 rounded-lg flex items-center gap-2 text-left">
            <AlertTriangle className="text-orange-500 shrink-0" size={18}/>
            <p className="text-xs text-orange-700">
                <strong>Nota:</strong> Sus datos están seguros. El acceso se restablecerá inmediatamente al regularizar la situación.
            </p>
        </div>
      </div>
    </div>
  );
};
