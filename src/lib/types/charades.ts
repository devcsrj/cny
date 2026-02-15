export type CharadesStatus = 'waiting' | 'playing' | 'paused' | 'finished';

export interface CharadesSummary {
	score: number;
	correctWords: string[];
	missedWords: string[];
}

export interface CharadesTeam {
	id: string;
	name: string;
	score: number;
	words: string[];
	guessedWords: string[];
	currentWordIndex: number;
}

export interface CharadesStateData {
	teams: CharadesTeam[];
	activeTeamId: string | null;
	status: CharadesStatus;
	timer: {
		totalDuration: number;
		remainingTime: number;
		isRunning: boolean;
		serverTimestamp: number;
	};
	currentWord: string | null;
	roundCorrect: string[];
	roundMissed: string[];
}

export type CharadesCommand =
	| { type: 'SET_WORD'; word: string; index?: number }
	| {
			type: 'SET_DURATION';
			duration: number;
			remainingTime: number;
			isRunning: boolean;
			serverTimestamp: number;
			status: CharadesStatus;
	  }
	| { type: 'START' }
	| { type: 'PAUSE' }
	| { type: 'RESET' }
	| { type: 'FINISH'; summary?: Partial<CharadesSummary> }
	| { type: 'SYNC_STATE'; state: CharadesStateData };

export type CharadesGmCommand =
	| { type: 'SET_DURATION'; seconds: number }
	| { type: 'START_TIMER' }
	| { type: 'PAUSE_TIMER' }
	| { type: 'RESET_TIMER' }
	| { type: 'ADD_TEAM' }
	| { type: 'SELECT_TEAM'; teamId: string }
	| { type: 'UPDATE_TEAM'; team: { id: string; name: string; words: string[] } }
	| { type: 'DELETE_TEAM'; team: { id: string } }
	| { type: 'RESET_TEAM'; team: { id: string } }
	| { type: 'MARK_CORRECT'; team: { id: string }; word: string }
	| { type: 'MARK_MISSED'; team: { id: string }; word: string };
