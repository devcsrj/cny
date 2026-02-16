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

export interface CharadesTurn {
	teamId: string;
	correctWords: string[];
	missedWords: string[];
	score: number;
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
	previewWord: string | null;
	activeTurn: CharadesTurn | null;
}

/**
 * Inbound actions that drive the state machine and game logic.
 * These are typically sent by the GM or triggered by internal timers.
 */
export type CharadesAction =
	| { type: 'ADD_TEAM' }
	| { type: 'SELECT_TEAM'; teamId: string }
	| { type: 'UPDATE_TEAM'; teamId: string; name?: string; words?: string[] }
	| { type: 'DELETE_TEAM'; teamId: string }
	| { type: 'RESET_TEAM'; teamId: string }
	| { type: 'SET_DURATION'; durationMs: number }
	| { type: 'START' }
	| { type: 'PAUSE' }
	| { type: 'RESUME' }
	| { type: 'RESET'; durationMs?: number }
	| { type: 'MARK_CORRECT'; teamId: string; word: string }
	| { type: 'MARK_MISSED'; teamId: string; word: string }
	| { type: 'TIME_UP' }
	| { type: 'FINISH' };

/**
 * Outbound messages sent to all clients (Display and GM) via SSE.
 */
export type CharadesMessage =
	| { type: 'SYNC_STATE'; state: CharadesStateData }
	| { type: 'FINISH'; summary?: CharadesSummary };
