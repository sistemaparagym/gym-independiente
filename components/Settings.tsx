import React, { useState } from 'react';
import { GymSettings, SubscriptionPlan, Staff, Reward } from '../types';
import { Building2, Save, ShieldCheck, Star, Zap, X, DollarSign, UserPlus, Trash2, Key, Gift, Plus, Dumbbell } from 'lucide-react';

interface SettingsProps {
  settings: GymSettings;
  onUpdateSettings: (settings: GymSettings) => void;
  staffList: Staff[];
  addStaff: (staff: Staff) => void;
  deleteStaff: (id: string) => void;
  updateStaffPassword: (id: string, newPass: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings, staffList, addStaff, deleteStaff, updateStaffPassword }) => {
  const [formData, setFormData] = useState<GymSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'staff' | 'gamification' | 'subscription'>('general');
  
  // Estados Staff
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPass, setNewStaffPass] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'admin'|'instructor'>('instructor');

  // Estados Premios
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState('');

  // Estados Seguridad
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingPlan, setPendingPlan] = useState<SubscriptionPlan | null>(null);
  const [error, setError] = useState('');
  const SUPER_ADMIN_PASSWORD = 'admin';

  const handleSave = () => {
    onUpdateSettings(formData);
    alert('Configuración guardada exitosamente');
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if(newStaffEmail && newStaffPass) {
      addStaff({ id: crypto.randomUUID(), name: newStaffName, email: newStaffEmail, password: newStaffPass, role: newStaffRole });
      setNewStaffName(''); setNewStaffEmail(''); setNewStaffPass('');
    }
  };

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    if(newRewardName && newRewardPoints) {
      const newReward: Reward = {
        id: crypto.randomUUID(),
        name: newRewardName,
        points: Number(newRewardPoints)
      };
      setFormData({
        ...formData,
        rewards: [...(formData.rewards || []), newReward]
      });
      setNewRewardName(''); setNewRewardPoints('');
    }
  };

  const handleDeleteReward = (id: string) => {
    setFormData({
      ...formData,
      rewards: formData.rewards?.filter(r => r.id !== id)
    });
  };

  const handlePriceChange = (key: 'basic' | 'intermediate' | 'full' | 'crossfit', value: string) => {
    setFormData({ ...formData, membershipPrices: { ...formData.membershipPrices, [key]: parseFloat(value) || 0 } });
  };

  const initiatePlanChange = (plan: SubscriptionPlan) => { if (plan === formData.plan) return; setPendingPlan(plan); setPasswordInput(''); setError(''); setIsAuthModalOpen(true); };
  const verifyPassword = (e: React.FormEvent) => { e.preventDefault(); if (passwordInput.trim() === SUPER_ADMIN_PASSWORD) { if (pendingPlan) setFormData({ ...formData, plan: pendingPlan }); setIsAuthModalOpen(false); setPendingPlan(null); setPasswordInput(''); } else setError('Contraseña incorrecta.'); };

  // MODIFICADO: Eliminada la prop 'price' y su renderizado
  const PlanCard = ({ type, features, icon: Icon, color }: any) => (
    <div onClick={() => initiatePlanChange(type)} className={`cursor-pointer border-2 rounded-xl p-6 transition-all relative overflow-hidden group ${formData.plan === type ? `border-${color}-500 bg-${color}-50 shadow-md` : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
      {formData.plan === type && <div className={`absolute top-0 right-0 bg-${color}-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg`}>ACTIVO</div>}
      <div className={`w-12 h-12 rounded-lg bg-${color}-100 text-${color}-600 flex items-center justify-center mb-4`}><Icon size={24} /></div>
      <h3 className="text-xl font-bold text-slate-900 mb-4">{type}</h3> {/* mb-1 cambiado a mb-4 para espaciado */}
      <ul className="space-y-2">{features.map((f: string, i: number) => <li key={i} className="flex items-center gap-2 text-sm text-slate-700"><div className={`w-1.5 h-1.5 rounded-full bg-${color}-500`} /> {f}</li>)}</ul>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex space-x-4 border-b border-slate-200 overflow-x-auto">
        <button onClick={() => setActiveTab('general')} className={`pb-2 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'general' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'}`}>General</button>
        <button onClick={() => setActiveTab('staff')} className={`pb-2 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'staff' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'}`}>Staff</button>
        <button onClick={() => setActiveTab('gamification')} className={`pb-2 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'gamification' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'}`}>Premios</button>
        <button onClick={() => setActiveTab('subscription')} className={`pb-2 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'subscription' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'}`}>Suscripción</button>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6"><Building2 size={20}/> Datos Generales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label><input type="text" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-2 mb-6"><DollarSign size={20}/> Precios de Cuotas (Mensualidad)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {['basic', 'intermediate', 'full', 'crossfit'].map((plan) => (
                  <div key={plan}>
                    <label className="block text-sm font-bold text-slate-700 mb-1 capitalize">{plan}</label>
                    <input type="number" value={formData.membershipPrices?.[plan as keyof typeof formData.membershipPrices] || 0} onChange={(e) => handlePriceChange(plan as any, e.target.value)} className="w-full p-2 border rounded-lg font-bold" />
                  </div>
                ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Define aquí cuánto cobra el gimnasio a sus clientes por cada tipo de pase.</p>
          </div>
          <div className="flex justify-end"><button onClick={handleSave} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"><Save size={18}/> Guardar</button></div>
        </div>
      )}

      {activeTab === 'gamification' && (
        <div className="space-y-6 animate-in fade-in">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Gift size={20}/> Catálogo de Premios</h2>
                  <p className="text-slate-500 text-sm mt-1">Define los premios que los alumnos pueden canjear con sus puntos.</p>
              </div>
              
              <div className="p-6 bg-slate-50 border-b border-slate-200">
                 <h3 className="text-sm font-bold text-slate-700 mb-3">Nuevo Premio</h3>
                 <form onSubmit={handleAddReward} className="flex gap-4 items-end">
                    <div className="flex-1"><input required placeholder="Nombre del Premio (Ej: Botella)" className="w-full p-2 border rounded-lg" value={newRewardName} onChange={e => setNewRewardName(e.target.value)} /></div>
                    <div className="w-32"><input required type="number" placeholder="Puntos" className="w-full p-2 border rounded-lg" value={newRewardPoints} onChange={e => setNewRewardPoints(e.target.value)} /></div>
                    <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700"><Plus size={20}/></button>
                 </form>
              </div>

              <div className="p-0">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white border-b border-slate-100">
                    <tr><th className="px-6 py-3 text-slate-600">Premio</th><th className="px-6 py-3 text-slate-600">Costo (Puntos)</th><th className="px-6 py-3 text-right"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.rewards?.map(reward => (
                      <tr key={reward.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium">{reward.name}</td>
                        <td className="px-6 py-3 font-bold text-indigo-600">{reward.points} pts</td>
                        <td className="px-6 py-3 text-right"><button onClick={() => handleDeleteReward(reward.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16}/></button></td>
                      </tr>
                    ))}
                    {(!formData.rewards || formData.rewards.length === 0) && <tr><td colSpan={3} className="p-6 text-center text-slate-400 italic">No hay premios configurados.</td></tr>}
                  </tbody>
                </table>
              </div>
           </div>
           <div className="flex justify-end"><button onClick={handleSave} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"><Save size={18}/> Guardar Cambios</button></div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-6 animate-in fade-in">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200"><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ShieldCheck size={20}/> Equipo de Trabajo</h2></div>
              <div className="p-6 bg-slate-50 border-b border-slate-200">
                 <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-1"><input required placeholder="Nombre" className="w-full p-2 border rounded-lg text-sm" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} /></div>
                    <div className="md:col-span-1"><input required type="email" placeholder="Email" className="w-full p-2 border rounded-lg text-sm" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} /></div>
                    <div className="md:col-span-1"><input required type="text" placeholder="Contraseña" className="w-full p-2 border rounded-lg text-sm" value={newStaffPass} onChange={e => setNewStaffPass(e.target.value)} /></div>
                    <div className="md:col-span-1"><select className="w-full p-2 border rounded-lg text-sm" value={newStaffRole} onChange={e => setNewStaffRole(e.target.value as any)}><option value="instructor">Instructor</option><option value="admin">Administrador</option></select></div>
                    <div className="md:col-span-1"><button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-1"><UserPlus size={16}/> Agregar</button></div>
                 </form>
              </div>
              <div className="p-0">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white border-b border-slate-100"><tr><th className="px-6 py-3 text-slate-600">Nombre</th><th className="px-6 py-3 text-slate-600">Email</th><th className="px-6 py-3 text-slate-600">Rol</th><th className="px-6 py-3 text-slate-600">Clave</th><th className="px-6 py-3 text-right text-slate-600">Acciones</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffList.map(staff => (
                      <tr key={staff.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium">{staff.name}</td>
                        <td className="px-6 py-3 text-slate-500">{staff.email}</td>
                        <td className="px-6 py-3"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${staff.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{staff.role}</span></td>
                        <td className="px-6 py-3 font-mono text-xs text-slate-400">•••••</td>
                        <td className="px-6 py-3 text-right flex justify-end gap-2">
                           <button onClick={() => { const newPass = prompt('Nueva clave para ' + staff.name); if(newPass) updateStaffPassword(staff.id, newPass); }} className="p-1 text-slate-400 hover:text-blue-600"><Key size={16}/></button>
                           <button onClick={() => deleteStaff(staff.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'subscription' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <PlanCard type="Basic" color="slate" icon={ShieldCheck} features={['Gestión de Clientes', 'Contabilidad Básica', 'Cobranzas Simples', 'Dashboard']} />
              <PlanCard type="Standard" color="blue" icon={Zap} features={['Todo lo de Básico +', 'Control de Acceso', 'CRM & Marketing', 'Portal Clientes']} />
              <PlanCard type="Full" color="purple" icon={Star} features={['Todo lo de Estándar +', 'Gamificación', 'Entrenamientos', 'Inventario']} />
              <PlanCard type="CrossFit" color="orange" icon={Dumbbell} features={['Todo lo de Full +', 'Gestión de WODs', 'Reservas de Turnos', 'Pizarra / Leaderboard']} />
          </div>
          <div className="flex justify-end mt-4"><button onClick={handleSave} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 flex items-center gap-2"><Save size={18}/> Actualizar Plan</button></div>
        </div>
      )}

      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            <div className="text-center mb-6"><h3 className="text-xl font-bold text-slate-900">Autenticación Requerida</h3><p className="text-slate-500 text-sm mt-1">Clave Maestra</p></div>
            <form onSubmit={verifyPassword} className="space-y-4">
              <input type="password" className="w-full p-3 text-center text-lg border rounded-xl" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} autoFocus />
              {error && <p className="text-red-500 text-xs mt-2 text-center font-medium">{error}</p>}
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Autorizar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
