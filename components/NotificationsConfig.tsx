
import React, { useState, useEffect } from 'react';
import { GymSettings, MessageTemplate } from '../types';
import { MessageSquare, Save, RotateCcw, Info } from 'lucide-react';

interface NotificationsConfigProps {
  settings: GymSettings;
  onUpdateSettings: (settings: GymSettings) => void;
}

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  { 
    id: 'whatsapp_debt_reminder', type: 'whatsapp_debt_reminder', label: 'Recordatorio Pago (WhatsApp)', 
    content: 'Hola {nombre}, esperamos que estés disfrutando de {gym}. Te recordamos que tienes un saldo pendiente de {deuda}. ¿Podrías regularizarlo? ¡Gracias!',
    description: 'Se envía como aviso amable.' 
  },
  { 
    id: 'whatsapp_debt_urgent', type: 'whatsapp_debt_urgent', label: 'Pago Urgente (WhatsApp)', 
    content: 'Estimado/a {nombre}, le informamos desde {gym} que su cuenta presenta un saldo vencido de {deuda}. Por favor, realice el pago para evitar la suspensión.',
    description: 'Se envía a deudores crónicos.' 
  },
  { 
    id: 'whatsapp_birthday', type: 'whatsapp_birthday', label: 'Saludo Cumpleaños (WhatsApp)', 
    content: '¡Feliz cumpleaños {nombre}! 🎂 En {gym} queremos celebrarlo contigo. Pasa por recepción por tu regalo especial.',
    description: 'Mensaje automático de felicitación.' 
  },
  { 
    id: 'whatsapp_rescue', type: 'whatsapp_rescue', label: 'Rescate Ausentes (WhatsApp)', 
    content: 'Hola {nombre}! Te extrañamos en {gym}. Vuelve esta semana y te regalamos un pase libre para un amigo. 💪',
    description: 'Para clientes que no vienen hace 15 días.' 
  }
];

export const NotificationsConfig: React.FC<NotificationsConfigProps> = ({ settings, onUpdateSettings }) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>(settings.messageTemplates || DEFAULT_TEMPLATES);

  useEffect(() => {
    // Asegurar que si faltan templates nuevos en la config guardada, se agreguen los defaults
    const currentIds = new Set((settings.messageTemplates || []).map(t => t.id));
    const missingTemplates = DEFAULT_TEMPLATES.filter(t => !currentIds.has(t.id));
    
    if (missingTemplates.length > 0) {
      setTemplates([...(settings.messageTemplates || []), ...missingTemplates]);
    } else {
        setTemplates(settings.messageTemplates || DEFAULT_TEMPLATES);
    }
  }, [settings]);

  const handleContentChange = (id: string, newContent: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, content: newContent } : t));
  };

  const handleSave = () => {
    onUpdateSettings({ ...settings, messageTemplates: templates });
    alert('Plantillas de mensajes actualizadas correctamente.');
  };

  const handleReset = () => {
    if(window.confirm('¿Restaurar todos los mensajes a su valor original?')) {
        setTemplates(DEFAULT_TEMPLATES);
        onUpdateSettings({ ...settings, messageTemplates: DEFAULT_TEMPLATES });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><MessageSquare className="text-indigo-600"/> Editor de Mensajes</h2>
            <p className="text-slate-500">Personaliza cómo se comunica tu gimnasio.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={handleReset} className="text-slate-500 hover:text-slate-700 px-4 py-2 flex items-center gap-2"><RotateCcw size={16}/> Restaurar</button>
            <button onClick={handleSave} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg"><Save size={18}/> Guardar Cambios</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between mb-2">
                <h3 className="font-bold text-slate-800">{template.label}</h3>
                <div className="group relative">
                    <Info size={16} className="text-slate-400 cursor-help"/>
                    <div className="absolute right-0 w-48 bg-slate-800 text-white text-xs p-2 rounded hidden group-hover:block z-10">
                        Variables disponibles: {'{nombre}'}, {'{deuda}'}, {'{gym}'}
                    </div>
                </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">{template.description}</p>
            <textarea 
                rows={4} 
                className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={template.content}
                onChange={(e) => handleContentChange(template.id, e.target.value)}
            />
            <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                <span className="font-bold">Vista previa:</span> {template.content.replace('{nombre}', 'Juan').replace('{deuda}', '$1500').replace('{gym}', settings.name)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
