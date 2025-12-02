import React, { useState } from 'react';
import { ClassSession, Staff } from '../types';
import { Calendar, Clock, Users, Plus, Trash2, User } from 'lucide-react';

interface BookingsManagerProps {
  sessions: ClassSession[];
  staffList: Staff[];
  addSession: (session: ClassSession) => void;
  deleteSession: (id: string) => void;
}

export const BookingsManager: React.FC<BookingsManagerProps> = ({ sessions, staffList, addSession, deleteSession }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado formulario
  const [newTime, setNewTime] = useState('08:00');
  const [newCoachId, setNewCoachId] = useState('');
  const [newCapacity, setNewCapacity] = useState(15);

  const filteredSessions = sessions.filter(s => s.date === selectedDate).sort((a,b) => a.time.localeCompare(b.time));

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const coach = staffList.find(s => s.id === newCoachId);
    if (newTime && coach) {
        const newSession: ClassSession = {
            id: crypto.randomUUID(),
            date: selectedDate,
            time: newTime,
            coachId: coach.id,
            coachName: coach.name,
            capacity: Number(newCapacity),
            attendees: []
        };
        addSession(newSession);
        setIsModalOpen(false);
    } else {
        alert('Selecciona un horario y un coach válido.');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Calendar className="text-orange-600"/> Agenda de Clases</h2>
           <p className="text-slate-500">Configura los horarios disponibles para reservas.</p>
        </div>
        <div className="flex items-center gap-2">
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 border rounded-lg font-medium text-slate-700"/>
            <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 font-bold"><Plus size={20}/> Agregar Turno</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.length > 0 ? filteredSessions.map(session => (
              <div key={session.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group hover:border-orange-300 transition-colors">
                  <button onClick={() => deleteSession(session.id)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  <div className="flex items-center gap-3 mb-3">
                      <div className="bg-orange-100 text-orange-700 p-2 rounded-lg font-bold text-lg"><Clock size={20}/></div>
                      <div>
                          <p className="text-2xl font-bold text-slate-800">{session.time}</p>
                          <p className="text-xs text-slate-500 uppercase font-bold">Horario Inicio</p>
                      </div>
                  </div>
                  <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                          <span className="text-slate-500 flex items-center gap-1"><User size={14}/> Coach:</span>
                          <span className="font-medium text-slate-700">{session.coachName}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-slate-500 flex items-center gap-1"><Users size={14}/> Cupo:</span>
                          <span className="font-bold text-slate-800">{session.attendees.length} / {session.capacity}</span>
                      </div>
                  </div>
                  {/* Barra de ocupación */}
                  <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${session.attendees.length >= session.capacity ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${(session.attendees.length / session.capacity) * 100}%`}}></div>
                  </div>
              </div>
          )) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                  <Calendar size={48} className="mx-auto text-slate-300 mb-2"/>
                  <p className="text-slate-500">No hay clases programadas para este día.</p>
              </div>
          )}
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl">
                  <h3 className="font-bold text-lg mb-4">Nuevo Turno ({selectedDate})</h3>
                  <form onSubmit={handleAddSession} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Horario</label>
                          <input type="time" required value={newTime} onChange={e=>setNewTime(e.target.value)} className="w-full p-2 border rounded-lg"/>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Coach a cargo</label>
                          <select required value={newCoachId} onChange={e=>setNewCoachId(e.target.value)} className="w-full p-2 border rounded-lg bg-white">
                              <option value="">Seleccionar...</option>
                              {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cupo Máximo</label>
                          <input type="number" required min="1" value={newCapacity} onChange={e=>setNewCapacity(Number(e.target.value))} className="w-full p-2 border rounded-lg"/>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={()=>setIsModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
                          <button type="submit" className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700">Crear</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
