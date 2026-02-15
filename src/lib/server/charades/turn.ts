import type { CharadesTurn } from '$lib/types/charades';

export class Turn {
	public readonly teamId: string;
	public correctWords: string[] = [];
	public missedWords: string[] = [];

	constructor(teamId: string) {
		this.teamId = teamId;
	}

	get score(): number {
		return this.correctWords.length;
	}

	recordCorrect(word: string) {
		this.correctWords.push(word);
	}

	recordMissed(word: string) {
		this.missedWords.push(word);
	}

	getData(): CharadesTurn {
		return {
			teamId: this.teamId,
			correctWords: [...this.correctWords],
			missedWords: [...this.missedWords],
			score: this.score
		};
	}
}
