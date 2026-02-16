import { interpret, type Service } from 'robot3';
import { Timer } from '../timer';
import { Team } from '../word-game/team';
import type { HenyoAction, HenyoStateData, HenyoStatus } from '$lib/types/henyo';
import { createHenyoMachine, type HenyoContext } from './machine';

export class HenyoState {
	private service: Service<ReturnType<typeof createHenyoMachine>>;
	private countdownInterval: NodeJS.Timeout | null = null;
	private teamTimeTaken = new Map<string, number>(); // Store timeTakenMs per team

	constructor(opts: { onStateChanged?: (state: HenyoStateData) => void; onExpired?: () => void }) {
		const onExpired = opts.onExpired || (() => {});
		const timer = new Timer(120000, () => {
			this.service.send({ type: 'TIME_UP' });
			onExpired();
		});

		const initialContext: HenyoContext = {
			teams: new Map<string, Team>(),
			activeTeamId: null,
			activeTurn: null,
			timer,
			countdown: null,
			showLeaderboard: false,
			timeTakenMs: 0
		};

		const machine = createHenyoMachine(initialContext);
		const onStateChanged = opts.onStateChanged || (() => {});
		this.service = interpret(machine, () => {
			// Sync teamTimeTaken to context if we just finished
			if (this.status === 'finished' && this.service.context.activeTeamId) {
				this.teamTimeTaken.set(this.service.context.activeTeamId, this.service.context.timeTakenMs);
			}
			onStateChanged(this.getData());
		});
	}

	get timer() {
		return this.service.context.timer;
	}

	get status(): HenyoStatus {
		return this.service.machine.current as HenyoStatus;
	}

	send(event: HenyoAction) {
		this.service.send(event);
	}

	prepareTurn() {
		if (this.status !== 'waiting' && this.status !== 'finished') return;

		this.send({ type: 'PREPARE' });

		let count = 3;
		if (this.countdownInterval) clearInterval(this.countdownInterval);

		this.countdownInterval = setInterval(() => {
			count--;
			if (count > 0) {
				this.send({ type: 'COUNTDOWN_TICK', value: count });
			} else {
				if (this.countdownInterval) {
					clearInterval(this.countdownInterval);
					this.countdownInterval = null;
				}
				this.send({ type: 'START' });
			}
		}, 1000);
	}

	startTimer() {
		if (this.status === 'paused') {
			this.send({ type: 'RESUME' });
		} else {
			this.prepareTurn();
		}
	}

	pauseTimer() {
		this.send({ type: 'PAUSE' });
	}

	finishRound() {
		this.send({ type: 'FINISH' });
	}

	resetTimer(durationMs?: number) {
		if (this.countdownInterval) {
			clearInterval(this.countdownInterval);
			this.countdownInterval = null;
		}
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
		this.teamTimeTaken.delete(id);
		this.send({ type: 'RESET_TEAM', teamId: id });
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
		this.send({ type: 'UPDATE_TEAM', teamId: id, ...opts });
	}

	deleteTeam(id: Team['id']) {
		this.teamTimeTaken.delete(id);
		this.send({ type: 'DELETE_TEAM', teamId: id });
	}

	markCorrect(teamId: Team['id'], word: string) {
		this.send({ type: 'MARK_CORRECT', teamId, word });
	}

	markMissed(teamId: Team['id'], word: string) {
		this.send({ type: 'MARK_MISSED', teamId, word });
	}

	getData(): HenyoStateData {
		const ctx = this.service.context;
		const currentTeam = this.getCurrentTeam();
		return {
			teams: Array.from(ctx.teams.values()).map((t) => ({
				id: t.id,
				name: t.name,
				score: t.score,
				timeTakenMs: this.teamTimeTaken.get(t.id) || 0,
				words: t.words,
				guessedWords: t.guessedWords,
				currentWordIndex: t.currentWordIndex,
				hasPlayed: t.hasPlayed
			})),
			activeTeamId: ctx.activeTeamId,
			status: this.status,
			timer: ctx.timer.state,
			countdown: ctx.countdown,
			currentWord: currentTeam?.currentWord?.text ?? null,
			activeTurn: ctx.activeTurn
				? {
						teamId: ctx.activeTurn.teamId,
						correctWords: [...ctx.activeTurn.correctWords],
						missedWords: [...ctx.activeTurn.missedWords],
						score: ctx.activeTurn.score,
						timeTakenMs: ctx.timeTakenMs
					}
				: null,
			showLeaderboard: ctx.showLeaderboard
		};
	}
}
