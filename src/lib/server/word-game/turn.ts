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
		if (!this.correctWords.includes(word) && !this.missedWords.includes(word)) {
			this.correctWords.push(word);
		}
	}

	recordMissed(word: string) {
		if (!this.correctWords.includes(word) && !this.missedWords.includes(word)) {
			this.missedWords.push(word);
		}
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
