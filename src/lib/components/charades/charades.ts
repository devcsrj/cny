export type CharadesStatus = 'waiting' | 'playing' | 'paused' | 'finished';

export interface CharadesSummary {
	score: number;
	correctWords: string[];
	missedWords: string[];
}

export class Charades {
	word = $state('');
	status = $state<CharadesStatus>('waiting');
	duration = $state(60);
	timeLeft = $state(60);
	score = $state(0);
	correctWords = $state<string[]>([]);
	missedWords = $state<string[]>([]);

	private timerId: number | null = null;

	constructor(word: string = '', duration: number = 60) {
		this.word = word;
		this.duration = duration;
		this.timeLeft = duration;
	}

	setWord(word: string) {
		this.word = word;
	}

	setDuration(seconds: number) {
		this.duration = seconds;
		if (this.status === 'waiting') {
			this.timeLeft = seconds;
		}
	}

	start() {
		if (this.status === 'playing') return;
		this.status = 'playing';
		this.resumeTimer();
	}

	pause() {
		this.status = 'paused';
		this.stopTimer();
	}

	reset() {
		this.stopTimer();
		this.status = 'waiting';
		this.timeLeft = this.duration;
		this.score = 0;
		this.correctWords = [];
		this.missedWords = [];
	}

	finish(summary?: Partial<CharadesSummary>) {
		this.stopTimer();
		this.status = 'finished';
		this.timeLeft = 0;
		if (summary) {
			if (summary.score !== undefined) this.score = summary.score;
			if (summary.correctWords) this.correctWords = summary.correctWords;
			if (summary.missedWords) this.missedWords = summary.missedWords;
		}
	}

	private resumeTimer() {
		this.stopTimer();
		this.timerId = window.setInterval(() => {
			if (this.timeLeft > 0) {
				this.timeLeft--;
			} else {
				this.finish();
			}
		}, 1000);
	}

	private stopTimer() {
		if (this.timerId) {
			clearInterval(this.timerId);
			this.timerId = null;
		}
	}

	destroy() {
		this.stopTimer();
	}
}
