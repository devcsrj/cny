import { nanoid } from 'nanoid';
import { Word } from './word';
import type { CharadesSummary } from '$lib/types/charades';

export class Team {
	public id = nanoid();
	public name = 'New Team';
	public words: Word[] = [];
	public currentWordIndex = 0;

	nextWord() {
		if (this.words.length === 0) return;

		const start = this.currentWordIndex;
		let next = (this.currentWordIndex + 1) % this.words.length;

		// Find next word that wasn't guessed
		while (this.words[next].wasGuessed && next !== start) {
			next = (next + 1) % this.words.length;
		}

		this.currentWordIndex = next;
	}

	get currentWord(): Word | null {
		const word = this.words[this.currentWordIndex];
		if (!word || word.wasGuessed) return null;
		return word;
	}

	get score(): number {
		return this.words.filter((w) => w.wasGuessed).length;
	}

	get guessedWords(): string[] {
		return this.words.filter((w) => w.wasGuessed).map((w) => w.text);
	}

	get summary(): CharadesSummary {
		const correct = this.words.filter((w) => w.wasGuessed).map((w) => w.text);
		const missed = this.words.filter((w) => !w.wasGuessed).map((w) => w.text);
		return { score: correct.length, correctWords: correct, missedWords: missed };
	}

	guessed(text: string) {
		this.words.find((w) => w.is(text))?.guessed();
	}

	missed(text: string) {
		this.words.find((w) => w.is(text))?.missed();
	}

	reset() {
		this.words.forEach((w) => w.reset());
		this.currentWordIndex = 0;
	}
}
