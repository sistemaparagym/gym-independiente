import React, { useState } from 'react';
import { Client, GymSettings, CheckIn, Routine, ClassSession, WOD, WODScore } from '../types';
import { QrCode, Trophy, Activity, User, LogOut, Flame, Clock, Dumbbell, CheckCircle, Circle, CheckSquare, History, Calendar, MapPin, AlertCircle } from 'lucide-react';

interface ClientPortalProps {
  client: Client; 
  settings: GymSettings;
  checkIns: CheckIn[];
  routines: Routine[];
  // NUEVOS PROPS
  classSessions: ClassSession[];
  wods: WOD[];
  onLogout: () => void;
  onCompleteSession: (pointsEarned: number) => void;
  onBookClass: (classId: string) => void;
  onCancelBooking: (classId: string) => void;
  onSaveWodScore: (score: WODScore) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ 
    client, settings, checkIns, routines, classSessions, wods, 
    onLogout, onCompleteSession, onBookClass, onCancelBooking, onSaveWodScore 
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'box' | 'qr' | 'history' | 'profile'>('home');
  const activeSession = checkIns.find(c => c.clientId === client.id && !c.checkoutTimestamp);
  const isTraining = !!activeSession;
  
  // Para modo gym tradicional
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  // Para modo CrossFit
  const todayDate = new Date().toISOString().split('T')[0];
  const todaysWod = wods.find(w => w.date === todayDate);
  const [wodScore, setWodScore] = useState('');
  const [isRx, setIsRx] = useState(false);

  // Filtramos clases de hoy y mañana
  const availableClasses = classSessions.filter(s => {
      const sDate = new Date(s.date);
      const today = new Date();
      // Mostramos clases de hoy en adelante (simple logic)
      return sDate >= new Date(today.setHours(0,0,0,0));
  }).sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 5); // Solo las próximas 5

  const myRoutine = routines.find(r => r.id === client.assignedRoutineId);
  const isCrossFitUser = settings.plan === 'CrossFit'; // Si el gym es crossfit, asumimos que el user ve la interfaz adaptada

  const toggleExercise = (exId: string) => {
    const newSet = new Set(completedExercises);
    if (newSet.has(exId)) newSet.delete(exId);
    else newSet.add(exId);
    setCompletedExercises(newSet);
  };

  const handleFinishWorkout = () => {
    const points = 10 + (completedExercises.size * 5);
    if (window.confirm(`¡Bien hecho! ¿Terminar y canjear ${points} puntos?`)) {
      onCompleteSession(points);
      setCompletedExercises(new Set()); 
    }
  };

  const handleSubmitScore = (e: React.FormEvent) => {
      e.preventDefault();
      if(todaysWod && wodScore) {
          onSaveWodScore({
              id: crypto.randomUUID(),
              wodId: todaysWod.id,
              clientId: client.id,
              clientName: client.name,
              date: todayDate,
              score: wodScore,
              isRx
          });
          alert('¡Score guardado!');
          setWodScore('');
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative pb-20 flex flex-col">
        {/* Header */}
        <div className={`p-6 rounded-b-3xl shadow-lg z-10 relative transition-colors duration-500 ${isTraining ? 'bg-emerald-600' : 'bg-slate-900'} text-white`}>
            <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg">{settings.name}</span>
                <button onClick={onLogout}><LogOut size={18} /></button>
            </div>
            <h2 className="text-2xl font-bold">{client.name}</h2>
            <div className="flex items-center gap-4 mt-2">
               {isTraining && <div className="flex items-center gap-2 text-sm animate-pulse"><Clock size={14}/> Entrenando...</div>}
               <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-xs font-bold"><Trophy size={12} className="text-yellow-300"/> {client.points} pts</div>
               {client.balance < 0 && <div className="flex items-center gap-1 bg-red-500 px-2 py-1 rounded text-xs font-bold"><AlertCircle size={12}/> Cuota Vencida</div>}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* VISTA DE BOX (CROSSFIT) - NUEVA PESTAÑA */}
            {activeTab === 'box' && (
                <div className="space-y-6 animate-in fade-in">
                    {/* WOD DEL DÍA */}
                    <div className="bg-slate-900 text-white rounded-xl overflow-hidden shadow-lg">
                        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2"><Flame className="text-orange-500"/> WOD de Hoy</h3>
                            <span className="text-xs text-slate-400">{todayDate}</span>
                        </div>
                        {todaysWod ? (
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-orange-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{todaysWod.type}</span>
                                    {todaysWod.timeCap && <span className="text-xs text-slate-300">Cap: {todaysWod.timeCap}'</span>}
                                </div>
                                <p className="whitespace-pre-wrap font-mono text-sm text-slate-200">{todaysWod.description}</p>
                                
                                {/* Carga de Score */}
                                <form onSubmit={handleSubmitScore} className="mt-4 pt-4 border-t border-slate-700">
                                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Registrar mi Marca</p>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Ej: 15:30 o 5 Rondas" required value={wodScore} onChange={e=>setWodScore(e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"/>
                                        <button type="button" onClick={()=>setIsRx(!isRx)} className={`px-3 py-2 rounded font-bold text-xs border ${isRx ? 'bg-orange-600 border-orange-600 text-white' : 'border-slate-600 text-slate-400'}`}>RX</button>
                                    </div>
                                    <button type="submit" className="w-full mt-2 bg-slate-700 hover:bg-slate-600 py-2 rounded text-xs font-bold uppercase tracking-wider">Guardar Score</button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-500 italic text-sm">No hay WOD cargado hoy.</div>
                        )}
                    </div>

                    {/* PRÓXIMOS TURNOS */}
                    <div>
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Calendar size={18}/> Reservar Clase</h3>
                        <div className="space-y-3">
                            {availableClasses.length > 0 ? availableClasses.map(session => {
                                const isBooked = session.attendees.includes(client.id);
                                const isFull = session.attendees.length >= session.capacity;
                                return (
                                    <div key={session.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-800 text-lg">{session.time}</p>
                                            <p className="text-xs text-slate-500">{new Date(session.date).toLocaleDateString()} • Coach {session.coachName}</p>
                                            <p className={`text-xs font-bold mt-1 ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>{session.attendees.length}/{session.capacity} Lugares</p>
                                        </div>
                                        {isBooked ? (
                                            <button onClick={() => onCancelBooking(session.id)} className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold">Cancelar</button>
                                        ) : (
                                            <button 
                                                onClick={() => onBookClass(session.id)} 
                                                disabled={isFull}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold text-white ${isFull ? 'bg-slate-300' : 'bg-slate-900'}`}
                                            >
                                                {isFull ? 'Lleno' : 'Reservar'}
                                            </button>
                                        )}
                                    </div>
                                );
                            }) : <p className="text-slate-400 text-sm italic">No hay clases disponibles pronto.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* VISTA HOME (RUTINA TRADICIONAL) - Solo visible si no es CrossFit exclusivo o si tiene rutina asignada */}
            {activeTab === 'home' && (
                <>
                    <div className="bg-white border border-slate-200 shadow-md rounded-xl overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div><h3 className="text-slate-800 font-bold flex items-center gap-2"><Dumbbell size={18} className="text-indigo-600"/> Rutina Hoy</h3></div>
                        </div>
                        <div className="p-0">
                            {myRoutine && myRoutine.exercises && myRoutine.exercises.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {myRoutine.exercises.map((ex, idx) => {
                                        const exKey = ex.name + idx; 
                                        const isDone = completedExercises.has(exKey);
                                        return (
                                            <div key={idx} onClick={() => toggleExercise(exKey)} className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${isDone ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}>
                                                <div className={`flex-1 ${isDone ? 'opacity-50' : ''}`}>
                                                    <p className={`font-bold text-sm ${isDone ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{ex.name}</p>
                                                    <div className="flex gap-3 mt-1 text-xs text-slate-500">
                                                        <span className="bg-slate-100 px-1.5 rounded border border-slate-200">{ex.sets}x{ex.reps}</span>
                                                        {ex.machine && <span className="text-blue-500">{ex.machine}</span>}
                                                    </div>
                                                </div>
                                                <div className={`ml-3 ${isDone ? 'text-emerald-500' : 'text-slate-300'}`}>{isDone ? <CheckCircle size={24} fill="currentColor" className="text-emerald-100" /> : <Circle size={24} />}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : ( 
                                <div className="p-8 text-center">
                                    <p className="text-slate-400 text-sm italic">Sin rutina de aparatos asignada.</p>
                                    {isCrossFitUser && <button onClick={()=>setActiveTab('box')} className="mt-2 text-orange-600 text-sm font-bold underline">Ir al WOD del día</button>}
                                </div> 
                            )}
                        </div>
                        {myRoutine && (
                          <div className="p-4 bg-slate-50 border-t border-slate-100">
                             <button onClick={handleFinishWorkout} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"><CheckSquare size={18} /> Terminar y Sumar Puntos</button>
                          </div>
                        )}
                    </div>
                    
                    {!isCrossFitUser && (
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-xl shadow-lg flex justify-between items-center text-white">
                            <div><p className="text-orange-100 text-xs uppercase font-bold">Tu Racha Actual</p><p className="text-3xl font-bold flex items-center gap-2">{client.streak} <span className="text-base font-normal">días</span></p></div>
                            <Flame className="text-white animate-pulse" size={40} fill="currentColor" />
                        </div>
                    )}
                </>
            )}
            
            {/* PESTAÑA DE HISTORIAL */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg mb-2 flex items-center gap-2"><History size={20}/> Últimos Entrenamientos</h3>
                    {client.routineHistory && client.routineHistory.length > 0 ? (
                        <div className="space-y-3">
                            {client.routineHistory.map((historyItem, index) => (
                                <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-slate-800">{historyItem.routineName}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <Calendar size={12}/> {new Date(historyItem.date).toLocaleDateString()} 
                                        </div>
                                    </div>
                                    <div className="text-emerald-600 font-bold text-sm flex flex-col items-center">
                                        +{historyItem.pointsEarned} <span className="text-[10px] text-emerald-400">PTS</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                            <Dumbbell size={40} className="mx-auto mb-2 opacity-20"/>
                            <p>Aún no has completado rutinas.</p>
                        </div>
                    )}
                </div>
            )}
            
            {activeTab === 'qr' && <div className="flex flex-col items-center py-10"><QrCode size={200} className="text-slate-900" /><p className="mt-4 text-slate-500 text-sm">Acceso al Gym</p></div>}
            
            {activeTab === 'profile' && (
                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm space-y-2">
                    <p className="font-bold text-slate-800">Mis Datos</p>
                    <div className="text-sm text-slate-600 flex justify-between border-b py-2"><span>Plan:</span> <span className="font-medium">{client.plan}</span></div>
                    <div className="text-sm text-slate-600 flex justify-between py-2"><span>Saldo:</span> <span className={client.balance < 0 ? 'text-red-500 font-bold' : 'text-green-600'}>${client.balance}</span></div>
                    <div className="text-sm text-slate-600 flex justify-between py-2"><span>Vencimiento:</span> <span>{new Date(client.lastMembershipPayment || client.joinDate).toLocaleDateString()}</span></div>
                </div>
            )}
        </div>

        {/* BOTTOM NAV */}
        <div className="absolute bottom-0 w-full bg-white border-t p-2 flex justify-around pb-4">
            <button onClick={()=>setActiveTab('home')} className={`flex flex-col items-center ${activeTab==='home'?'text-blue-600':'text-slate-400'}`}><Activity/><span className="text-[10px]">Rutina</span></button>
            
            {/* NUEVO BOTÓN BOX */}
            {isCrossFitUser && (
                <button onClick={()=>setActiveTab('box')} className={`flex flex-col items-center ${activeTab==='box'?'text-orange-600':'text-slate-400'}`}><Flame/><span className="text-[10px]">Box</span></button>
            )}

            <button onClick={()=>setActiveTab('qr')} className="bg-slate-900 text-white p-3 rounded-full -mt-8 shadow-lg"><QrCode/></button>
            
            <button onClick={()=>setActiveTab('history')} className={`flex flex-col items-center ${activeTab==='history'?'text-blue-600':'text-slate-400'}`}><History/><span className="text-[10px]">Historial</span></button>
            <button onClick={()=>setActiveTab('profile')} className={`flex flex-col items-center ${activeTab==='profile'?'text-blue-600':'text-slate-400'}`}><User/><span className="text-[10px]">Perfil</span></button>
        </div>
      </div>
    </div>
  );
};
