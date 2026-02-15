export interface CharadesSummary {
	score: number;
	correctWords: string[];
	missedWords: string[];
}

export type CharadesCommand =
	| { type: 'SET_WORD'; word: string }
	| {
			type: 'SET_DURATION';
			duration: number;
			remainingTime: number;
			isRunning: boolean;
			serverTimestamp: number;
	  }
	| { type: 'START' }
	| { type: 'PAUSE' }
	| { type: 'RESET' }
	| { type: 'FINISH'; summary?: Partial<CharadesSummary> };

export type CharadesGmCommand =
	| { type: 'SET_DURATION'; seconds: number }
	| { type: 'SELECT_TEAM'; teamId: string }
	| { type: 'START_TIMER' }
	| { type: 'PAUSE_TIMER' }
	| { type: 'RESET_TIMER' }
	| { type: 'ADD_TEAM' }
	| { type: 'UPDATE_TEAM'; team: { id: string; name: string; words: string[] } }
	| { type: 'DELETE_TEAM'; team: { id: string } }
	| { type: 'RESET_TEAM'; team: { id: string } }
	| { type: 'MARK_CORRECT'; team: { id: string }; word: string }
	| { type: 'MARK_MISSED'; team: { id: string }; word: string };
