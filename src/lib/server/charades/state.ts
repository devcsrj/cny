import { interpret, type Service } from 'robot3';
import { Timer } from '../timer';
import { Team } from './team';
import type { CharadesStateData, CharadesStatus } from '$lib/types/charades';
import { createCharadesMachine, type CharadesContext, type CharadesEvent } from './machine';

export class CharadesState {
	private service: Service<ReturnType<typeof createCharadesMachine>>;

	constructor(onExpired?: () => void) {
		const timer = new Timer(60000, () => {
			this.service.send('TIME_UP');
			if (onExpired) onExpired();
		});

		const initialContext: CharadesContext = {
			teams: new Map<string, Team>(),
			activeTeamId: null,
			activeTurn: null,
			timer
		};

		const machine = createCharadesMachine(initialContext);
		this.service = interpret(machine, () => {
			// onChange
		});
	}

	get timer() {
		return this.service.context.timer;
	}

	get status(): CharadesStatus {
		return this.service.machine.current as CharadesStatus;
	}

	send(event: CharadesEvent) {
		this.service.send(event);
	}

	startTimer() {
		this.send({ type: 'START' });
	}

	pauseTimer() {
		this.send({ type: 'PAUSE' });
	}

	finishRound() {
		this.send({ type: 'FINISH' });
	}

	resetTimer(durationMs?: number) {
		this.send({ type: 'RESET', durationMs });
	}

	setCurrentTeam(id: Team['id']) {
		this.send({ type: 'SELECT_TEAM', teamId: id });
	}

	getCurrentTeam(): Team | undefined {
		const ctx = this.service.context;
		return ctx.activeTeamId ? ctx.teams.get(ctx.activeTeamId) : undefined;
	}

	resetTeam(id: Team['id']) {
		this.send({ type: 'RESET_TEAM', id });
	}

	nextWord() {
		const team = this.getCurrentTeam();
		if (team) {
			team.nextWord();
		}
	}

	getCurrentWord() {
		return this.getCurrentTeam()?.currentWord ?? null;
	}

	addTeam(): Team {
		const ctx = this.service.context;
		const oldTeams = new Set(ctx.teams.keys());
		this.send({ type: 'ADD_TEAM' });
		const newTeams = this.service.context.teams;
		const addedId = Array.from(newTeams.keys()).find((id) => !oldTeams.has(id));
		return newTeams.get(addedId!)!;
	}

	updateTeam(id: Team['id'], opts: { name?: string; words?: string[] }) {
		this.send({ type: 'UPDATE_TEAM', id, ...opts });
	}

	deleteTeam(id: Team['id']) {
		this.send({ type: 'DELETE_TEAM', id });
	}

	markCorrect(teamId: Team['id'], word: string) {
		this.send({ type: 'MARK_CORRECT', teamId, word });
	}

	markMissed(teamId: Team['id'], word: string) {
		this.send({ type: 'MARK_MISSED', teamId, word });
	}

	getState(): CharadesStateData {
		const ctx = this.service.context;
		return {
			teams: Array.from(ctx.teams.values()).map((t) => ({
				id: t.id,
				name: t.name,
				score: t.score,
				words: t.words,
				guessedWords: t.guessedWords,
				currentWordIndex: t.currentWordIndex
			})),
			activeTeamId: ctx.activeTeamId,
			status: this.status,
			timer: ctx.timer.state,
			currentWord: this.getCurrentWord()?.text ?? null,
			activeTurn: ctx.activeTurn?.getData() ?? null
		};
	}
}
