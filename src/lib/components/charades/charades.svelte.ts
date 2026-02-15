import type { CharadesSummary } from '$lib/types/charades';

export type CharadesStatus = 'waiting' | 'playing' | 'paused' | 'finished';

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

	sync(
		duration: number,
		remainingTimeMs: number,
		isRunning: boolean,
		serverTimestamp: number,
		status?: CharadesStatus
	) {
		this.duration = duration / 1000;
		const latency = (Date.now() - serverTimestamp) / 1000;
		const remaining = remainingTimeMs / 1000;

		if (status) {
			this.status = status;
		} else {
			// Fallback logic if status not provided
			if (isRunning) {
				this.status = 'playing';
			} else if (remaining === 0) {
				this.status = 'finished';
			} else if (remaining < this.duration) {
				this.status = 'paused';
			} else {
				this.status = 'waiting';
			}
		}

		if (this.status === 'playing') {
			this.timeLeft = Math.max(0, remaining - latency);
			this.resumeTimer();
		} else {
			this.timeLeft = remaining;
			this.stopTimer();
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
