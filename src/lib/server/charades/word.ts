export class Word {
	constructor(
		public text: string,
		public wasGuessed: boolean = false
	) {}

	is(text: string) {
		return this.text === text;
	}

	guessed() {
		this.wasGuessed = true;
	}

	missed() {
		this.wasGuessed = false;
	}

	reset() {
		this.wasGuessed = false;
	}
}
