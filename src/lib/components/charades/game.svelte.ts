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
	 * Grouped turn statistics for cleaner UI access
	 */
	turn = $derived({
		score: this.activeTurn?.score ?? 0,
		correctWords: this.activeTurn?.correctWords ?? [],
		missedWords: this.activeTurn?.missedWords ?? []
	});

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
