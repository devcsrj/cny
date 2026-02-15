import { nanoid } from 'nanoid';
import { Word } from './word';
import type { CharadesSummary } from '$lib/types/charades';

export class Team {
	private _id: string;
	private _name: string;
	private _words: Word[] = [];
	private _currentWordIndex = 0;

	constructor() {
		this._id = nanoid();
		this._name = 'New Team';
	}

	set name(value: string) {
		this._name = value;
	}

	get id(): string {
		return this._id;
	}

	get name(): string {
		return this._name;
	}

	nextWord() {
		this._currentWordIndex = (this._currentWordIndex + 1) % this._words.length;
	}

	get currentWord(): Word | null {
		return this._words[this._currentWordIndex];
	}

	set words(words: Word[]) {
		this.words = words;
	}

	get words(): Word[] {
		return this._words;
	}

	get score(): number {
		return this._words.filter((word) => word.guessed).length;
	}

	get summary(): CharadesSummary {
		return {
			score: this.score,
			correctWords: this._words.filter((word) => word.guessed).map((word) => word.text),
			missedWords: this._words.filter((word) => !word.guessed).map((word) => word.text)
		};
	}

	guessed(text: string) {
		for (const word of this._words) {
			if (word.is(text)) {
				word.guessed();
				break;
			}
		}
	}

	missed(text: string) {
		for (const word of this._words) {
			if (word.is(text)) {
				word.missed();
				break;
			}
		}
	}

	reset() {
		this._words.forEach((word) => word.reset());
		this._currentWordIndex = 0;
	}
}
