import React, { useState } from 'react';
import { Client, MembershipStatus, Routine, GymSettings } from '../types';
import { Search, Plus, MoreHorizontal, User, Mail, Phone, Edit, Trash2, DollarSign, X, Key, Dumbbell, CheckCircle, Repeat, AlertCircle, Calendar } from 'lucide-react';

interface ClientsProps {
  clients: Client[];
  routines: Routine[]; 
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  registerPayment: (client: Client, amount: number, description: string) => void;
  settings: GymSettings; // Added settings prop here to fix the type error
}

export const Clients: React.FC<ClientsProps> = ({ clients, routines, addClient, updateClient, deleteClient, registerPayment, settings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false); 
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('Pago Mensualidad');
  
  // ESTADO FORMULARIO COMPLETO
  const [formData, setFormData] = useState<Partial<Client>>({ 
    status: MembershipStatus.ACTIVE, 
    balance: 0, 
    plan: 'basic',
    joinDate: new Date().toISOString().split('T')[0], // Por defecto hoy
    birthDate: '',
    phone: '',
    emergencyContact: ''
  });
  
  const [selectedNewRoutineId, setSelectedNewRoutineId] = useState('');

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase()));

  // Helper para obtener precio
  const getPriceForPlan = (plan: string | undefined) => {
      const p = plan || 'basic';
      const prices: any = settings.membershipPrices || { basic: 0, intermediate: 0, full: 0, crossfit: 0 };
      return prices[p] || 0;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación de campos obligatorios
    if (formData.name && formData.email && formData.plan && formData.joinDate && formData.birthDate) {
        addClient({ 
            ...formData, 
            id: crypto.randomUUID(),
            // Aseguramos que si no puso saldo, sea 0
            balance: Number(formData.balance) || 0,
            points: 0,
            level: 'Bronze',
            streak: 0,
            lastVisit: new Date().toISOString(), // Primera visita = creación
        } as Client);
        
        setIsModalOpen(false);
        // Reset del formulario
        setFormData({ 
            status: MembershipStatus.ACTIVE, 
            balance: 0, 
            plan: 'basic',
            joinDate: new Date().toISOString().split('T')[0],
            birthDate: '',
            phone: '',
            emergencyContact: ''
        });
    } else {
        alert("Por favor completa todos los campos obligatorios (*)");
    }
  };

  const handleUpdate = (e: React.FormEvent) => { e.preventDefault(); if(selectedClient) { updateClient(selectedClient.id, formData); setIsEditModalOpen(false); }};
  const handlePayment = (e: React.FormEvent) => { e.preventDefault(); if(selectedClient) { registerPayment(selectedClient, Number(paymentAmount), paymentDescription); setIsPaymentModalOpen(false); }};
  const handleDelete = (id: string) => { deleteClient(id); setActiveMenuId(null); };
  const handleChangePassword = (client: Client) => {
    const newPass = prompt(`Ingresa nueva contraseña para ${client.name}:`);
    if (newPass) { updateClient(client.id, { password: newPass }); alert('Contraseña actualizada'); }
    setActiveMenuId(null);
  };

  const handleAssignRoutine = () => {
    if (selectedClient) {
        if (selectedNewRoutineId === '') {
            updateClient(selectedClient.id, { assignedRoutineId: null, routineStartDate: null });
        } else {
            updateClient(selectedClient.id, { assignedRoutineId: selectedNewRoutineId, routineStartDate: new Date().toISOString() });
        }
        setIsRoutineModalOpen(false);
    }
  };

  // EDITADO: Agregamos 'CrossFit' al mapeo de nombres
  const getPlanName = (planCode: string) => { 
    const names: any = { basic: 'Básica', intermediate: 'Intermedia', full: 'Full', crossfit: 'CrossFit' }; 
    return names[planCode] || planCode; 
  };
  
  const getRoutineName = (id?: string | null) => { if(!id) return null; return routines.find(r => r.id === id)?.name || 'Rutina eliminada'; };

  const openRoutineModal = (client: Client) => {
      setSelectedClient(client);
      setSelectedNewRoutineId(client.assignedRoutineId || '');
      setIsRoutineModalOpen(true);
      setActiveMenuId(null);
  }

  const planPrice = getPriceForPlan(formData.plan);

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen" onClick={() => setActiveMenuId(null)}>
      {/* Header y Buscador */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Buscar cliente..." className="w-full pl-10 p-2 border rounded-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button 
            onClick={(e) => {
                e.stopPropagation(); 
                setIsModalOpen(true); 
                setFormData({status: MembershipStatus.ACTIVE, balance:0, plan:'basic', joinDate: new Date().toISOString().split('T')[0]});
            }} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-blue-700 transition-colors"
        >
            <Plus size={20}/> Nuevo Cliente
        </button>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4 hidden md:table-cell">Contacto</th>
                    <th className="px-6 py-4">Cuota</th>
                    <th className="px-6 py-4">Ingreso</th>
                    <th className="px-6 py-4">Saldo</th>
                    <th className="px-6 py-4 text-right"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredClients.map(client => (
                    <tr key={client.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium">{client.name}</td>
                        <td className="px-6 py-4 hidden md:table-cell text-slate-500">{client.phone}<br/><span className="text-xs">{client.email}</span></td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold text-slate-600 ${client.plan === 'crossfit' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100'}`}>
                            {getPlanName(client.plan)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{client.joinDate}</td>
                        <td className={`px-6 py-4 font-bold ${client.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>${client.balance}</td>
                        <td className="px-6 py-4 text-right relative">
                            <button onClick={(e) => {e.stopPropagation(); setActiveMenuId(activeMenuId === client.id ? null : client.id)}} className="text-slate-400 p-2"><MoreHorizontal size={20}/></button>
                            {activeMenuId === client.id && (
                                <div className="absolute right-8 top-8 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-50 overflow-hidden">
                                    <button onClick={() => {setSelectedClient(client); setFormData(client); setIsEditModalOpen(true)}} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex gap-2 text-slate-700"><Edit size={16}/> Editar</button>
                                    <button onClick={() => openRoutineModal(client)} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex gap-2 text-indigo-600"><Dumbbell size={16}/> Rutina</button>
                                    <button onClick={() => handleChangePassword(client)} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex gap-2 text-slate-700"><Key size={16}/> Clave</button>
                                    <button onClick={() => {setSelectedClient(client); setIsPaymentModalOpen(true)}} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-emerald-600 flex gap-2"><DollarSign size={16}/> Pagar</button>
                                    <div className="border-t my-1"></div>
                                    <button onClick={() => handleDelete(client.id)} className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex gap-2"><Trash2 size={16}/> Eliminar</button>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      
      {/* MODAL NUEVO CLIENTE / EDITAR */}
      {(isModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
               <h2 className="text-xl font-bold text-slate-800">{isEditModalOpen ? 'Editar Ficha Cliente' : 'Nuevo Cliente'}</h2>
               <button onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            
            <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="space-y-6">
              {/* Sección 1: Datos Personales */}
              <div>
                  <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">Datos Personales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
                        <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                        <input required type="email" className="w-full p-2 border border-slate-300 rounded-lg" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono (WhatsApp) *</label>
                        <input required type="tel" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="+54..." value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Nacimiento *</label>
                        <input required type="date" className="w-full p-2 border border-slate-300 rounded-lg" value={formData.birthDate || ''} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contacto Emergencia</label>
                        <input type="tel" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Nombre y Tel" value={formData.emergencyContact || ''} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} />
                      </div>
                  </div>
              </div>

              <div className="border-t border-slate-100"></div>

              {/* Sección 2: Membresía */}
              <div>
                  <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-3">Membresía y Facturación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Cuota *</label>
                        <select className="w-full p-2 border border-slate-300 rounded-lg bg-white" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                          <option value="basic">Cuota Básica</option>
                          <option value="intermediate">Cuota Intermedia</option>
                          <option value="full">Cuota Full</option>
                          {/* EDITADO: Nueva opción CrossFit */}
                          <option value="crossfit">Cuota CrossFit / Pase Libre</option>
                        </select>
                        {/* VISUALIZADOR DE PRECIO */}
                        <p className="text-xs mt-1 font-bold text-slate-500">
                            Precio Actual: <span className={planPrice === 0 ? "text-red-500" : "text-emerald-600"}>${planPrice}</span>
                            {planPrice === 0 && " (¡Atención! Configura el precio en Ajustes)"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Ingreso (Inicio Ciclo) *</label>
                        <input required type="date" className="w-full p-2 border border-slate-300 rounded-lg" value={formData.joinDate || ''} onChange={e => setFormData({...formData, joinDate: e.target.value})} />
                        <p className="text-xs text-slate-400 mt-1">Determina el día de cobro mensual.</p>
                      </div>
                      
                      {!isEditModalOpen && (
                        <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            {/* ETIQUETA CAMBIADA PARA CLARIDAD */}
                            <label className="block text-sm font-bold text-slate-700 mb-1">Monto Abonado Hoy (Pago Inicial)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                <input type="number" className="w-full pl-9 p-2 border border-slate-300 rounded-lg" placeholder="0.00" value={formData.balance === 0 ? '' : formData.balance} onChange={e => setFormData({...formData, balance: parseFloat(e.target.value) || 0})} />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Ingresa aquí SOLO lo que el cliente paga en este momento. Si no paga nada, déjalo en 0 para generar la deuda.</p>
                        </div>
                      )}
                  </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }} className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold shadow-lg">
                  {isEditModalOpen ? 'Guardar Cambios' : 'Dar de Alta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ... (Resto de modales: Routine, Payment igual que antes) ... */}
      {isRoutineModalOpen && selectedClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.stopPropagation()}>
              <div className="bg-white p-0 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">Rutina de {selectedClient.name}</h3>
                      <button onClick={()=>setIsRoutineModalOpen(false)}><X size={20} className="text-slate-400"/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                          <p className="text-xs text-indigo-400 uppercase font-bold mb-1">Asignación Actual</p>
                          {selectedClient.assignedRoutineId ? (
                              <div>
                                  <p className="text-lg font-bold text-indigo-700 flex items-center gap-2"><CheckCircle size={18}/> {getRoutineName(selectedClient.assignedRoutineId)}</p>
                              </div>
                          ) : ( <p className="text-slate-500 italic flex items-center gap-2"><AlertCircle size={16}/> Sin rutina.</p> )}
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Asignar Nueva:</label>
                          <select className="w-full p-3 border border-slate-300 rounded-lg bg-white" value={selectedNewRoutineId} onChange={(e) => setSelectedNewRoutineId(e.target.value)}>
                              <option value="">-- Quitar Rutina --</option>
                              {routines.map(r => <option key={r.id} value={r.id}>{r.name} ({r.difficulty})</option>)}
                          </select>
                      </div>
                      <button onClick={handleAssignRoutine} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 flex justify-center gap-2"><Repeat size={18}/> Actualizar</button>
                  </div>
              </div>
          </div>
      )}
      {isPaymentModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.stopPropagation()}>
              <div className="bg-white p-6 rounded-xl w-full max-w-sm">
                  <h2 className="text-xl font-bold mb-4">Pago</h2>
                  <form onSubmit={handlePayment} className="space-y-4">
                      <input autoFocus type="number" placeholder="Monto" className="w-full p-2 border rounded" value={paymentAmount} onChange={e=>setPaymentAmount(e.target.value)}/>
                      <div className="flex justify-end gap-2 pt-4">
                          <button type="button" onClick={()=>setIsPaymentModalOpen(false)} className="px-4 py-2 text-slate-500">Cancelar</button>
                          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">Cobrar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
