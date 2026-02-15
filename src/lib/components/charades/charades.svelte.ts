import type { CharadesSummary, CharadesStatus } from '$lib/types/charades';

export class Charades {
	word = $state('');
	status = $state<CharadesStatus>('waiting');
	duration = $state(60);
	score = $state(0);
	correctWords = $state<string[]>([]);
	missedWords = $state<string[]>([]);

	private targetTimestamp = $state<number | null>(null);
	private timerId: number | null = null;

	timeLeft = $derived.by(() => {
		if (this.status !== 'playing' || !this.targetTimestamp) {
			return this._pausedTimeLeft;
		}
		return Math.max(0, (this.targetTimestamp - Date.now()) / 1000);
	});

	private _pausedTimeLeft = $state(60);

	constructor(word: string = '', duration: number = 60) {
		this.word = word;
		this.duration = duration;
		this._pausedTimeLeft = duration;
	}

	setWord(word: string) {
		this.word = word;
	}

	setDuration(seconds: number) {
		this.duration = seconds;
		if (this.status === 'waiting') {
			this._pausedTimeLeft = seconds;
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
		const latency = Date.now() - serverTimestamp;
		const remaining = remainingTimeMs;

		if (status) {
			this.status = status;
		}

		if (isRunning) {
			this.targetTimestamp = Date.now() + remaining - latency;
			this.status = 'playing';
		} else {
			this.targetTimestamp = null;
			this._pausedTimeLeft = remaining / 1000;
		}
	}

	resumeTimer() {
		this.status = 'playing';
		// On resume, we need a duration. If we don't have targetTimestamp, we use _pausedTimeLeft
		if (!this.targetTimestamp) {
			this.targetTimestamp = Date.now() + this._pausedTimeLeft * 1000;
		}
	}

	stopTimer() {
		if (this.status === 'playing') {
			this._pausedTimeLeft = this.timeLeft;
		}
		this.status = 'paused';
		this.targetTimestamp = null;
	}

	start() {
		this.resumeTimer();
	}

	pause() {
		this.stopTimer();
	}

	reset() {
		this.targetTimestamp = null;
		this.status = 'waiting';
		this._pausedTimeLeft = this.duration;
		this.score = 0;
		this.correctWords = [];
		this.missedWords = [];
	}

	finish(summary?: Partial<CharadesSummary>) {
		this.targetTimestamp = null;
		this.status = 'finished';
		this._pausedTimeLeft = 0;
		if (summary) {
			if (summary.score !== undefined) this.score = summary.score;
			if (summary.correctWords) this.correctWords = summary.correctWords;
			if (summary.missedWords) this.missedWords = summary.missedWords;
		}
	}

	destroy() {
		this.targetTimestamp = null;
	}
}
