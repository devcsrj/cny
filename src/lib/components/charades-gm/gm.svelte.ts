import { Charades } from '$lib/components/charades/index.js';
import type {
	CharadesCommand,
	CharadesGmCommand,
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
		const nextIndex = (team.currentWordIndex + 1) % team.words.length;
		return team.words[nextIndex];
	});

	// --- Incoming (Observer) Actions ---

	applyCommand(command: CharadesCommand) {
		if (command.type === 'SET_WORD') {
			this.game.setWord(command.word);
			const team = this.teams.find((t) => t.id === this.activeTeamId);
			if (team && command.index !== undefined) {
				team.currentWordIndex = command.index;
			}
		} else if (command.type === 'SET_DURATION') {
			this.duration = command.duration / 1000;
			this.game.sync(
				command.duration,
				command.remainingTime,
				command.isRunning,
				command.serverTimestamp
			);
		} else if (command.type === 'START') {
			this.game.start();
		} else if (command.type === 'PAUSE') {
			this.game.pause();
		} else if (command.type === 'RESET') {
			this.game.reset();
		} else if (command.type === 'FINISH') {
			this.game.finish(command.summary);
			if (command.summary?.score !== undefined) {
				const team = this.teams.find((t) => t.id === this.activeTeamId);
				if (team) team.score = command.summary.score;
			}
		} else if (command.type === 'SYNC_STATE') {
			this.syncWithServer(command.state);
		}
	}

	syncWithServer(state: CharadesStateData) {
		this.teams = state.teams;
		this.activeTeamId = state.activeTeamId;
		if (state.currentWord) this.game.setWord(state.currentWord);

		const t = state.timer;
		this.duration = t.totalDuration / 1000;
		this.game.sync(t.totalDuration, t.remainingTime, t.isRunning, t.serverTimestamp);
	}

	// --- Outgoing (GM) Controls ---

	selectTeam(id: string) {
		if (this.game.status === 'waiting') {
			this.dispatch({ type: 'SELECT_TEAM', teamId: id });
		}
	}

	setDuration(seconds: number) {
		this.dispatch({ type: 'SET_DURATION', seconds });
	}

	setTeamWords(id: string, words: string[]) {
		const team = this.teams.find((t) => t.id === id);
		if (team) {
			this.dispatch({ type: 'UPDATE_TEAM', team: { id, name: team.name, words } });
		}
	}

	setTeamName(id: string, name: string) {
		const team = this.teams.find((t) => t.id === id);
		if (team) {
			this.dispatch({ type: 'UPDATE_TEAM', team: { id, name, words: team.words } });
		}
	}

	addTeam() {
		this.dispatch({ type: 'ADD_TEAM' });
	}

	deleteTeam(id: string) {
		this.dispatch({ type: 'DELETE_TEAM', team: { id } });
	}

	startRound() {
		if (!this.activeTeamId) return;
		this.dispatch({ type: 'START_TIMER' });
	}

	handleCorrect() {
		if (!this.activeTeamId) return;
		this.dispatch({
			type: 'MARK_CORRECT',
			team: { id: this.activeTeamId },
			word: this.game.word
		});
	}

	handleMiss() {
		if (!this.activeTeamId) return;
		this.dispatch({
			type: 'MARK_MISSED',
			team: { id: this.activeTeamId },
			word: this.game.word
		});
	}

	prepareNextRound() {
		this.dispatch({ type: 'RESET_TIMER' });
	}

	resetGame() {
		this.dispatch({ type: 'RESET_TIMER' });
		this.teams.forEach((t) => {
			this.dispatch({ type: 'RESET_TEAM', team: { id: t.id } });
		});
	}

	// --- Internal ---

	private async dispatch(command: CharadesGmCommand) {
		try {
			await fetch('/___/charades', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(command)
			});
		} catch (e) {
			console.error('Failed to dispatch command', command, e);
		}
	}
}
