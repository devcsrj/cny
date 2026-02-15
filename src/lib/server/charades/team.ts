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
		this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
	}

	get currentWord(): Word | null {
		return this.words[this.currentWordIndex] ?? null;
	}

	get score(): number {
		return this.words.filter((w) => w.wasGuessed).length;
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
