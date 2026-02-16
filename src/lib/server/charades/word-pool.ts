import { Word } from './word';

export class WordPool {
	private _words: Word[] = [];
	private _currentIndex = 0;

	constructor(words: string[] = []) {
		this.setWords(words);
	}

	setWords(words: string[]) {
		this._words = words.map((w) => new Word(w));
		this._currentIndex = 0;
		this.shuffle();
	}

	get words(): Word[] {
		return this._words;
	}

	get currentIndex(): number {
		return this._currentIndex;
	}

	set currentIndex(value: number) {
		this._currentIndex = value;
	}

	get currentWord(): Word | null {
		if (this._words.length === 0) return null;

		const start = this._currentIndex;
		let current = this._currentIndex;

		// Find first non-guessed word starting from current index
		// In a WordPool, we might want to just return the one at index if we assume linear progression
		// but since we skip guessed words, let's keep that logic.
		if (this._words[current].wasGuessed) {
			current = this.findNextAvailableIndex(current);
			if (current === -1) return null;
			this._currentIndex = current;
		}

		return this._words[this._currentIndex];
	}

	next() {
		if (this._words.length === 0) return;
		const nextIndex = this.findNextAvailableIndex(this._currentIndex);
		if (nextIndex !== -1) {
			this._currentIndex = nextIndex;
		}
	}

	peekNext(): Word | null {
		if (this._words.length === 0) return null;
		const nextIndex = this.findNextAvailableIndex(this._currentIndex);
		if (nextIndex !== -1) {
			return this._words[nextIndex];
		}
		return null;
	}

	markGuessed(text: string) {
		const word = this._words.find((w) => w.is(text));
		if (word) {
			word.guessed();
		}
	}

	markMissed(text: string) {
		const word = this._words.find((w) => w.is(text));
		if (word) {
			word.missed();
		}
	}

	reset() {
		this._words.forEach((w) => w.reset());
		this._currentIndex = 0;
	}

	private findNextAvailableIndex(fromIndex: number): number {
		const len = this._words.length;
		if (len === 0) return -1;

		let next = (fromIndex + 1) % len;
		const start = fromIndex;

		while (this._words[next].wasGuessed && next !== start) {
			next = (next + 1) % len;
		}

		return this._words[next].wasGuessed ? -1 : next;
	}

	private shuffle() {
		for (let i = this._words.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this._words[i], this._words[j]] = [this._words[j], this._words[i]];
		}
	}
}
