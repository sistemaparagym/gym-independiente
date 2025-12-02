import React, { useState } from 'react';
import { WOD, WODScore, Client } from '../types';
import { Trophy, Flame, Timer, Medal, Search, Calendar, User } from 'lucide-react';

interface WhiteboardProps {
  wods: WOD[];
  scores: WODScore[];
  clients: Client[];
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ wods, scores, clients }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const todaysWod = wods.find(w => w.date === selectedDate);
  
  // Filtrar scores del día y del WOD seleccionado
  const todaysScores = scores.filter(s => s.date === selectedDate && s.wodId === todaysWod?.id);

  // Separar RX y Scaled
  const rxScores = todaysScores.filter(s => s.isRx);
  const scaledScores = todaysScores.filter(s => !s.isRx);

  // Función de ordenamiento inteligente según tipo de WOD
  const sortScores = (scoresList: WODScore[]) => {
      return scoresList.sort((a, b) => {
          // Si es FOR TIME o EMOM, menor es mejor (asumiendo formato MM:SS)
          // Si es AMRAP o STRENGTH, mayor es mejor (asumiendo número)
          
          const valA = a.score.replace(/\D/g, ''); // Quitamos no-números para comparar
          const valB = b.score.replace(/\D/g, '');
          
          if (!todaysWod) return 0;

          if (todaysWod.type === 'FOR_TIME' || todaysWod.type === 'EMOM') {
              // Menor gana (lógica simple de string compare para tiempo 10:00 vs 12:00)
              return a.score.localeCompare(b.score, undefined, { numeric: true });
          } else {
              // Mayor gana (AMRAP, Strength)
              return b.score.localeCompare(a.score, undefined, { numeric: true });
          }
      });
  };

  const sortedRx = sortScores([...rxScores]);
  const sortedScaled = sortScores([...scaledScores]);

  const ScoreList = ({ list, title, color }: { list: WODScore[], title: string, color: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border-t-4 ${color} overflow-hidden`}>
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
            <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded-full text-slate-500">{list.length} Atletas</span>
        </div>
        <div className="divide-y divide-slate-100">
            {list.length > 0 ? list.map((score, idx) => {
                const client = clients.find(c => c.id === score.clientId);
                return (
                    <div key={score.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'}`}>
                                {idx + 1}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">{score.clientName}</p>
                                {/* Opcional: Mostrar avatar o nivel del cliente */}
                            </div>
                        </div>
                        <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded text-sm">
                            {score.score}
                        </div>
                    </div>
                );
            }) : <div className="p-6 text-center text-slate-400 italic text-sm">Sin resultados aún.</div>}
        </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
         <div>
             <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Trophy className="text-yellow-500"/> Leaderboard</h2>
             <p className="text-slate-500">Resultados del día.</p>
         </div>
         <div className="flex items-center gap-2">
             <Calendar className="text-slate-400" size={20}/>
             <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 border rounded-lg font-medium text-slate-700 bg-white shadow-sm"/>
         </div>
      </div>

      {todaysWod ? (
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden mb-6">
              <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                      <span className="bg-orange-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{todaysWod.type}</span>
                      {todaysWod.timeCap && <span className="text-xs text-slate-300 flex items-center gap-1"><Timer size={12}/> Cap {todaysWod.timeCap}'</span>}
                  </div>
                  <h3 className="text-2xl font-black uppercase italic mb-1">{todaysWod.name}</h3>
                  <p className="text-slate-300 text-sm font-mono whitespace-pre-wrap max-w-2xl line-clamp-2">{todaysWod.description}</p>
              </div>
              <Flame className="absolute right-[-20px] bottom-[-20px] text-slate-800 opacity-50" size={140} />
          </div>
      ) : (
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-800 text-center mb-6">
              No hay WOD programado para esta fecha.
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScoreList list={sortedRx} title="Categoría RX" color="border-orange-500" />
          <ScoreList list={sortedScaled} title="Categoría Scaled" color="border-blue-500" />
      </div>
    </div>
  );
};
