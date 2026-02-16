import type {
	CharadesAction,
	CharadesStateData,
	CharadesStatus,
	CharadesTeam,
	CharadesTurn
} from '$lib/types/charades';
import { ReactiveClock } from './clock.svelte.js';
import { CharadesDispatcher } from './dispatcher.svelte.js';

export class Charades {
	// --- State ---
	teams = $state<CharadesTeam[]>([]);
	activeTeamId = $state<string | null>(null);
	status = $state<CharadesStatus>('waiting');
	word = $state('');
	previewWord = $state('');
	activeTurn = $state<CharadesTurn | null>(null);
	duration = $state(60); // In seconds
	showLeaderboard = $state(false);

	// --- Modules ---
	private clock = new ReactiveClock();
	private dispatcher = new CharadesDispatcher();

	// --- Derived ---
	timeLeft = $derived(this.clock.timeLeft);
	activeTeam = $derived(this.teams.find((t) => t.id === this.activeTeamId));
	isWin = $derived(this.status === 'finished' && this.timeLeft > 0);

	/**
	 * Logic for what to display on the result screens.
	 * If the round was completed successfully (win), we show the team's total progress.
	 * Otherwise, we show the results of the specific turn.
	 */
	displayStats = $derived.by(() => {
		const team = this.activeTeam;
		const turn = this.activeTurn;

		if (this.isWin && team) {
			const correct = team.guessedWords;
			const missed = team.words.filter((w) => !correct.includes(w));
			return {
				score: team.score,
				correct,
				missed
			};
		}

		return {
			score: turn?.score ?? 0,
			correct: turn?.correctWords ?? [],
			missed: turn?.missedWords ?? []
		};
	});

	// Top-level accessors for components
	score = $derived(this.displayStats.score);
	correctWords = $derived(this.displayStats.correct);
	missedWords = $derived(this.displayStats.missed);

	constructor() {
		this.clock.reset(60 * 1000);
	}

	/**
	 * Synchronize local state with server data
	 */
	update(data: CharadesStateData) {
		this.teams = data.teams;
		this.activeTeamId = data.activeTeamId;
		this.status = data.status;
		this.word = data.currentWord ?? '';
		this.previewWord = data.previewWord ?? '';
		this.activeTurn = data.activeTurn;
		this.duration = data.timer.totalDuration / 1000;
		this.showLeaderboard = data.showLeaderboard;

		this.clock.sync(data.timer.remainingTime, data.timer.serverTimestamp, data.timer.isRunning);
	}

	/**
	 * Dispatch an action to the server
	 */
	async send(action: CharadesAction) {
		return this.dispatcher.send(action);
	}

	destroy() {
		this.clock.destroy();
	}
}
