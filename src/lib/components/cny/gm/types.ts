export interface GMTeam {
	id: string;
	name: string;
	score: number;
	words: string[];
	guessedWords?: string[];
	missedWords?: string[];
}
