export class Word {
	private _text: string;
	private _guessed = false;

	constructor(text: string) {
		this._text = text;
	}

	static same(l: Word, r: Word): boolean {
		return l.text === r.text;
	}

	get text() {
		return this._text;
	}

	set text(value: string) {
		this._text = value;
	}

	get wasGuessed() {
		return this._guessed;
	}

	is(text: string) {
		return this._text === text;
	}

	guessed() {
		this._guessed = true;
	}

	missed() {
		this._guessed = false;
	}
}
