import type {
	CharadesAction,
	CharadesStateData,
	CharadesStatus,
	CharadesTeam,
	CharadesTurn
} from '$lib/types/charades';
import { ReactiveClock } from './clock.svelte.js';

export class Charades {
	teams = $state<CharadesTeam[]>([]);
	activeTeamId = $state<string | null>(null);
	status = $state<CharadesStatus>('waiting');
	word = $state('');
	previewWord = $state('');
	activeTurn = $state<CharadesTurn | null>(null);
	duration = $state(60); // In seconds
	showLeaderboard = $state(false);

	private clock = new ReactiveClock();
	timeLeft = $derived(this.clock.timeLeft);

	activeTeam = $derived(this.teams.find((t) => t.id === this.activeTeamId));

	score = $derived(this.activeTurn?.score ?? 0);
	correctWords = $derived(this.activeTurn?.correctWords ?? []);
	missedWords = $derived(this.activeTurn?.missedWords ?? []);

	isWin = $derived(this.status === 'finished' && this.timeLeft > 0);

	constructor() {
		this.clock.reset(60 * 1000);
	}

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

	async send(action: CharadesAction) {
		try {
			await fetch('/___/charades', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(action)
			});
		} catch (e) {
			console.error('Failed to dispatch action', action, e);
		}
	}

	destroy() {
		this.clock.destroy();
	}
}
