import { interpret, type Service } from 'robot3';
import { Timer } from '../timer';
import { Team } from './team';
import type { CharadesAction, CharadesStateData, CharadesStatus } from '$lib/types/charades';
import { createCharadesMachine, type CharadesContext } from './machine';

export class CharadesState {
	private service: Service<ReturnType<typeof createCharadesMachine>>;

	constructor(opts: {
		onStateChanged?: (state: CharadesStateData) => void;
		onExpired?: () => void;
	}) {
		const onExpired = opts.onExpired || (() => {});
		const timer = new Timer(60000, () => {
			this.service.send({ type: 'TIME_UP' });
			onExpired();
		});

		const initialContext: CharadesContext = {
			teams: new Map<string, Team>(),
			activeTeamId: null,
			activeTurn: null,
			timer
		};

		const machine = createCharadesMachine(initialContext);
		const onStateChanged = opts.onStateChanged || (() => {});
		this.service = interpret(machine, () => onStateChanged(this.getData()));
	}

	get timer() {
		return this.service.context.timer;
	}

	get status(): CharadesStatus {
		return this.service.machine.current as CharadesStatus;
	}

	send(event: CharadesAction) {
		this.service.send(event);
	}

	startTimer() {
		if (this.status === 'paused') {
			this.send({ type: 'RESUME' });
		} else {
			this.send({ type: 'START' });
		}
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

	getData(): CharadesStateData {
		const ctx = this.service.context;
		const currentTeam = this.getCurrentTeam();
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
			currentWord: currentTeam?.currentWord?.text ?? null,
			previewWord: currentTeam?.previewWord?.text ?? null,
			activeTurn: ctx.activeTurn?.getData() ?? null
		};
	}
}
