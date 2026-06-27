export type BracketMatch = {
  id: string;
  round: 'r32' | 'r16' | 'qf' | 'sf' | 'final' | '3rd';
  team1Id: string | null;
  team2Id: string | null;
  score1: number | null;
  score2: number | null;
  winnerId: string | null;
  nextMatchId: string | null;
};

export type BracketState = {
  isLocked: boolean;
  matches: Record<string, BracketMatch>;
};

// Generates the default bracket tree structure
export function getDefaultBracket(): BracketState {
  const matches: Record<string, BracketMatch> = {};

  // Helper to create match
  const addMatch = (id: string, round: BracketMatch['round'], nextMatchId: string | null) => {
    matches[id] = { id, round, team1Id: null, team2Id: null, score1: null, score2: null, winnerId: null, nextMatchId };
  };

  // Final & 3rd Place
  addMatch('m31', 'final', null);
  addMatch('m32', '3rd', null);

  // Semifinals (Left: m29, Right: m30)
  addMatch('m29', 'sf', 'm31');
  addMatch('m30', 'sf', 'm31');

  // Quarterfinals (Left: m25, m26 | Right: m27, m28)
  addMatch('m25', 'qf', 'm29');
  addMatch('m26', 'qf', 'm29');
  addMatch('m27', 'qf', 'm30');
  addMatch('m28', 'qf', 'm30');

  // Round of 16 (Left: m17-m20 | Right: m21-m24)
  addMatch('m17', 'r16', 'm25');
  addMatch('m18', 'r16', 'm25');
  addMatch('m19', 'r16', 'm26');
  addMatch('m20', 'r16', 'm26');
  addMatch('m21', 'r16', 'm27');
  addMatch('m22', 'r16', 'm27');
  addMatch('m23', 'r16', 'm28');
  addMatch('m24', 'r16', 'm28');

  // Round of 32 (Left: m1-m8 | Right: m9-m16)
  addMatch('m1', 'r32', 'm17');
  addMatch('m2', 'r32', 'm17');
  addMatch('m3', 'r32', 'm18');
  addMatch('m4', 'r32', 'm18');
  addMatch('m5', 'r32', 'm19');
  addMatch('m6', 'r32', 'm19');
  addMatch('m7', 'r32', 'm20');
  addMatch('m8', 'r32', 'm20');
  
  addMatch('m9', 'r32', 'm21');
  addMatch('m10', 'r32', 'm21');
  addMatch('m11', 'r32', 'm22');
  addMatch('m12', 'r32', 'm22');
  addMatch('m13', 'r32', 'm23');
  addMatch('m14', 'r32', 'm23');
  addMatch('m15', 'r32', 'm24');
  addMatch('m16', 'r32', 'm24');

  return {
    isLocked: false,
    matches
  };
}

// Function to update the bracket when a team advances or scores change
export function advanceTeam(state: BracketState, matchId: string, winnerId: string | null): BracketState {
  const newState = JSON.parse(JSON.stringify(state)) as BracketState;
  const match = newState.matches[matchId];
  if (!match) return state;

  const oldWinnerId = match.winnerId;
  match.winnerId = winnerId;

  // If there's a next match, propagate the winner
  if (match.nextMatchId) {
    const nextMatch = newState.matches[match.nextMatchId];
    // Is this match feeding team1 or team2?
    // M1, M3, M5... feed team1 of next match. M2, M4, M6... feed team2 of next match.
    // Based on my ID structure, odd match ID usually feeds team1, even feeds team2.
    // Let's deduce it safely:
    const idNum = parseInt(matchId.substring(1));
    const isTeam1 = idNum % 2 !== 0;

    if (isTeam1) {
      if (nextMatch.team1Id === oldWinnerId) {
         nextMatch.team1Id = winnerId; // Update or clear
      } else if (!nextMatch.team1Id || nextMatch.team1Id === winnerId) {
         nextMatch.team1Id = winnerId;
      }
    } else {
      if (nextMatch.team2Id === oldWinnerId) {
         nextMatch.team2Id = winnerId;
      } else if (!nextMatch.team2Id || nextMatch.team2Id === winnerId) {
         nextMatch.team2Id = winnerId;
      }
    }

    // If we removed a winner, we need to recursively remove them from further matches
    if (!winnerId && oldWinnerId) {
       clearTeamFromFutureMatches(newState, match.nextMatchId, oldWinnerId);
    }
  }

  // Handle losers of Semi-finals (m29, m30) moving to 3rd place match (m32)
  if (matchId === 'm29' || matchId === 'm30') {
    const thirdPlaceMatch = newState.matches['m32'];
    if (thirdPlaceMatch) {
      // Find the loser
      let loserId = null;
      if (winnerId) {
        loserId = winnerId === match.team1Id ? match.team2Id : match.team1Id;
      }
      
      const isTeam1 = matchId === 'm29';
      
      if (isTeam1) {
        thirdPlaceMatch.team1Id = loserId;
      } else {
        thirdPlaceMatch.team2Id = loserId;
      }
      
      if (!loserId) {
        // If match was reset, clear the loser from the 3rd place match
        if (thirdPlaceMatch.winnerId && thirdPlaceMatch.winnerId === (isTeam1 ? thirdPlaceMatch.team1Id : thirdPlaceMatch.team2Id)) {
           thirdPlaceMatch.winnerId = null;
        }
      }
    }
  }

  return newState;
}

function clearTeamFromFutureMatches(state: BracketState, startMatchId: string, teamId: string) {
  let currId: string | null = startMatchId;
  while (currId) {
    const match = state.matches[currId];
    if (match.team1Id === teamId) match.team1Id = null;
    if (match.team2Id === teamId) match.team2Id = null;
    if (match.winnerId === teamId) {
      match.winnerId = null;
      currId = match.nextMatchId;
    } else {
      break;
    }
  }
}
