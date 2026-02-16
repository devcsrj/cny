import { Charades } from '$lib/components/charades/index.js';
import type {
	CharadesMessage,
	CharadesAction,
	CharadesStateData,
	CharadesTeam
} from '$lib/types/charades';

export class CharadesGM {
	teams = $state<CharadesTeam[]>([]);
	activeTeamId = $state<string | null>(null);
	duration = $state(60);
	game: Charades;

	constructor() {
		this.game = new Charades('', 60);
	}

	activeTeam = $derived(this.teams.find((t) => t.id === this.activeTeamId));

	nextWord = $derived.by(() => {
		const team = this.activeTeam;
		if (!team || team.words.length === 0) return '';

		const start = team.currentWordIndex;
		let next = (team.currentWordIndex + 1) % team.words.length;

		// Find next word that wasn't guessed (client side prediction/sync)
		while (team.guessedWords.includes(team.words[next]) && next !== start) {
			next = (next + 1) % team.words.length;
		}

		if (team.guessedWords.includes(team.words[next])) return ''; // Pool exhausted

		return team.words[next];
	});

	// --- Incoming (Observer) Actions ---

	applyCommand(message: CharadesMessage) {
		if (message.type === 'SYNC_STATE') {
			this.syncWithServer(message.state);
			return;
		}

		if (message.type === 'FINISH') {
			this.game.finish(message.summary);
			if (message.summary?.score !== undefined) {
				const team = this.teams.find((t) => t.id === this.activeTeamId);
				if (team) team.score = message.summary.score;
			}
		}
	}

	syncWithServer(state: CharadesStateData) {
		this.game.update(state);
		this.teams = state.teams;
		this.activeTeamId = state.activeTeamId;
		this.duration = state.timer.totalDuration / 1000;
	}

	// --- Outgoing (GM) Controls ---

	selectTeam(id: string) {
		if (this.game.status === 'waiting') {
			this.dispatch({ type: 'SELECT_TEAM', teamId: id });
		}
	}

	setDuration(seconds: number) {
		this.dispatch({ type: 'SET_DURATION', durationMs: seconds * 1000 });
	}

	setTeamWords(id: string, words: string[]) {
		this.dispatch({ type: 'UPDATE_TEAM', id, words });
	}

	setTeamName(id: string, name: string) {
		this.dispatch({ type: 'UPDATE_TEAM', id, name });
	}

	addTeam() {
		this.dispatch({ type: 'ADD_TEAM' });
	}

	deleteTeam(id: string) {
		this.dispatch({ type: 'DELETE_TEAM', id });
	}

	startRound() {
		if (!this.activeTeamId) return;
		this.dispatch({ type: 'START' });
	}

	pause() {
		this.dispatch({ type: 'PAUSE' });
	}

	resume() {
		this.dispatch({ type: 'RESUME' });
	}

	handleCorrect() {
		if (!this.activeTeamId || !this.game.word) return;
		this.dispatch({
			type: 'MARK_CORRECT',
			teamId: this.activeTeamId,
			word: this.game.word
		});
	}

	handleMiss() {
		if (!this.activeTeamId || !this.game.word) return;
		this.dispatch({
			type: 'MARK_MISSED',
			teamId: this.activeTeamId,
			word: this.game.word
		});
	}

	prepareNextRound() {
		this.dispatch({ type: 'RESET' });
	}

	resetGame() {
		this.dispatch({ type: 'RESET' });
		this.teams.forEach((t) => {
			this.dispatch({ type: 'RESET_TEAM', id: t.id });
		});
	}

	// --- Internal ---

	private async dispatch(action: CharadesAction) {
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
}
