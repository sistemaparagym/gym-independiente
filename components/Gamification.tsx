import React from 'react';
import { Client, Reward } from '../types';
import { Trophy, Flame, Gift, Star, Crown, Medal } from 'lucide-react';

interface GamificationProps {
  clients: Client[];
  rewards?: Reward[]; // RECIBE LOS PREMIOS
}

export const Gamification: React.FC<GamificationProps> = ({ clients, rewards }) => {
  const sortedClients = [...clients].sort((a, b) => b.points - a.points);
  const topThree = sortedClients.slice(0, 3);
  const restOfClients = sortedClients.slice(3, 10); 

  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div><p className="text-yellow-100 font-medium">Mayor Racha</p><h3 className="text-3xl font-bold flex items-center gap-2">{Math.max(...clients.map(c => c.streak || 0))} Días <Flame className="text-orange-200 animate-pulse" fill="currentColor" /></h3></div>
            <Trophy size={40} className="text-yellow-200 opacity-50" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
           <div className="flex items-center gap-3"><div className="bg-indigo-100 p-3 rounded-full text-indigo-600"><Star size={24} fill="currentColor" /></div>
             <div><p className="text-slate-500 text-sm">Puntos Totales</p><p className="text-2xl font-bold text-slate-800">{clients.reduce((acc, c) => acc + c.points, 0).toLocaleString()}</p></div>
           </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
           <div className="flex items-center gap-3"><div className="bg-emerald-100 p-3 rounded-full text-emerald-600"><Crown size={24} /></div>
             <div><p className="text-slate-500 text-sm">Nivel Oro</p><p className="text-2xl font-bold text-slate-800">{clients.filter(c => c.level === 'Gold').length} <span className="text-sm font-normal text-slate-400">Miembros</span></p></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between"><h3 className="font-bold flex items-center gap-2"><Trophy size={18} /> Ranking de Atletas</h3><span className="text-xs bg-slate-700 px-2 py-1 rounded">Top 10</span></div>
          <div className="p-4 space-y-4">
            <div className="flex items-end justify-center gap-4 mb-6 pt-4 border-b border-slate-100 pb-6">
              {topThree[1] && <div className="flex flex-col items-center"><div className="w-16 h-16 rounded-full border-4 border-slate-300 bg-slate-100 flex items-center justify-center font-bold text-slate-500 relative">{topThree[1].name.charAt(0)}<div className="absolute -bottom-3 bg-slate-300 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">2</div></div><p className="mt-2 font-bold text-sm text-slate-700">{topThree[1].name}</p><p className="text-xs text-slate-500">{topThree[1].points} pts</p></div>}
              {topThree[0] && <div className="flex flex-col items-center -mt-4"><Crown className="text-yellow-500 mb-1 animate-bounce" size={24} fill="currentColor" /><div className="w-20 h-20 rounded-full border-4 border-yellow-400 bg-yellow-50 flex items-center justify-center font-bold text-yellow-600 text-xl relative shadow-lg">{topThree[0].name.charAt(0)}<div className="absolute -bottom-3 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">1</div></div><p className="mt-2 font-bold text-slate-800">{topThree[0].name}</p><p className="text-xs text-slate-500">{topThree[0].points} pts</p></div>}
              {topThree[2] && <div className="flex flex-col items-center"><div className="w-16 h-16 rounded-full border-4 border-orange-300 bg-orange-50 flex items-center justify-center font-bold text-orange-500 relative">{topThree[2].name.charAt(0)}<div className="absolute -bottom-3 bg-orange-300 text-orange-800 text-xs px-2 py-0.5 rounded-full font-bold">3</div></div><p className="mt-2 font-bold text-sm text-slate-700">{topThree[2].name}</p><p className="text-xs text-slate-500">{topThree[2].points} pts</p></div>}
            </div>
            <div className="space-y-3">
              {restOfClients.map((client, index) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3"><span className="font-mono font-bold text-slate-400 w-4">{index + 4}</span><div className="flex flex-col"><span className="font-medium text-slate-700">{client.name}</span><span className="text-xs text-slate-400 flex items-center gap-1">{client.streak} días racha <Flame size={10} className="text-orange-500" fill="currentColor"/></span></div></div>
                  <span className="font-bold text-indigo-600">{client.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rewards Catalog (DINÁMICO) */}
        <div>
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Gift className="text-purple-500" /> Catálogo de Recompensas</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {rewards && rewards.length > 0 ? rewards.map((reward) => (
               <div key={reward.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                 <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg z-10">{reward.points} pts</div>
                 <div className="flex flex-col items-center text-center pt-2">
                   <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">🎁</div>
                   <h4 className="font-bold text-slate-800">{reward.name}</h4>
                   <button className="mt-4 w-full py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">Canjear</button>
                 </div>
               </div>
             )) : (
               <div className="col-span-2 p-8 text-center border border-dashed border-slate-300 rounded-xl">
                 <p className="text-slate-400">No hay premios configurados aún.</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
