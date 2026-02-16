import type {
	HenyoAction,
	HenyoStateData,
	HenyoStatus,
	HenyoTeam,
	HenyoTurn
} from '$lib/types/henyo';
import { ReactiveClock } from '../cny/index.js';
import { HenyoDispatcher } from './dispatcher.svelte.js';

export class Henyo {
	// --- State ---
	teams = $state<HenyoTeam[]>([]);
	activeTeamId = $state<string | null>(null);
	status = $state<HenyoStatus>('waiting');
	word = $state('');
	activeTurn = $state<HenyoTurn | null>(null);
	duration = $state(120); // In seconds
	countdown = $state<number | null>(null);
	showLeaderboard = $state(false);

	// --- Modules ---
	private clock = new ReactiveClock();
	private dispatcher = new HenyoDispatcher();

	// --- Derived ---
	timeLeft = $derived(this.clock.timeLeft);
	activeTeam = $derived(this.teams.find((t) => t.id === this.activeTeamId));
	isGameOver = $derived(this.teams.length > 0 && this.teams.every((t) => t.hasPlayed));

	/**
	 * Logic for what to display on the result screens.
	 */
	displayStats = $derived.by(() => {
		const turn = this.activeTurn;

		return {
			score: turn?.score ?? 0,
			correct: turn?.correctWords ?? [],
			missed: turn?.missedWords ?? [],
			timeTakenMs: turn?.timeTakenMs ?? 0
		};
	});

	// Top-level accessors for components
	score = $derived(this.displayStats.score);
	correctWords = $derived(this.displayStats.correct);
	missedWords = $derived(this.displayStats.missed);
	timeTakenMs = $derived(this.displayStats.timeTakenMs);

	constructor() {
		this.clock.reset(120 * 1000);
	}

	/**
	 * Synchronize local state with server data
	 */
	update(data: HenyoStateData) {
		this.teams = data.teams;
		this.activeTeamId = data.activeTeamId;
		this.status = data.status;
		this.word = data.currentWord ?? '';
		this.activeTurn = data.activeTurn;
		this.duration = data.timer.totalDuration / 1000;
		this.countdown = data.countdown;
		this.showLeaderboard = data.showLeaderboard;

		this.clock.sync(data.timer.remainingTime, data.timer.serverTimestamp, data.timer.isRunning);
	}

	/**
	 * Dispatch an action to the server
	 */
	async send(action: HenyoAction) {
		return this.dispatcher.send(action);
	}

	destroy() {
		this.clock.destroy();
	}
}
