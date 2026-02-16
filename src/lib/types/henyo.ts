export type HenyoStatus = 'waiting' | 'starting' | 'playing' | 'paused' | 'finished';

export interface HenyoTeam {
	id: string;
	name: string;
	score: number;
	timeTakenMs: number; // Time elapsed when turn finished
	words: string[];
	guessedWords: string[];
	currentWordIndex: number;
	hasPlayed: boolean;
}

export interface HenyoTurn {
	teamId: string;
	correctWords: string[];
	missedWords: string[];
	score: number;
	timeTakenMs: number;
}

export interface HenyoStateData {
	teams: HenyoTeam[];
	activeTeamId: string | null;
	status: HenyoStatus;
	timer: {
		totalDuration: number;
		remainingTime: number;
		isRunning: boolean;
		serverTimestamp: number;
	};
	countdown: number | null; // 3, 2, 1, or null
	currentWord: string | null;
	activeTurn: HenyoTurn | null;
	showLeaderboard: boolean;
}

export type HenyoAction =
	| { type: 'ADD_TEAM' }
	| { type: 'SELECT_TEAM'; teamId: string }
	| { type: 'UPDATE_TEAM'; teamId: string; name?: string; words?: string[] }
	| { type: 'DELETE_TEAM'; teamId: string }
	| { type: 'RESET_TEAM'; teamId: string }
	| { type: 'SET_DURATION'; durationMs: number }
	| { type: 'PREPARE' } // Moves to 'starting'
	| { type: 'COUNTDOWN_TICK'; value: number }
	| { type: 'START' } // Moves to 'playing'
	| { type: 'PAUSE' }
	| { type: 'RESUME' }
	| { type: 'MARK_CORRECT'; teamId: string; word: string }
	| { type: 'MARK_MISSED'; teamId: string; word: string }
	| { type: 'TIME_UP' }
	| { type: 'FINISH' }
	| { type: 'RESET'; durationMs?: number }
	| { type: 'TOGGLE_LEADERBOARD' };

export type HenyoMessage = { type: 'SYNC_STATE'; state: HenyoStateData };
