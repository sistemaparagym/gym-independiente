import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Calculator, Menu, Dumbbell, ScanLine, Package, Bell, Trophy, HeartPulse, Activity, Settings as SettingsIcon, LogOut, Calendar, Flame, MessageSquare } from 'lucide-react';

// Componentes
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { Accounting } from './components/Accounting';
import { AccessControl } from './components/AccessControl';
import { Inventory } from './components/Inventory';
import { Notifications } from './components/Notifications';
import { Gamification } from './components/Gamification';
import { Workouts } from './components/Workouts';
import { MarketingCRM } from './components/MarketingCRM';
import { Settings } from './components/Settings';
import { ClientPortal } from './components/ClientPortal';
import { Login } from './components/Login';
import { BookingsManager } from './components/BookingsManager';
import { WODBuilder } from './components/WODBuilder';
import { Whiteboard } from './components/Whiteboard';
import { NotificationsConfig } from './components/NotificationsConfig'; 

// --- KILL SWITCH (SISTEMA DE LICENCIA) ---
import { SuspendedView } from './components/SuspendedView';
import { useLicense } from './hooks/useLicense'; 
// ------------------------------------------

// Tipos
import { Client, Transaction, Product, CheckIn, GymSettings, MembershipStatus, TransactionType, Routine, UserRole, Staff, CompletedRoutine, ClassSession, WOD, WODScore } from './types';

// Firebase
import { db, registerUser } from './firebase';
import { collection, setDoc, doc, onSnapshot, query, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';

type View = 'dashboard' | 'clients' | 'accounting' | 'access' | 'inventory' | 'notifications' | 'gamification' | 'workouts' | 'marketing' | 'settings' | 'bookings' | 'wod_planning' | 'whiteboard' | 'notifications_config';

function App() {
  // 1. HOOKS PRIMERO (Siempre al inicio)
  const { isLocked, loading: licenseLoading } = useLicense();

  // ESTADO DE SESIÓN
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<Client | Staff | undefined>(undefined);

  // ESTADO DE LA APP
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // DATOS GENERALES
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]); 
  const [staffList, setStaffList] = useState<Staff[]>([]);
  
  // DATOS MODO CROSSFIT
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [wods, setWods] = useState<WOD[]>([]);
  const [wodScores, setWodScores] = useState<WODScore[]>([]); 
  
  const [gymSettings, setGymSettings] = useState<GymSettings>({
    name: 'GymFlow Fitness',
    logoUrl: '',
    plan: 'Full',
    membershipPrices: { basic: 0, intermediate: 0, full: 0, crossfit: 0 },
    rewards: []
  });

  // --- Sincronización Firebase (HOOKS) ---
  // IMPORTANTE: Los useEffect deben ir ANTES de cualquier return condicional
  useEffect(() => {
    if (!userRole) return;

    // Colecciones existentes
    const qClients = query(collection(db, 'clients'), orderBy('name'));
    const unsubClients = onSnapshot(qClients, (s) => setClients(s.docs.map(d => ({ ...d.data(), id: d.id } as Client))));

    const qTrans = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubTrans = onSnapshot(qTrans, (s) => setTransactions(s.docs.map(d => ({ ...d.data(), id: d.id } as Transaction))));

    const qProds = query(collection(db, 'products'), orderBy('name'));
    const unsubProds = onSnapshot(qProds, (s) => setProducts(s.docs.map(d => ({ ...d.data(), id: d.id } as Product))));

    const qCheck = query(collection(db, 'checkins'), orderBy('timestamp', 'desc')); 
    const unsubCheck = onSnapshot(qCheck, (s) => setCheckIns(s.docs.map(d => ({ ...d.data(), id: d.id } as CheckIn))));

    const qRout = query(collection(db, 'routines'));
    const unsubRout = onSnapshot(qRout, (s) => setRoutines(s.docs.map(d => ({ ...d.data(), id: d.id } as Routine))));

    const qStaff = query(collection(db, 'staff'));
    const unsubStaff = onSnapshot(qStaff, (s) => setStaffList(s.docs.map(d => ({ ...d.data(), id: d.id } as Staff))));

    // --- NUEVAS SUSCRIPCIONES (CrossFit) ---
    const qClasses = query(collection(db, 'classes'));
    const unsubClasses = onSnapshot(qClasses, (s) => setClassSessions(s.docs.map(d => ({ ...d.data(), id: d.id } as ClassSession))));

    const qWods = query(collection(db, 'wods'));
    const unsubWods = onSnapshot(qWods, (s) => setWods(s.docs.map(d => ({ ...d.data(), id: d.id } as WOD))));

    const qScores = query(collection(db, 'wod_scores')); 
    const unsubScores = onSnapshot(qScores, (s) => setWodScores(s.docs.map(d => ({ ...d.data(), id: d.id } as WODScore))));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as GymSettings;
        setGymSettings({ ...data, membershipPrices: data.membershipPrices || { basic: 0, intermediate: 0, full: 0, crossfit: 0 }, rewards: data.rewards || [] });
      }
    });

    return () => {
      unsubClients(); unsubTrans(); unsubProds(); unsubCheck(); unsubRout(); unsubStaff(); unsubSettings(); unsubClasses(); unsubWods(); unsubScores();
    };
  }, [userRole]);

  // --- PROCESO DE COBRO AUTOMÁTICO (HOOK) ---
  useEffect(() => {
    if (clients.length === 0) return;

    const checkMemberships = async () => {
      // Usamos fecha local exacta para evitar problemas de zona horaria
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      clients.forEach(async (client) => {
        if (client.status !== MembershipStatus.ACTIVE) return;

        const lastPaymentStr = client.lastMembershipPayment || client.joinDate;
        
        const [y, m, d] = lastPaymentStr.split('-').map(Number);
        const lastPaymentDate = new Date(y, m - 1, d); // Mes es index 0 en JS
        
        const nextPaymentDate = new Date(lastPaymentDate);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

        // Si hoy es igual o mayor a la fecha de próximo pago
        if (today >= nextPaymentDate) {
          const amount = getPlanPrice(client.plan);

          if (amount && amount > 0) {
            console.log(`Renovando cuota mensual a ${client.name}: $${amount}`);

            const newTransaction: Transaction = {
              id: crypto.randomUUID(),
              clientId: client.id,
              clientName: client.name,
              description: `Renovación Cuota Automática`,
              amount: amount,
              date: new Date().toISOString().split('T')[0],
              type: TransactionType.INCOME,
              category: 'Cuota',
              createdBy: 'Sistema Automático'
            };
            await setDoc(doc(db, 'transactions', newTransaction.id), newTransaction);

            const newLastPaymentStr = nextPaymentDate.toISOString().split('T')[0];

            const newBalance = client.balance - amount;
            await updateDoc(doc(db, 'clients', client.id), {
              balance: newBalance,
              lastMembershipPayment: newLastPaymentStr
            });
          }
        }
      });
    };

    const timer = setInterval(() => {
      checkMemberships();
    }, 10000); // Revisa cada 10 segundos

    return () => clearInterval(timer);
  }, [clients, gymSettings.membershipPrices]); 


  // --- Helper Functions (No son Hooks, pueden ir aquí) ---
  const getPlanPrice = (planCode: string) => {
    const prices: any = gymSettings.membershipPrices || { basic: 0, intermediate: 0, full: 0, crossfit: 0 };
    return prices[planCode] || 0;
  };

  const getCurrentUserSignature = () => {
    if (!currentUser) return 'Sistema';
    const roleLabel = userRole === 'admin' ? 'Admin' : userRole === 'instructor' ? 'Instructor' : 'Cliente';
    return `${currentUser.name} (${roleLabel})`;
  };

  // --- MODIFICADO: Add Client (Solo Base de Datos, SIN AUTH) ---
  const addClient = async (c: Client) => {
    const planPrice = getPlanPrice(c.plan);
    const amountPaid = c.balance || 0; 
    const finalBalance = amountPaid - planPrice; 
    
    // SEGURIDAD: NO guardamos la contraseña en Firestore
    const { password, ...clientDataWithoutPass } = c;

    const clientWithPayment = { ...clientDataWithoutPass, balance: finalBalance, lastMembershipPayment: c.joinDate };
    
    // Usamos el ID generado localmente (crypto.randomUUID) porque no hay UID de Auth
    await setDoc(doc(db, 'clients', c.id), clientWithPayment);
    
    if (amountPaid > 0) {
        await setDoc(doc(db, 'transactions', crypto.randomUUID()), { 
            id: crypto.randomUUID(), 
            clientId: c.id, 
            clientName: c.name,
            description: `Pago Inicial - Alta`, 
            amount: amountPaid, 
            date: new Date().toISOString().split('T')[0],
            type: TransactionType.INCOME, 
            category: 'Cuota',
            createdBy: getCurrentUserSignature()
        });
    }
  };

  // --- MODIFICADO: Add Staff (CON AUTH Y REGISTRO REAL) ---
  const addStaff = async (s: Staff) => {
    try {
        if (!s.password) throw new Error("La contraseña es obligatoria para el Staff");
        
        // 1. Crear usuario real en Auth
        const uid = await registerUser(s.email, s.password);
        
        // 2. Guardar en Firestore usando el UID real
        // SEGURIDAD: NO guardamos la contraseña en Firestore
        const { password, ...staffDataWithoutPass } = s;
        await setDoc(doc(db, 'staff', uid), { ...staffDataWithoutPass, id: uid });
        
        alert("Staff creado exitosamente. Ya puede iniciar sesión.");
    } catch (error: any) {
        console.error(error);
        alert("Error al crear staff: " + error.message);
    }
  };

  const updateClient = async (id: string, data: Partial<Client>) => await updateDoc(doc(db, 'clients', id), data);
  const deleteClient = async (id: string) => { if(window.confirm('¿Seguro?')) await deleteDoc(doc(db, 'clients', id)); };
  
  const registerPayment = async (client: Client, amount: number, desc: string) => {
    await setDoc(doc(db, 'transactions', crypto.randomUUID()), { id: crypto.randomUUID(), clientId: client.id, clientName: client.name, description: desc, amount, date: new Date().toISOString().split('T')[0], type: TransactionType.INCOME, category: 'Cuota', createdBy: getCurrentUserSignature() });
    await updateDoc(doc(db, 'clients', client.id), { balance: client.balance + amount });
  };

  const addTransaction = async (t: Transaction) => { const transactionWithUser = { ...t, createdBy: getCurrentUserSignature() }; await setDoc(doc(db, 'transactions', t.id), transactionWithUser); };
  const updateTransaction = async (id: string, d: Partial<Transaction>) => await updateDoc(doc(db, 'transactions', id), d);
  const deleteTransaction = async (id: string) => { if(window.confirm('¿Seguro?')) await deleteDoc(doc(db, 'transactions', id)); };
  const addProduct = async (p: Product) => await setDoc(doc(db, 'products', p.id), p);
  const handleCheckIn = async (client: Client) => { await setDoc(doc(db, 'checkins', crypto.randomUUID()), { id: crypto.randomUUID(), clientId: client.id, clientName: client.name, timestamp: new Date().toISOString(), checkoutTimestamp: null }); };
  const handleCheckOut = async (id: string) => await updateDoc(doc(db, 'checkins', id), { checkoutTimestamp: new Date().toISOString() });
  const addRoutine = async (r: Routine) => await setDoc(doc(db, 'routines', r.id), r);
  const updateRoutine = async (id: string, d: Partial<Routine>) => await updateDoc(doc(db, 'routines', id), d);
  const deleteRoutine = async (id: string) => { if(window.confirm('¿Seguro?')) await deleteDoc(doc(db, 'routines', id)); };
  const handleUpdateSettings = async (s: GymSettings) => { await setDoc(doc(db, 'settings', 'config'), s); setGymSettings(s); };
  const deleteStaff = async (id: string) => { if(window.confirm('¿Borrar usuario?')) await deleteDoc(doc(db, 'staff', id)); };
  const updateStaffPassword = async (id: string, pass: string) => await updateDoc(doc(db, 'staff', id), { password: pass });

  const addSession = async (s: ClassSession) => await setDoc(doc(db, 'classes', s.id), s);
  const deleteSession = async (id: string) => { if(window.confirm('¿Borrar turno?')) await deleteDoc(doc(db, 'classes', id)); };
  const addWod = async (w: WOD) => await setDoc(doc(db, 'wods', w.id), w);
  const deleteWod = async (id: string) => { if(window.confirm('¿Borrar WOD?')) await deleteDoc(doc(db, 'wods', id)); };

  const handleBookClass = async (classId: string) => {
      if (!currentUser || userRole !== 'client') return;
      const session = classSessions.find(s => s.id === classId);
      if (!session) return;
      if (session.attendees.includes(currentUser.id)) return;
      if (session.attendees.length >= session.capacity) { alert('Clase llena'); return; }

      const updatedAttendees = [...session.attendees, currentUser.id];
      await updateDoc(doc(db, 'classes', classId), { attendees: updatedAttendees });
      alert('¡Reserva confirmada!');
  };

  const handleCancelBooking = async (classId: string) => {
      if (!currentUser || userRole !== 'client') return;
      const session = classSessions.find(s => s.id === classId);
      if (!session) return;

      const updatedAttendees = session.attendees.filter(id => id !== currentUser.id);
      await updateDoc(doc(db, 'classes', classId), { attendees: updatedAttendees });
      alert('Reserva cancelada.');
  };

  const handleSaveWodScore = async (score: WODScore) => {
      await setDoc(doc(db, 'wod_scores', score.id), score);
      handleCompleteSession(15); 
  };

  const handleCompleteSession = async (pointsEarned: number) => {
    if (!currentUser || userRole !== 'client') return;
    const clientUser = currentUser as Client;
    const lastVisit = new Date(clientUser.lastVisit);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let newStreak = clientUser.streak;
    if (diffDays === 1) newStreak += 1; else if (diffDays > 1) newStreak = 1;

    const routineName = routines.find(r => r.id === clientUser.assignedRoutineId)?.name || 'Entrenamiento';
    const newHistoryItem: CompletedRoutine = { date: new Date().toISOString(), routineName: routineName, pointsEarned: pointsEarned };
    const currentHistory = clientUser.routineHistory || [];
    const updatedHistory = [newHistoryItem, ...currentHistory].slice(0, 7);
    const updates = { points: (clientUser.points || 0) + pointsEarned, streak: newStreak, lastVisit: new Date().toISOString(), routineHistory: updatedHistory };
    await updateDoc(doc(db, 'clients', clientUser.id), updates);
    setCurrentUser({ ...clientUser, ...updates });
  };

  const hasAccess = (view: View) => {
    if (userRole === 'admin') return true;
    if (userRole === 'instructor') return ['dashboard', 'clients', 'access', 'workouts', 'bookings', 'wod_planning', 'whiteboard', 'notifications_config'].includes(view);
    return false; 
  };

  const handleLogout = () => { setUserRole(null); setCurrentUser(undefined); setCurrentView('dashboard'); };
  
  const hasFeature = (feature: 'basic' | 'standard' | 'full' | 'crossfit') => { 
      if (gymSettings.plan === 'CrossFit') return true;
      if (feature === 'crossfit') return false; 
      if (gymSettings.plan === 'Full') return true;
      if (gymSettings.plan === 'Standard' && feature !== 'full') return true;
      if (gymSettings.plan === 'Basic' && feature === 'basic') return true;
      return false; 
  };

  const NavItem = ({ view, label, icon: Icon, badge, requiredPlan }: { view: View, label: string, icon: any, badge?: number, requiredPlan?: 'basic' | 'standard' | 'full' | 'crossfit' }) => {
    if (!hasAccess(view)) return null; 
    if (requiredPlan && !hasFeature(requiredPlan)) return null;
    return (
      <button onClick={() => { setCurrentView(view); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors font-medium relative ${currentView === view ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
        <Icon size={18} /> <span className="text-sm">{label}</span>
        {badge !== undefined && badge > 0 && <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
      </button>
    );
  };

  // --- RENDERIZADO CONDICIONAL ---
  
  // 1. Cargando Licencia
  if (licenseLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // 2. Licencia Bloqueada
  if (isLocked) {
    return <SuspendedView />;
  }

  // 3. Login
  if (!userRole) {
    // MODIFICADO: Pasamos settings al Login
    return <Login onLogin={(role, data) => { setUserRole(role); if (data) setCurrentUser(data); }} settings={gymSettings} />;
  }
  
  // 4. Portal Cliente (Si un cliente lograra entrar)
  if (userRole === 'client' && currentUser) return (
      <ClientPortal 
          client={currentUser as Client} 
          settings={gymSettings} 
          checkIns={checkIns} 
          routines={routines} 
          classSessions={classSessions}
          wods={wods}
          onLogout={handleLogout} 
          onCompleteSession={handleCompleteSession}
          onBookClass={handleBookClass}
          onCancelBooking={handleCancelBooking}
          onSaveWodScore={handleSaveWodScore}
      />
  );

  // 5. Panel Administrativo/Instructor
  const debtorsCount = clients.filter(c => c.balance < 0).length;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 px-2"><div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200 overflow-hidden">{gymSettings.logoUrl ? <img src={gymSettings.logoUrl} className="w-5 h-5 object-cover" alt="" /> : <Dumbbell size={20} strokeWidth={3} />}</div><div><h1 className="text-base font-bold text-slate-900 tracking-tight leading-none truncate max-w-[140px]">{gymSettings.name}</h1><span className="text-[10px] text-slate-400 uppercase font-bold">{userRole === 'admin' ? 'Administrador' : 'Instructor'}</span></div></div>
          <nav className="space-y-1 flex-1 overflow-y-auto max-h-[calc(100vh-180px)] pr-2 custom-scrollbar">
            <div className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-1">Gestión</div>
            <NavItem view="dashboard" label="Dashboard" icon={LayoutDashboard} requiredPlan="basic" />
            <NavItem view="clients" label="Clientes" icon={Users} requiredPlan="basic" />
            <NavItem view="accounting" label="Contabilidad" icon={Calculator} requiredPlan="basic" />
            <NavItem view="access" label="Control Acceso" icon={ScanLine} requiredPlan="standard" />
            
            {hasFeature('crossfit') && (
                <div className="pt-4 mt-4 border-t border-slate-100 bg-orange-50/50 rounded-xl p-2">
                    <div className="px-2 text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2">Modo Box</div>
                    <NavItem view="bookings" label="Agenda / Turnos" icon={Calendar} requiredPlan="crossfit" />
                    <NavItem view="wod_planning" label="Programar WOD" icon={Flame} requiredPlan="crossfit" />
                    <NavItem view="whiteboard" label="Pizarra / Leaderboard" icon={Trophy} requiredPlan="crossfit" />
                </div>
            )}
            
            <NavItem view="inventory" label="Inventario" icon={Package} requiredPlan="full" />
            
            {!hasFeature('crossfit') && hasFeature('full') && (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fidelización</div>
                <NavItem view="gamification" label="Gamificación" icon={Trophy} requiredPlan="full" />
                <NavItem view="workouts" label="Entrenamientos" icon={Activity} requiredPlan="full" />
              </div>
            )}
            
            {hasFeature('full') && !hasFeature('crossfit') && (
               <div className="pt-2"></div>
            )}

            <div className="pt-4 mt-4 border-t border-slate-100"><div className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Marketing</div><NavItem view="notifications" label="Cobranzas" icon={Bell} badge={debtorsCount} requiredPlan="basic" /><NavItem view="marketing" label="CRM & Rescate" icon={HeartPulse} requiredPlan="standard" /></div>
            
            <div className="pt-4 mt-4 border-t border-slate-100">
               <div className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sistema</div>
               <NavItem view="settings" label="Configuración" icon={SettingsIcon} />
               <NavItem view="notifications_config" label="Plantillas Mensajes" icon={MessageSquare} requiredPlan="standard" /> 
            </div>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-100"><button onClick={handleLogout} className="flex items-center gap-3 px-2 w-full text-left hover:bg-slate-50 p-2 rounded-lg transition-colors"><div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-bold text-white text-xs">{userRole === 'admin' ? 'AD' : 'IN'}</div><div className="text-sm flex-1"><p className="font-medium text-slate-900 capitalize">{userRole}</p><p className="text-slate-500 text-xs">Cerrar Sesión</p></div><LogOut size={16} className="text-slate-400" /></button></div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 lg:hidden p-4 flex items-center justify-between sticky top-0 z-30"><div className="flex items-center gap-3"><button onClick={() => setIsSidebarOpen(true)} className="text-slate-600"><Menu size={24} /></button><span className="font-bold text-lg text-slate-800">{gymSettings.name}</span></div></header>
        <div className="flex-1 overflow-auto bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
             {currentView === 'dashboard' && <Dashboard transactions={transactions} clients={clients} checkIns={checkIns} settings={gymSettings} userRole={userRole} />}
             {currentView === 'clients' && (
                <Clients 
                  clients={clients} 
                  routines={routines} 
                  staffList={staffList} // PASAMOS LA LISTA DE STAFF
                  addClient={addClient} 
                  updateClient={updateClient} 
                  deleteClient={deleteClient} 
                  registerPayment={registerPayment} 
                  settings={gymSettings} 
                />
             )}
             {currentView === 'accounting' && <Accounting transactions={transactions} addTransaction={addTransaction} updateTransaction={updateTransaction} deleteTransaction={deleteTransaction} clients={clients} />}
             {currentView === 'inventory' && <Inventory products={products} addProduct={addProduct} />}
             {currentView === 'access' && <AccessControl checkIns={checkIns} clients={clients} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />}
             {currentView === 'notifications' && <Notifications clients={clients} settings={gymSettings} />}
             {currentView === 'gamification' && <Gamification clients={clients} rewards={gymSettings.rewards} />}
             {currentView === 'workouts' && <Workouts clients={clients} routines={routines} addRoutine={addRoutine} updateRoutine={updateRoutine} deleteRoutine={deleteRoutine} updateClient={updateClient} />}
             {currentView === 'marketing' && <MarketingCRM clients={clients} settings={gymSettings} />}
             {currentView === 'settings' && <Settings settings={gymSettings} onUpdateSettings={handleUpdateSettings} staffList={staffList} addStaff={addStaff} deleteStaff={deleteStaff} updateStaffPassword={updateStaffPassword} />}
             {currentView === 'bookings' && <BookingsManager sessions={classSessions} staffList={staffList} addSession={addSession} deleteSession={deleteSession} />}
             {currentView === 'wod_planning' && <WODBuilder wods={wods} addWod={addWod} deleteWod={deleteWod} />}
             {currentView === 'whiteboard' && <Whiteboard wods={wods} scores={wodScores} clients={clients} />}
             {currentView === 'notifications_config' && <NotificationsConfig settings={gymSettings} onUpdateSettings={handleUpdateSettings} />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
