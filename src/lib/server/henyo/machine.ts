import {
	createMachine,
	state,
	transition,
	action,
	reduce,
	guard,
	immediate,
	type Transition
} from 'robot3';
import { Team } from '../word-game/team';
import { Timer } from '../timer';
import { Turn } from '../word-game/turn';
import type { HenyoAction } from '$lib/types/henyo';

export interface HenyoContext {
	teams: Map<string, Team>;
	activeTeamId: string | null;
	activeTurn: Turn | null;
	timer: Timer;
	countdown: number | null;
	showLeaderboard: boolean;
	timeTakenMs: number;
}

// Reducers
const addTeam = reduce<HenyoContext, { type: 'ADD_TEAM' }>((ctx) => {
	const team = new Team();
	const teams = new Map(ctx.teams);
	teams.set(team.id, team);
	return { ...ctx, teams };
});

const selectTeam = reduce<HenyoContext, { type: 'SELECT_TEAM'; teamId: string }>((ctx, ev) => {
	if (!ctx.teams.has(ev.teamId)) return ctx;
	return { ...ctx, activeTeamId: ev.teamId };
});

const updateTeam = reduce<
	HenyoContext,
	{ type: 'UPDATE_TEAM'; teamId: string; name?: string; words?: string[] }
>((ctx, ev) => {
	const team = ctx.teams.get(ev.teamId);
	if (!team) return ctx;
	if (ev.name) team.name = ev.name;
	if (ev.words) team.words = ev.words;
	return { ...ctx };
});

const deleteTeam = reduce<HenyoContext, { type: 'DELETE_TEAM'; teamId: string }>((ctx, ev) => {
	const teams = new Map(ctx.teams);
	teams.delete(ev.teamId);
	let { activeTeamId, activeTurn } = ctx;
	if (activeTeamId === ev.teamId) {
		activeTeamId = null;
		activeTurn = null;
	}
	return { ...ctx, teams, activeTeamId, activeTurn };
});

const resetTeam = reduce<HenyoContext, { type: 'RESET_TEAM'; teamId: string }>((ctx, ev) => {
	ctx.teams.get(ev.teamId)?.reset();
	let { activeTurn } = ctx;
	if (ctx.activeTeamId === ev.teamId) {
		activeTurn = null;
	}
	return { ...ctx, activeTurn };
});

const prepareTurn = reduce<HenyoContext, { type: 'PREPARE' }>((ctx) => {
	return { ...ctx, countdown: 3 };
});

const countdownTick = reduce<HenyoContext, { type: 'COUNTDOWN_TICK'; value: number }>((ctx, ev) => {
	return { ...ctx, countdown: ev.value };
});

const startTurn = reduce<HenyoContext, { type: 'START' }>((ctx) => {
	if (!ctx.activeTeamId) return ctx;
	const activeTurn = new Turn(ctx.activeTeamId);
	ctx.timer.start();
	return { ...ctx, activeTurn, countdown: null };
});

const pauseTimer = action<HenyoContext, { type: 'PAUSE' }>((ctx) => {
	ctx.timer.pause();
});

const resumeTimer = action<HenyoContext, { type: 'RESUME' }>((ctx) => {
	ctx.timer.start();
});

const markCorrect = reduce<HenyoContext, { type: 'MARK_CORRECT'; teamId: string; word: string }>(
	(ctx, ev) => {
		const team = ctx.teams.get(ev.teamId);
		const currentWord = team?.currentWord;
		if (!team || !currentWord || currentWord.text !== ev.word) return ctx;

		team.guessed(ev.word);
		ctx.activeTurn?.recordCorrect(ev.word);
		team.nextWord();

		return { ...ctx };
	}
);

const markMissed = reduce<HenyoContext, { type: 'MARK_MISSED'; teamId: string; word: string }>(
	(ctx, ev) => {
		const team = ctx.teams.get(ev.teamId);
		const currentWord = team?.currentWord;
		if (!team || !currentWord || currentWord.text !== ev.word) return ctx;

		team.missed(ev.word);
		ctx.activeTurn?.recordMissed(ev.word);
		team.nextWord();

		return { ...ctx };
	}
);

const finalizeTurn = reduce<HenyoContext, HenyoAction>((ctx) => {
	ctx.timer.pause();
	const team = ctx.activeTeamId ? ctx.teams.get(ctx.activeTeamId) : null;
	const timerState = ctx.timer.state;
	const timeTaken = timerState.totalDuration - timerState.remainingTime;
	if (team) {
		team.hasPlayed = true;
	}
	return { ...ctx, timeTakenMs: timeTaken };
});

const resetGame = reduce<HenyoContext, { type: 'RESET'; durationMs?: number }>((ctx, ev) => {
	ctx.timer.reset(ev.durationMs);
	return {
		...ctx,
		activeTurn: null,
		countdown: null,
		timeTakenMs: 0
	};
});

const setDuration = action<HenyoContext, { type: 'SET_DURATION'; durationMs: number }>(
	(ctx, ev) => {
		ctx.timer.reset(ev.durationMs);
	}
);

const toggleLeaderboard = reduce<HenyoContext, { type: 'TOGGLE_LEADERBOARD' }>((ctx) => {
	return { ...ctx, showLeaderboard: !ctx.showLeaderboard };
});

// Guards
const hasActiveTeam = (ctx: HenyoContext) => ctx.activeTeamId !== null;
const isPoolExhausted = (ctx: HenyoContext) => {
	const team = ctx.activeTeamId ? ctx.teams.get(ctx.activeTeamId) : null;
	return team?.currentWord === null;
};

// Common Transitions
const adminTransitions = (to: string) => [
	transition('ADD_TEAM', to, addTeam),
	transition('SELECT_TEAM', to, selectTeam),
	transition('UPDATE_TEAM', to, updateTeam),
	transition('DELETE_TEAM', to, deleteTeam),
	transition('RESET_TEAM', to, resetTeam),
	transition('SET_DURATION', to, setDuration),
	transition('TOGGLE_LEADERBOARD', to, toggleLeaderboard)
];

export const createHenyoMachine = (initialCtx: HenyoContext) => {
	return createMachine(
		'waiting',
		{
			waiting: state<Transition<string>>(
				...adminTransitions('waiting'),
				transition('PREPARE', 'starting', guard(hasActiveTeam), prepareTurn)
			),
			starting: state<Transition<string>>(
				...adminTransitions('starting'),
				transition('COUNTDOWN_TICK', 'starting', countdownTick),
				transition('START', 'playing', startTurn),
				transition('RESET', 'waiting', resetGame)
			),
			playing: state(
				immediate('finished', guard(isPoolExhausted), finalizeTurn),
				transition('PAUSE', 'paused', pauseTimer),
				transition('MARK_CORRECT', 'playing', markCorrect),
				transition('MARK_MISSED', 'playing', markMissed),
				transition('TIME_UP', 'finished', finalizeTurn),
				transition('FINISH', 'finished', finalizeTurn)
			),
			paused: state<Transition<string>>(
				...adminTransitions('paused'),
				transition('RESUME', 'playing', resumeTimer),
				transition('RESET', 'waiting', resetGame),
				transition('FINISH', 'finished', finalizeTurn)
			),
			finished: state<Transition<string>>(
				...adminTransitions('finished'),
				transition('RESET', 'waiting', resetGame),
				transition('PREPARE', 'starting', guard(hasActiveTeam), prepareTurn)
			)
		},
		() => initialCtx
	);
};
