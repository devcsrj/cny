export interface CharadesSummary {
	score: number;
	correctWords: string[];
	missedWords: string[];
}

export type CharadesCommand =
	| { type: 'SET_WORD'; word: string }
	| { type: 'SET_DURATION'; seconds: number }
	| { type: 'START' }
	| { type: 'PAUSE' }
	| { type: 'RESET' }
	| { type: 'FINISH'; summary?: Partial<CharadesSummary> };
