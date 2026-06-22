import React, { useState, useEffect } from 'react';
import { BracketState, getDefaultBracket, advanceTeam } from '@/lib/bracket';
import { getTeams } from '@/lib/footballData';
import { Trophy, Lock, Unlock } from 'lucide-react';

export default function Bracket() {
  const [bracket, setBracket] = useState<BracketState>(getDefaultBracket());
  const teams = getTeams();
  const allTeams = Object.values(teams).sort((a, b) => a.name.localeCompare(b.name));

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('world_cup_bracket');
    if (saved) {
      try {
        setBracket(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  // Save to local storage
  const saveBracket = (b: BracketState) => {
    setBracket(b);
    localStorage.setItem('world_cup_bracket', JSON.stringify(b));
  };

  const toggleLock = () => {
    saveBracket({ ...bracket, isLocked: !bracket.isLocked });
  };

  const handleTeamSelect = (matchId: string, position: 'team1Id' | 'team2Id', teamId: string) => {
    if (bracket.isLocked) return;
    const newState = { ...bracket };
    newState.matches[matchId][position] = teamId || null;
    
    // Clear winner if teams change
    if (newState.matches[matchId].winnerId) {
       newState.matches[matchId].winnerId = null;
    }
    saveBracket(newState);
  };

  const handleWinnerSelect = (matchId: string, winnerId: string) => {
    if (!bracket.isLocked) return;
    const newState = advanceTeam(bracket, matchId, winnerId);
    saveBracket(newState);
  };

  // Render a match node
  const renderMatch = (matchId: string) => {
    const match = bracket.matches[matchId];
    if (!match) return null;

    const t1 = match.team1Id ? allTeams.find(t => t.id === match.team1Id) : null;
    const t2 = match.team2Id ? allTeams.find(t => t.id === match.team2Id) : null;

    const isR32 = match.round === 'r32';

    return (
      <div className="flex flex-col gap-[2px] w-full bg-slate-900/80 border border-white/10 rounded p-[2px] md:p-1 shadow-lg relative z-10 transition-transform hover:scale-105 group backdrop-blur-sm">
        {/* Team 1 */}
        <div 
          className={`flex items-center justify-between p-0.5 md:p-1 rounded cursor-pointer transition-colors ${match.winnerId === match.team1Id ? 'bg-blue-600/40 border border-blue-400/50 shadow-[inset_0_0_5px_rgba(59,130,246,0.3)]' : 'hover:bg-white/10'}`}
          onClick={() => {
            if (bracket.isLocked && match.team1Id && match.team2Id) handleWinnerSelect(matchId, match.team1Id);
          }}
        >
          {isR32 && !bracket.isLocked ? (
            <select 
              className="bg-transparent text-white w-full outline-none text-[8px] md:text-[10px] font-bold"
              value={match.team1Id || ''}
              onChange={(e) => handleTeamSelect(matchId, 'team1Id', e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="" className="text-black">Select Team</option>
              {allTeams.map(t => <option key={t.id} value={t.id} className="text-black">{t.name}</option>)}
            </select>
          ) : (
            <div className="flex items-center gap-1 overflow-hidden w-full">
              {t1 ? (
                <>
                  <img src={t1.flag} alt={t1.name} className="w-3 h-2 md:w-4 md:h-3 object-cover rounded-[1px]" />
                  <span className="text-white text-[8px] md:text-[10px] font-bold truncate">{t1.shortName}</span>
                </>
              ) : (
                <span className="text-white/30 text-[8px] md:text-[10px] font-semibold italic">TBD</span>
              )}
            </div>
          )}
        </div>

        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Team 2 */}
        <div 
          className={`flex items-center justify-between p-0.5 md:p-1 rounded cursor-pointer transition-colors ${match.winnerId === match.team2Id ? 'bg-blue-600/40 border border-blue-400/50 shadow-[inset_0_0_5px_rgba(59,130,246,0.3)]' : 'hover:bg-white/10'}`}
          onClick={() => {
            if (bracket.isLocked && match.team1Id && match.team2Id) handleWinnerSelect(matchId, match.team2Id);
          }}
        >
          {isR32 && !bracket.isLocked ? (
            <select 
              className="bg-transparent text-white w-full outline-none text-[8px] md:text-[10px] font-bold"
              value={match.team2Id || ''}
              onChange={(e) => handleTeamSelect(matchId, 'team2Id', e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="" className="text-black">Select Team</option>
              {allTeams.map(t => <option key={t.id} value={t.id} className="text-black">{t.name}</option>)}
            </select>
          ) : (
            <div className="flex items-center gap-1 overflow-hidden w-full">
              {t2 ? (
                <>
                  <img src={t2.flag} alt={t2.name} className="w-3 h-2 md:w-4 md:h-3 object-cover rounded-[1px]" />
                  <span className="text-white text-[8px] md:text-[10px] font-bold truncate">{t2.shortName}</span>
                </>
              ) : (
                <span className="text-white/30 text-[8px] md:text-[10px] font-semibold italic">TBD</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-[80vh] min-h-[600px] bg-[#050B14] overflow-hidden relative flex flex-col p-2 md:p-4 rounded-lg shadow-lg" dir="ltr">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 relative z-20 gap-2">
        <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 uppercase tracking-widest drop-shadow-lg">
          <Trophy className="text-yellow-400 w-6 h-6 md:w-8 md:h-8" />
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Road to the Final</span>
        </h2>
        <div className="flex items-center gap-4">
          {bracket.isLocked && (
            <div className="hidden md:block text-xs font-bold text-blue-400 bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-500/30 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              Click teams to advance them!
            </div>
          )}
          <button 
            onClick={toggleLock}
            className={`px-4 py-2 rounded-full font-black text-xs md:text-sm flex items-center gap-2 transition-all duration-300 shadow-lg ${bracket.isLocked ? 'bg-slate-800 text-red-400 border border-red-500/30 hover:bg-slate-700' : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/50'}`}
          >
            {bracket.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            {bracket.isLocked ? 'UNLOCK BRACKET' : 'LOCK BRACKET'}
          </button>
        </div>
      </div>

      {/* Bracket Layout */}
      <div className="flex justify-between w-full h-full relative px-2">
        
        {/* LEFT SIDE */}
        <div className="flex flex-1 gap-2 md:gap-4 max-w-[40%]">
          {/* R32 Left */}
          <div className="flex flex-col justify-around h-full flex-1 min-w-[70px] md:min-w-[120px]">
            {['m1','m2','m3','m4','m5','m6','m7','m8'].map(m => <div key={m} className="relative w-full">{renderMatch(m)}</div>)}
          </div>
          {/* R16 Left */}
          <div className="flex flex-col justify-around h-full flex-1 min-w-[70px] md:min-w-[120px]">
            {['m17','m18','m19','m20'].map(m => <div key={m} className="relative w-full">{renderMatch(m)}</div>)}
          </div>
          {/* QF Left */}
          <div className="flex flex-col justify-around h-full flex-1 min-w-[70px] md:min-w-[120px]">
            {['m25','m26'].map(m => <div key={m} className="relative w-full">{renderMatch(m)}</div>)}
          </div>
          {/* SF Left */}
          <div className="flex flex-col justify-around h-full flex-1 min-w-[70px] md:min-w-[120px]">
            {['m29'].map(m => <div key={m} className="relative w-full">{renderMatch(m)}</div>)}
          </div>
        </div>

        {/* CENTER FINAL */}
        <div className="flex flex-col justify-center items-center px-2 md:px-4 relative z-20 w-[100px] md:w-[150px]">
          <div className="text-center mb-2 md:mb-4">
            <div className="inline-block px-2 py-1 md:px-4 md:py-1.5 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
              <span className="text-yellow-400 font-black text-[10px] md:text-sm uppercase tracking-[0.1em] drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                Final
              </span>
            </div>
          </div>
          <div className="w-full scale-110 md:scale-125 origin-center shadow-[0_0_30px_rgba(250,204,21,0.15)] rounded-md">
            {renderMatch('m31')}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-1 gap-2 md:gap-4 flex-row-reverse max-w-[40%]">
          {/* R32 Right */}
          <div className="flex flex-col justify-around h-full flex-1 min-w-[70px] md:min-w-[120px]">
            {['m9','m10','m11','m12','m13','m14','m15','m16'].map(m => <div key={m} className="relative w-full">{renderMatch(m)}</div>)}
          </div>
          {/* R16 Right */}
          <div className="flex flex-col justify-around h-full flex-1 min-w-[70px] md:min-w-[120px]">
            {['m21','m22','m23','m24'].map(m => <div key={m} className="relative w-full">{renderMatch(m)}</div>)}
          </div>
          {/* QF Right */}
          <div className="flex flex-col justify-around h-full flex-1 min-w-[70px] md:min-w-[120px]">
            {['m27','m28'].map(m => <div key={m} className="relative w-full">{renderMatch(m)}</div>)}
          </div>
          {/* SF Right */}
          <div className="flex flex-col justify-around h-full flex-1 min-w-[70px] md:min-w-[120px]">
            {['m30'].map(m => <div key={m} className="relative w-full">{renderMatch(m)}</div>)}
          </div>
        </div>

      </div>

    </div>
  );
}
