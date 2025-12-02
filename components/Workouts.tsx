import React, { useState } from 'react';
import { Routine, Client, Exercise } from '../types';
import { Dumbbell, Plus, ChevronRight, UserPlus, Activity, X, Trash2, ListPlus, Edit } from 'lucide-react';

interface WorkoutsProps {
  clients: Client[];
  routines: Routine[];
  addRoutine: (routine: Routine) => void;
  updateRoutine: (id: string, data: Partial<Routine>) => void; // NUEVO
  deleteRoutine: (id: string) => void; // NUEVO
  updateClient: (id: string, data: Partial<Client>) => void;
}

export const Workouts: React.FC<WorkoutsProps> = ({ clients, routines, addRoutine, updateRoutine, deleteRoutine, updateClient }) => {
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // NUEVO: Estado para saber si editamos

  const [newRoutine, setNewRoutine] = useState<Partial<Routine>>({ 
    difficulty: 'Intermedio', 
    exercises: [] 
  });

  const [tempExercise, setTempExercise] = useState<Partial<Exercise>>({
    name: '', machine: '', sets: 3, reps: '10'
  });

  const handleAddExerciseToRoutine = () => {
    if (tempExercise.name && tempExercise.reps) {
      const exercise: Exercise = {
        id: crypto.randomUUID(),
        name: tempExercise.name!,
        machine: tempExercise.machine || 'Peso libre',
        sets: Number(tempExercise.sets) || 3,
        reps: tempExercise.reps!,
        notes: tempExercise.notes || ''
      };
      
      setNewRoutine({
        ...newRoutine,
        exercises: [...(newRoutine.exercises || []), exercise]
      });
      setTempExercise({ name: '', machine: '', sets: 3, reps: '10', notes: '' });
    }
  };

  const handleRemoveExercise = (index: number) => {
    const updated = [...(newRoutine.exercises || [])];
    updated.splice(index, 1);
    setNewRoutine({ ...newRoutine, exercises: updated });
  };

  // Preparar edición
  const openEdit = (routine: Routine) => {
    setNewRoutine(routine);
    setIsEditing(true);
    setCreateModalOpen(true);
  };

  const openCreate = () => {
    setNewRoutine({ difficulty: 'Intermedio', exercises: [] });
    setIsEditing(false);
    setCreateModalOpen(true);
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if(newRoutine.name && newRoutine.exercises && newRoutine.exercises.length > 0) {
        if (isEditing && newRoutine.id) {
            // EDITAR
            updateRoutine(newRoutine.id, newRoutine);
        } else {
            // CREAR
            addRoutine({
                id: crypto.randomUUID(),
                name: newRoutine.name!,
                description: newRoutine.description || '',
                difficulty: newRoutine.difficulty as any,
                exercises: newRoutine.exercises!
            } as Routine);
        }
        setCreateModalOpen(false);
        setNewRoutine({ difficulty: 'Intermedio', exercises: [] });
        setIsEditing(false);
    } else {
        alert('La rutina debe tener nombre y al menos un ejercicio.');
    }
  };

  const handleAssign = (clientId: string) => {
    if (selectedRoutineId) {
        updateClient(clientId, { 
            assignedRoutineId: selectedRoutineId,
            routineStartDate: new Date().toISOString() 
        });
        setAssignModalOpen(false);
        alert('Rutina asignada correctamente.');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex gap-2"><Dumbbell className="text-blue-600"/> Rutinas de Entrenamiento</h2>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-blue-700 transition-colors"><Plus size={20}/> Crear Nueva</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {routines.map(r => (
            <div key={r.id} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-all flex flex-col h-full relative group">
                
                {/* Botones de Acción (Editar / Borrar) */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(r)} className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg" title="Editar"><Edit size={16}/></button>
                    <button onClick={() => deleteRoutine(r.id)} className="p-1.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg" title="Borrar"><Trash2 size={16}/></button>
                </div>

                <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${r.difficulty === 'Principiante' ? 'bg-green-100 text-green-700' : r.difficulty === 'Avanzado' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.difficulty}
                    </span>
                    <Activity className="text-slate-400" size={20} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-800 pr-16">{r.name}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{r.description}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Ejercicios ({r.exercises?.length || 0}):</div>
                    <ul className="text-sm text-slate-600 space-y-1">
                        {r.exercises?.slice(0, 3).map((ex, i) => (
                            <li key={i} className="truncate">• {ex.name}</li>
                        ))}
                        {(r.exercises?.length || 0) > 3 && <li className="text-xs italic text-slate-400">+ {r.exercises!.length - 3} más...</li>}
                    </ul>
                    <button onClick={() => {setSelectedRoutineId(r.id); setAssignModalOpen(true)}} className="w-full py-2 text-blue-600 font-medium border border-blue-100 rounded-lg hover:bg-blue-50 flex justify-center gap-1 mt-2">
                        Asignar a Alumno <ChevronRight size={18}/>
                    </button>
                </div>
            </div>
        ))}
      </div>

      {/* MODAL ASIGNAR */}
      {assignModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e=>e.stopPropagation()}>
              <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
                  <div className="flex justify-between mb-4"><h3 className="font-bold text-lg">Asignar Rutina</h3><button onClick={()=>setAssignModalOpen(false)}><X/></button></div>
                  <div className="space-y-2">
                      {clients.map(c => (
                          <button key={c.id} onClick={() => handleAssign(c.id)} className="w-full text-left p-3 hover:bg-slate-50 rounded border border-slate-100 flex justify-between items-center group transition-colors">
                              <div><p className="font-bold text-slate-700">{c.name}</p><p className="text-xs text-slate-400">{c.plan}</p></div>
                              <UserPlus size={18} className="text-slate-300 group-hover:text-blue-500"/>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* MODAL CREAR / EDITAR RUTINA */}
      {createModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e=>e.stopPropagation()}>
              <div className="bg-white p-0 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                  
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="font-bold text-xl text-slate-800">{isEditing ? 'Editar Rutina' : 'Diseñador de Rutinas'}</h2>
                    <button onClick={()=>setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X/></button>
                  </div>

                  <div className="p-6 overflow-y-auto flex-1 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="col-span-1 md:col-span-2">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                              <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg" value={newRoutine.name || ''} onChange={e=>setNewRoutine({...newRoutine, name:e.target.value})}/>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dificultad</label>
                              <select className="w-full p-2 border border-slate-300 rounded-lg" value={newRoutine.difficulty} onChange={e => setNewRoutine({...newRoutine, difficulty: e.target.value as any})}>
                                  <option value="Principiante">Principiante</option><option value="Intermedio">Intermedio</option><option value="Avanzado">Avanzado</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
                              <input type="text" className="w-full p-2 border border-slate-300 rounded-lg" value={newRoutine.description || ''} onChange={e=>setNewRoutine({...newRoutine, description:e.target.value})}/>
                          </div>
                      </div>

                      <div className="border-t border-slate-100 my-2"></div>

                      <div>
                          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><ListPlus size={18}/> Agregar Ejercicios</h3>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <input type="text" placeholder="Nombre Ejercicio" className="p-2 border rounded text-sm" value={tempExercise.name} onChange={e => setTempExercise({...tempExercise, name: e.target.value})} />
                                  <input type="text" placeholder="Máquina / Equipo" className="p-2 border rounded text-sm" value={tempExercise.machine} onChange={e => setTempExercise({...tempExercise, machine: e.target.value})} />
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                  <input type="number" placeholder="Series" className="p-2 border rounded text-sm" value={tempExercise.sets} onChange={e => setTempExercise({...tempExercise, sets: Number(e.target.value)})} />
                                  <input type="text" placeholder="Reps" className="p-2 border rounded text-sm" value={tempExercise.reps} onChange={e => setTempExercise({...tempExercise, reps: e.target.value})} />
                                  <input type="text" placeholder="Notas" className="p-2 border rounded text-sm" value={tempExercise.notes} onChange={e => setTempExercise({...tempExercise, notes: e.target.value})} />
                              </div>
                              <button type="button" onClick={handleAddExerciseToRoutine} className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors">+ Agregar a la lista</button>
                          </div>
                      </div>

                      <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Ejercicios ({newRoutine.exercises?.length || 0})</h4>
                          <div className="space-y-2">
                              {newRoutine.exercises?.map((ex, idx) => (
                                  <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                      <div>
                                          <p className="font-bold text-slate-800 text-sm">{ex.name}</p>
                                          <p className="text-xs text-slate-500">{ex.sets} x {ex.reps} • {ex.machine}</p>
                                      </div>
                                      <button onClick={() => handleRemoveExercise(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16}/></button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                      <button onClick={()=>setCreateModalOpen(false)} className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-200 rounded-lg">Cancelar</button>
                      <button onClick={handleSaveRoutine} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg">{isEditing ? 'Guardar Cambios' : 'Crear Rutina'}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
