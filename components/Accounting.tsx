import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Client } from '../types';
import { Plus, TrendingUp, TrendingDown, Filter, DollarSign, Calendar, Trash2, Edit, X, User } from 'lucide-react';

interface AccountingProps {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  clients: Client[];
}

export const Accounting: React.FC<AccountingProps> = ({ transactions, addTransaction, updateTransaction, deleteTransaction, clients }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: TransactionType.INCOME,
    date: new Date().toISOString().split('T')[0],
    category: 'Mensualidad'
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const [year, month] = t.date.split('-').map(Number);
      return year === selectedYear && (month - 1) === selectedMonth;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedMonth, selectedYear]);

  const incomeMonth = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0);
  const expenseMonth = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0);
  const balanceMonth = incomeMonth - expenseMonth;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.description && formData.amount) {
      const cleanData: any = {
          description: formData.description,
          amount: Number(formData.amount),
          date: formData.date || new Date().toISOString().split('T')[0],
          type: formData.type as TransactionType,
          category: formData.category || 'Varios',
      };
      if (formData.clientId) cleanData.clientId = formData.clientId;
      
      // Si hay cliente seleccionado, buscamos su nombre para guardarlo también
      if (formData.clientId) {
          const clientName = clients.find(c => c.id === formData.clientId)?.name;
          if(clientName) cleanData.clientName = clientName;
      }

      if (editingId) updateTransaction(editingId, cleanData);
      else addTransaction({ id: crypto.randomUUID(), ...cleanData });
      closeModal();
    }
  };

  const openEdit = (t: Transaction) => { setFormData(t); setEditingId(t.id); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData({ type: TransactionType.INCOME, date: new Date().toISOString().split('T')[0], category: 'Mensualidad' }); };
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Libro Diario</h2>
          <div className="flex items-center gap-2 mt-2">
             <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-white border p-2 rounded text-sm">{months.map((m, i) => <option key={i} value={i}>{m}</option>)}</select>
             <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-white border p-2 rounded text-sm">{[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-lg"><Plus size={18} /> Registrar Movimiento</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase">Ingresos</p><p className="text-2xl font-bold text-emerald-600 mt-1 flex items-center gap-2"><TrendingUp size={20} /> ${incomeMonth.toLocaleString()}</p></div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase">Gastos</p><p className="text-2xl font-bold text-red-600 mt-1 flex items-center gap-2"><TrendingDown size={20} /> ${expenseMonth.toLocaleString()}</p></div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><p className="text-xs font-bold text-slate-400 uppercase">Balance Neto</p><p className={`text-2xl font-bold mt-1 ${balanceMonth >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>${balanceMonth.toLocaleString()}</p></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50"><div className="flex items-center gap-2 text-slate-500 text-sm"><Filter size={16} /> <span>Movimientos de {months[selectedMonth]}</span></div><span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{filteredTransactions.length} registros</span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-slate-700">Fecha</th>
                <th className="px-6 py-3 text-slate-700">Descripción</th>
                <th className="px-6 py-3 text-slate-700">Cliente</th> {/* NUEVA COLUMNA */}
                <th className="px-6 py-3 text-slate-700">Categoría</th>
                <th className="px-6 py-3 text-slate-700 text-right">Monto</th>
                <th className="px-6 py-3 text-slate-700 text-right">Registrado Por</th> {/* NUEVA COLUMNA */}
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{t.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{t.description}</td>
                  {/* COLUMNA CLIENTE */}
                  <td className="px-6 py-4">
                      {t.clientName ? (
                          <span className="text-blue-600 font-medium text-xs flex items-center gap-1"><User size={12}/> {t.clientName}</span>
                      ) : <span className="text-slate-400 text-xs">-</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-600"><span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">{t.category}</span></td>
                  <td className={`px-6 py-4 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'}`}>{t.type === TransactionType.INCOME ? '+' : '-'}${t.amount.toLocaleString()}</td>
                  {/* COLUMNA AUTOR */}
                  <td className="px-6 py-4 text-right text-xs text-slate-500 italic">{t.createdBy || 'Sistema'}</td>
                  
                  <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="p-1 hover:bg-slate-200 rounded text-slate-500"><Edit size={16} /></button>
                      <button onClick={() => deleteTransaction(t.id)} className="p-1 hover:bg-red-100 rounded text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-500">No hay movimientos en este mes.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-slate-800">{editingId ? 'Editar' : 'Registrar'}</h2><button onClick={closeModal}><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div onClick={() => setFormData({...formData, type: TransactionType.INCOME})} className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 ${formData.type === TransactionType.INCOME ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200'}`}><TrendingUp size={24} /> <span className="font-bold">Ingreso</span></div>
                <div onClick={() => setFormData({...formData, type: TransactionType.EXPENSE})} className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 ${formData.type === TransactionType.EXPENSE ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-200'}`}><TrendingDown size={24} /> <span className="font-bold">Gasto</span></div>
              </div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">Monto</label><input required type="number" min="0" step="0.01" className="w-full p-2 border rounded-lg font-bold text-lg" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label><input required type="text" className="w-full p-2 border rounded-lg" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label><input type="date" className="w-full p-2 border rounded-lg" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                 <div><label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label><select className="w-full p-2 border rounded-lg" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {formData.type === TransactionType.INCOME ? <><option>Cuota</option><option>Mensualidad</option><option>Productos</option><option>Servicios</option><option>Otros</option></> : <><option>Alquiler</option><option>Servicios</option><option>Mantenimiento</option><option>Salarios</option><option>Equipo</option><option>Impuestos</option><option>Otros</option></>}
                  </select></div>
              </div>
              {formData.type === TransactionType.INCOME && (
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Cliente (Opcional)</label><select className="w-full p-2 border rounded-lg" value={formData.clientId || ''} onChange={e => setFormData({...formData, clientId: e.target.value})}><option value="">-- Sin vincular --</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              )}
              <div className="flex justify-end gap-3 mt-6"><button type="button" onClick={closeModal} className="px-4 py-2 text-slate-500">Cancelar</button><button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold">Guardar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
