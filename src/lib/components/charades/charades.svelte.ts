import type { CharadesSummary, CharadesStatus, CharadesStateData } from '$lib/types/charades';
import { ReactiveClock } from './clock.svelte.js';

export class Charades {
	word = $state('');
	status = $state<CharadesStatus>('waiting');
	duration = $state(60);
	score = $state(0);
	correctWords = $state<string[]>([]);
	missedWords = $state<string[]>([]);

	private clock = new ReactiveClock();

	timeLeft = $derived(this.clock.timeLeft);

	constructor(word: string = '', duration: number = 60) {
		this.word = word;
		this.duration = duration;
		this.clock.reset(duration * 1000);
	}

	update(data: CharadesStateData) {
		this.word = data.currentWord ?? '';
		this.status = data.status;
		this.clock.sync(data.timer.remainingTime, data.timer.serverTimestamp, data.timer.isRunning);

		if (data.activeTurn) {
			this.score = data.activeTurn.score;
			this.correctWords = data.activeTurn.correctWords;
			this.missedWords = data.activeTurn.missedWords;
		}
	}

	sync(
		duration: number,
		remainingTimeMs: number,
		isRunning: boolean,
		serverTimestamp: number,
		status?: CharadesStatus
	) {
		// Compatibility method for dispatcher.ts and existing code
		this.duration = duration / 1000;
		if (status) this.status = status;
		this.clock.sync(remainingTimeMs, serverTimestamp, isRunning);
	}

	setWord(word: string) {
		this.word = word;
	}

	setDuration(seconds: number) {
		this.duration = seconds;
		if (this.status === 'waiting') {
			this.clock.reset(seconds * 1000);
		}
	}

	start() {
		// No-op, we strictly follow the server state via update()/sync()
	}

	pause() {
		// No-op, we strictly follow the server state via update()/sync()
	}

	reset() {
		this.clock.reset(this.duration * 1000);
		this.status = 'waiting';
		this.score = 0;
		this.correctWords = [];
		this.missedWords = [];
	}

	finish(summary?: Partial<CharadesSummary>) {
		this.status = 'finished';
		if (summary) {
			if (summary.score !== undefined) this.score = summary.score;
			if (summary.correctWords) this.correctWords = summary.correctWords;
			if (summary.missedWords) this.missedWords = summary.missedWords;
		}
	}

	destroy() {
		this.clock.destroy();
	}
}
