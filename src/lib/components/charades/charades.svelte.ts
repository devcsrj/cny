import type { CharadesSummary, CharadesStatus } from '$lib/types/charades';

export class Charades {
	word = $state('');
	status = $state<CharadesStatus>('waiting');
	duration = $state(60);
	score = $state(0);
	correctWords = $state<string[]>([]);
	missedWords = $state<string[]>([]);

	private targetTimestamp = $state<number | null>(null);
	private _now = $state(Date.now());
	private tickerId: ReturnType<typeof setInterval> | null = null;

	timeLeft = $derived.by(() => {
		if (this.status !== 'playing' || !this.targetTimestamp) {
			return this._pausedTimeLeft;
		}
		return Math.max(0, (this.targetTimestamp - this._now) / 1000);
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
			this.startTicker();
		} else {
			this.stopTicker();
			this.targetTimestamp = null;
			this._pausedTimeLeft = remaining / 1000;
		}
	}

	private startTicker() {
		if (typeof window === 'undefined') return;
		if (this.tickerId) return;
		this._now = Date.now();
		this.tickerId = setInterval(() => {
			this._now = Date.now();
			if (this.timeLeft <= 0 && this.status === 'playing') {
				this.stopTicker();
			}
		}, 100);
	}

	private stopTicker() {
		if (this.tickerId) {
			clearInterval(this.tickerId);
			this.tickerId = null;
		}
	}

	resumeTimer() {
		this.status = 'playing';
		if (!this.targetTimestamp) {
			this.targetTimestamp = Date.now() + this._pausedTimeLeft * 1000;
		}
		this.startTicker();
	}

	stopTimer() {
		if (this.status === 'playing') {
			this._pausedTimeLeft = this.timeLeft;
		}
		this.status = 'paused';
		this.targetTimestamp = null;
		this.stopTicker();
	}

	start() {
		this.resumeTimer();
	}

	pause() {
		this.stopTimer();
	}

	reset() {
		this.stopTicker();
		this.targetTimestamp = null;
		this.status = 'waiting';
		this._pausedTimeLeft = this.duration;
		this.score = 0;
		this.correctWords = [];
		this.missedWords = [];
	}

	finish(summary?: Partial<CharadesSummary>) {
		this.stopTicker();
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
		this.stopTicker();
		this.targetTimestamp = null;
	}
}
