import React, { useState } from 'react';
import { Client, GymSettings } from '../types';
import { HeartPulse, Gift, MessageCircle, Calendar, Clock } from 'lucide-react';

interface MarketingCRMProps {
  clients: Client[];
  settings: GymSettings; 
}

export const MarketingCRM: React.FC<MarketingCRMProps> = ({ clients, settings }) => {
  const [activeTab, setActiveTab] = useState<'rescue' | 'birthdays'>('rescue');

  const today = new Date();
  
  // Lógica Rescate
  const rescueList = clients.filter(c => {
    if (c.status !== 'Activo') return false;
    const lastVisit = new Date(c.lastVisit);
    const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 15;
  });

  // Lógica Cumpleaños
  const currentMonth = today.getMonth();
  const birthdayList = clients.filter(c => {
    if (!c.birthDate) return false;
    const birthDate = new Date(c.birthDate + 'T00:00:00'); 
    return birthDate.getMonth() === currentMonth;
  });

  // HELPER PARA MENSAJES DINÁMICOS
  const getDynamicMessage = (client: Client, type: 'birthday' | 'rescue') => {
      const templateId = type === 'birthday' ? 'whatsapp_birthday' : 'whatsapp_rescue';
      const template = settings.messageTemplates?.find(t => t.id === templateId);
      
      let content = template ? template.content : (type === 'birthday' ? 'Feliz cumple {nombre}!' : 'Hola {nombre}, te extrañamos.');
      
      return content
        .replace(/{nombre}/g, client.name)
        .replace(/{gym}/g, settings.name);
  };

  const handleWhatsApp = (client: Client, type: 'birthday' | 'rescue') => {
    const message = getDynamicMessage(client, type);
    const cleanPhone = client.phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><HeartPulse className="text-pink-500" /> CRM & Marketing</h2>
            <p className="text-sm text-slate-500">Mensajes configurados en Sistema {'>'} Plantillas Mensajes.</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-slate-200">
        <button onClick={() => setActiveTab('rescue')} className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'rescue' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><Clock size={16} /> Alertas Rescate ({rescueList.length})</button>
        <button onClick={() => setActiveTab('birthdays')} className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'birthdays' ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><Gift size={16} /> Cumpleaños ({birthdayList.length})</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        {activeTab === 'rescue' && (
          <div>
            <div className="p-4 bg-pink-50 border-b border-pink-100 text-pink-800 text-sm">Clientes ausentes (+15 días).</div>
            {rescueList.length > 0 ? (
               <div className="divide-y divide-slate-100">
                 {rescueList.map(client => {
                   const daysAbsent = Math.ceil((today.getTime() - new Date(client.lastVisit).getTime()) / (1000 * 60 * 60 * 24));
                   return (
                     <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                       <div><p className="font-bold text-slate-800">{client.name}</p><p className="text-sm text-slate-500">Ausente <span className="text-pink-600 font-bold">{daysAbsent} días</span></p></div>
                       <button onClick={() => handleWhatsApp(client, 'rescue')} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"><MessageCircle size={16} /> Rescatar</button>
                     </div>
                   );
                 })}
               </div>
            ) : ( <div className="p-8 text-center text-slate-500">¡Excelente! Tus clientes activos están asistiendo.</div> )}
          </div>
        )}

        {activeTab === 'birthdays' && (
          <div>
             <div className="p-4 bg-purple-50 border-b border-purple-100 text-purple-800 text-sm">Cumpleañeros de {today.toLocaleString('es-ES', { month: 'long' })}.</div>
            {birthdayList.length > 0 ? (
               <div className="divide-y divide-slate-100">
                 {birthdayList.map(client => {
                   const birthDate = new Date(client.birthDate + 'T00:00:00');
                   return (
                     <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                       <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><Gift size={20} /></div><div><p className="font-bold text-slate-800">{client.name}</p><p className="text-sm text-slate-500 flex items-center gap-1"><Calendar size={12} /> {birthDate.getDate()} de {birthDate.toLocaleString('es-ES', { month: 'long' })}</p></div></div>
                       <button onClick={() => handleWhatsApp(client, 'birthday')} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"><MessageCircle size={16} /> Felicitar</button>
                     </div>
                   );
                 })}
               </div>
            ) : ( <div className="p-8 text-center text-slate-500">No hay cumpleaños este mes.</div> )}
          </div>
        )}
      </div>
    </div>
  );
};
