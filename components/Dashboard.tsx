import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Transaction, TransactionType, Client, MembershipStatus, CheckIn, GymSettings, UserRole } from '../types';
import { Users, DollarSign, TrendingUp, TrendingDown, Activity, AlertCircle, Calendar, Clock, Cake } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  clients: Client[];
  checkIns: CheckIn[];
  settings: GymSettings;
  userRole: UserRole | null; // NUEVO PROP
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

export const Dashboard: React.FC<DashboardProps> = ({ transactions, clients, checkIns, settings, userRole }) => {
  
  const isAdmin = userRole === 'admin';

  // --- CÁLCULOS FINANCIEROS (Solo Admin) ---
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const netIncome = totalIncome - totalExpense;
  const totalReceivable = clients.filter(c => c.balance < 0).reduce((acc, curr) => acc + Math.abs(curr.balance), 0);

  // --- CÁLCULOS OPERATIVOS (Para Todos) ---
  const activeMembers = clients.filter(c => c.status === MembershipStatus.ACTIVE).length;
  
  // Ocupación (últimas 2 horas)
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  // Filtramos los que entraron hace menos de 2h Y no han marcado salida
  const currentOccupancy = checkIns.filter(c => {
      const entryTime = new Date(c.timestamp);
      return entryTime > twoHoursAgo && !c.checkoutTimestamp;
  }).length;

  // --- CÁLCULOS PARA INSTRUCTOR (NUEVO) ---
  
  // 1. Alumnos en Riesgo (Sin venir hace > 7 días)
  const riskClients = clients.filter(c => {
      if (c.status !== MembershipStatus.ACTIVE) return false;
      const lastVisit = new Date(c.lastVisit || c.joinDate);
      const diffTime = Math.abs(now.getTime() - lastVisit.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 7;
  });

  // 2. Cumpleaños del Mes
  const currentMonth = now.getMonth();
  const birthdayClients = clients.filter(c => {
      if (!c.birthDate) return false;
      // Ajuste por zona horaria simple para mes
      const birthDate = new Date(c.birthDate + 'T00:00:00'); 
      return birthDate.getMonth() === currentMonth;
  });

  // --- GRÁFICOS ---
  const monthlyDataMap = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('es-ES', { month: 'short' });
    if (!acc[month]) acc[month] = { name: month, Ingreso: 0, Gasto: 0 };
    if (t.type === TransactionType.INCOME) acc[month].Ingreso += t.amount;
    else acc[month].Gasto += t.amount;
    return acc;
  }, {} as Record<string, any>);
  const barChartData = Object.values(monthlyDataMap);

  const statusData = [
    { name: 'Activos', value: activeMembers },
    { name: 'Inactivos', value: clients.filter(c => c.status === MembershipStatus.INACTIVE).length },
    { name: 'Pendientes', value: clients.filter(c => c.status === MembershipStatus.PENDING).length },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      
      {/* Header */}
      <div className="mb-2 flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Hola, {isAdmin ? 'Administrador' : 'Profe'} 👋</h1>
            <p className="text-slate-500">Resumen del estado de {settings.name}.</p>
        </div>
        {!isAdmin && (
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-bold border border-indigo-100">
                Modo Instructor
            </div>
        )}
      </div>

      {/* --- SECCIÓN FINANCIERA (SOLO ADMIN) --- */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">Ingresos</p><p className="text-2xl font-bold text-emerald-600">${totalIncome.toLocaleString()}</p></div>
                <div className="p-3 bg-emerald-100 rounded-full text-emerald-600"><TrendingUp size={24} /></div>
            </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">Gastos</p><p className="text-2xl font-bold text-red-600">${totalExpense.toLocaleString()}</p></div>
                <div className="p-3 bg-red-100 rounded-full text-red-600"><TrendingDown size={24} /></div>
            </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">Neto</p><p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>${netIncome.toLocaleString()}</p></div>
                <div className="p-3 bg-blue-100 rounded-full text-blue-600"><DollarSign size={24} /></div>
            </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-slate-500">Por Cobrar</p><p className="text-2xl font-bold text-orange-600">${totalReceivable.toLocaleString()}</p></div>
                <div className="p-3 bg-orange-100 rounded-full text-orange-600"><AlertCircle size={24} /></div>
            </div>
            </div>
        </div>
      )}
      
      {/* --- SECCIÓN OPERATIVA (TODOS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ocupación */}
        <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 font-medium mb-1 text-sm uppercase">En Sala</p>
                    <div className="text-5xl font-bold mb-2">{currentOccupancy}</div>
                    <p className="text-emerald-400 text-xs font-bold flex items-center gap-1"><Activity size={12}/> Entrenando ahora</p>
                </div>
                <div className="p-3 bg-white/10 rounded-full text-white"><Users size={24} /></div>
            </div>
          </div>
          {/* Decorative background chart */}
          <div className="absolute bottom-0 right-0 w-full h-16 opacity-10 pointer-events-none">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{v:10}, {v:20}, {v:15}, {v:30}, {v:currentOccupancy}, {v:25}, {v:10}]}>
                   <Bar dataKey="v" fill="#fff" />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Miembros Activos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-slate-500">Alumnos Activos</p><p className="text-3xl font-bold text-slate-800">{activeMembers}</p></div>
            <div className="p-3 bg-indigo-100 rounded-full text-indigo-600"><Users size={24} /></div>
          </div>
          <div className="mt-4">
             <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(activeMembers / (clients.length || 1)) * 100}%` }}></div>
             </div>
             <p className="text-xs text-slate-400 mt-1 text-right">{clients.length} registrados en total</p>
          </div>
        </div>

        {/* Widget Dinámico: Cumpleaños (Si hay) o Alerta */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           {birthdayClients.length > 0 ? (
               <div>
                   <div className="flex justify-between items-center mb-2">
                       <p className="text-sm font-medium text-slate-500">Cumpleaños Mes</p>
                       <Cake className="text-pink-500" size={20}/>
                   </div>
                   <p className="text-3xl font-bold text-slate-800">{birthdayClients.length}</p>
                   <p className="text-xs text-slate-400 mt-1">No olvides saludarlos</p>
               </div>
           ) : (
               <div>
                   <div className="flex justify-between items-center mb-2">
                       <p className="text-sm font-medium text-slate-500">Retención</p>
                       <Clock className="text-orange-500" size={20}/>
                   </div>
                   <p className="text-3xl font-bold text-slate-800">{riskClients.length}</p>
                   <p className="text-xs text-red-500 font-bold mt-1">Alumnos en riesgo de abandono</p>
               </div>
           )}
        </div>
      </div>

      {/* --- CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Financiero (SOLO ADMIN) */}
        {isAdmin ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Flujo de Caja</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="Ingreso" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gasto" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            </div>
        ) : (
            /* Panel de Instructor (Reemplaza al gráfico financiero) */
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80 overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><AlertCircle size={18} className="text-orange-500"/> Alumnos Ausentes (+7 días)</h3>
                {riskClients.length > 0 ? (
                    <div className="space-y-3">
                        {riskClients.map(c => (
                            <div key={c.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="font-bold text-slate-700 text-sm">{c.name}</p>
                                    <p className="text-xs text-slate-400">Última vez: {new Date(c.lastVisit).toLocaleDateString()}</p>
                                </div>
                                <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">{c.phone}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Users size={40} className="mb-2 opacity-20"/>
                        <p>¡Excelente! Todos están asistiendo.</p>
                    </div>
                )}
            </div>
        )}

        {/* Gráfico Distribución (PARA TODOS) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Estado de la Membresía</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
