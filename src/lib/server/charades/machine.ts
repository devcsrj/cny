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
import { Team } from './team';
import { Timer } from '../timer';
import { Turn } from './turn';

export interface CharadesContext {
	teams: Map<string, Team>;
	activeTeamId: string | null;
	activeTurn: Turn | null;
	timer: Timer;
}

// Actions & Reducers
const addTeam = reduce<CharadesContext, { type: 'ADD_TEAM' }>((ctx) => {
	const team = new Team();
	const teams = new Map(ctx.teams);
	teams.set(team.id, team);
	return { ...ctx, teams };
});

const selectTeam = reduce<CharadesContext, { type: 'SELECT_TEAM'; teamId: string }>((ctx, ev) => {
	if (!ctx.teams.has(ev.teamId)) return ctx;
	return { ...ctx, activeTeamId: ev.teamId };
});

const updateTeam = reduce<
	CharadesContext,
	{ type: 'UPDATE_TEAM'; teamId: string; name?: string; words?: string[] }
>((ctx, ev) => {
	const team = ctx.teams.get(ev.teamId);
	if (!team) return ctx;
	if (ev.name) team.name = ev.name;
	if (ev.words) team.words = ev.words;
	return { ...ctx };
});

const deleteTeam = reduce<CharadesContext, { type: 'DELETE_TEAM'; teamId: string }>((ctx, ev) => {
	const teams = new Map(ctx.teams);
	teams.delete(ev.teamId);
	let { activeTeamId, activeTurn } = ctx;
	if (activeTeamId === ev.teamId) {
		activeTeamId = null;
		activeTurn = null;
	}
	return { ...ctx, teams, activeTeamId, activeTurn };
});

const resetTeam = reduce<CharadesContext, { type: 'RESET_TEAM'; teamId: string }>((ctx, ev) => {
	ctx.teams.get(ev.teamId)?.reset();
	let { activeTurn } = ctx;
	if (ctx.activeTeamId === ev.teamId) {
		activeTurn = null;
	}
	return { ...ctx, activeTurn };
});

const startTurn = reduce<CharadesContext, { type: 'START' }>((ctx) => {
	if (!ctx.activeTeamId) return ctx;
	const activeTurn = new Turn(ctx.activeTeamId);
	ctx.timer.start();
	return { ...ctx, activeTurn };
});

const pauseTimer = action<CharadesContext, { type: 'PAUSE' }>((ctx) => {
	ctx.timer.pause();
});

const resumeTimer = action<CharadesContext, { type: 'RESUME' }>((ctx) => {
	ctx.timer.start();
});

const markCorrect = reduce<CharadesContext, { type: 'MARK_CORRECT'; teamId: string; word: string }>(
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

const markMissed = reduce<CharadesContext, { type: 'MARK_MISSED'; teamId: string; word: string }>(
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

const resetGame = reduce<CharadesContext, { type: 'RESET'; durationMs?: number }>((ctx, ev) => {
	ctx.timer.reset(ev.durationMs);
	return {
		...ctx,
		activeTurn: null
	};
});

const setDuration = action<CharadesContext, { type: 'SET_DURATION'; durationMs: number }>(
	(ctx, ev) => {
		ctx.timer.reset(ev.durationMs);
	}
);

// Guards
const hasActiveTeam = (ctx: CharadesContext) => ctx.activeTeamId !== null;
const isPoolExhausted = (ctx: CharadesContext) => {
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
	transition('SET_DURATION', to, setDuration)
];

export const createCharadesMachine = (initialCtx: CharadesContext) => {
	return createMachine(
		'waiting',
		{
			waiting: state<Transition<string>>(
				...adminTransitions('waiting'),
				transition('START', 'playing', guard(hasActiveTeam), startTurn)
			),
			playing: state(
				immediate(
					'finished',
					guard(isPoolExhausted),
					action((ctx: CharadesContext) => ctx.timer.pause())
				),
				transition('PAUSE', 'paused', pauseTimer),
				transition('MARK_CORRECT', 'playing', markCorrect),
				transition('MARK_MISSED', 'playing', markMissed),
				transition('TIME_UP', 'finished'),
				transition(
					'FINISH',
					'finished',
					action((ctx: CharadesContext) => ctx.timer.pause())
				)
			),
			paused: state<Transition<string>>(
				...adminTransitions('paused'),
				transition('RESUME', 'playing', resumeTimer),
				transition('RESET', 'waiting', resetGame),
				transition('FINISH', 'finished')
			),
			finished: state<Transition<string>>(
				...adminTransitions('finished'),
				transition('RESET', 'waiting', resetGame),
				transition('START', 'playing', guard(hasActiveTeam), startTurn)
			)
		},
		() => initialCtx
	);
};
