import React, { useState } from 'react';
import { WOD, WodType } from '../types';
import { Dumbbell, Plus, Trash2, Calendar, Timer, Flame, FileText } from 'lucide-react';

interface WODBuilderProps {
  wods: WOD[];
  addWod: (wod: WOD) => void;
  deleteWod: (id: string) => void;
}

export const WODBuilder: React.FC<WODBuilderProps> = ({ wods, addWod, deleteWod }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<WodType>('AMRAP');
  const [desc, setDesc] = useState('');
  const [timeCap, setTimeCap] = useState(20);

  const todaysWod = wods.find(w => w.date === selectedDate);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addWod({
        id: crypto.randomUUID(),
        date: selectedDate,
        name,
        type,
        description: desc,
        timeCap
    });
    setIsModalOpen(false);
    // Reset basic fields
    setName(''); setDesc('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Flame className="text-red-600"/> Programación WOD</h2>
           <p className="text-slate-500">Diseña el entrenamiento del día.</p>
        </div>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 border rounded-lg font-medium text-slate-700"/>
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 min-h-[400px]">
          {todaysWod ? (
              <div className="bg-white shadow-lg rounded-xl overflow-hidden max-w-2xl mx-auto border-t-4 border-slate-900">
                  <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <span className="inline-block bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-widest">{todaysWod.type}</span>
                              <h3 className="text-3xl font-black text-slate-800 uppercase italic">{todaysWod.name}</h3>
                          </div>
                          <button onClick={() => deleteWod(todaysWod.id)} className="text-slate-300 hover:text-red-500"><Trash2/></button>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-6 text-sm text-slate-600 font-medium">
                          <span className="flex items-center gap-1"><Calendar size={16}/> {todaysWod.date}</span>
                          {todaysWod.timeCap && <span className="flex items-center gap-1"><Timer size={16}/> Time Cap: {todaysWod.timeCap}'</span>}
                      </div>

                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                          <p className="whitespace-pre-wrap font-mono text-slate-700 text-lg leading-relaxed">{todaysWod.description}</p>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <Dumbbell size={64} className="text-slate-200 mb-4"/>
                  <h3 className="text-xl font-bold text-slate-600">No hay WOD programado</h3>
                  <p className="text-slate-400 mb-6">El día {selectedDate} está libre.</p>
                  <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-slate-800"><Plus/> Crear WOD</button>
              </div>
          )}
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                  <div className="bg-slate-900 p-4 text-white font-bold flex justify-between items-center">
                      <span>Nuevo WOD - {selectedDate}</span>
                      <button onClick={()=>setIsModalOpen(false)}>✕</button>
                  </div>
                  <form onSubmit={handleSave} className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre (Opcional)</label>
                              <input type="text" placeholder="Ej: Murph" value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded-lg"/>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Modalidad</label>
                              <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full p-2 border rounded-lg bg-white">
                                  <option value="AMRAP">AMRAP</option>
                                  <option value="EMOM">EMOM</option>
                                  <option value="FOR_TIME">FOR TIME</option>
                                  <option value="TABATA">TABATA</option>
                                  <option value="STRENGTH">STRENGTH / PESO</option>
                              </select>
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción del Trabajo</label>
                          <textarea required rows={6} placeholder="Ej:&#10;5 Pull Ups&#10;10 Push Ups&#10;15 Squats" value={desc} onChange={e=>setDesc(e.target.value)} className="w-full p-3 border rounded-lg font-mono text-sm bg-slate-50"></textarea>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time Cap (Minutos)</label>
                          <input type="number" value={timeCap} onChange={e=>setTimeCap(Number(e.target.value))} className="w-full p-2 border rounded-lg"/>
                      </div>
                      <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800">Guardar Entrenamiento</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
