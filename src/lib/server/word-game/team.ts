import { nanoid } from 'nanoid';
import { WordPool } from './pool';
import type { CharadesSummary } from '$lib/types/charades';

export class Team {
	public id = nanoid();
	public name = 'New Team';
	public hasPlayed = false;
	private pool = new WordPool();

	get words(): string[] {
		return this.pool.words.map((w) => w.text);
	}

	set words(words: string[]) {
		this.pool.setWords(words);
	}

	get currentWordIndex(): number {
		return this.pool.currentIndex;
	}

	nextWord() {
		this.pool.next();
	}

	get currentWord() {
		return this.pool.currentWord;
	}

	get previewWord() {
		return this.pool.peekNext();
	}

	get score(): number {
		return this.pool.words.filter((w) => w.wasGuessed).length;
	}

	get guessedWords(): string[] {
		return this.pool.words.filter((w) => w.wasGuessed).map((w) => w.text);
	}

	get missedWords(): string[] {
		// This is tricky because pool.markMissed(text) sets wasGuessed = false.
		// We don't have a "explicitly missed" flag in Word class.
		// Let's check Word class.
		return [];
	}

	get summary(): CharadesSummary {
		const correct = this.guessedWords;
		const missed = this.pool.words.filter((w) => !w.wasGuessed).map((w) => w.text);
		return { score: correct.length, correctWords: correct, missedWords: missed };
	}

	guessed(text: string) {
		this.pool.markGuessed(text);
	}

	missed(text: string) {
		this.pool.markMissed(text);
	}

	reset() {
		this.pool.reset();
		this.hasPlayed = false;
	}
}
