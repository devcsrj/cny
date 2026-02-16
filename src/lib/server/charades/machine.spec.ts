import { describe, it, expect, beforeEach } from 'vitest';
import { interpret } from 'robot3';
import { createCharadesMachine, type CharadesContext } from './machine';
import { Team } from '../word-game/team';
import { Timer } from '../timer';

describe('Charades State Machine', () => {
	let machine: ReturnType<typeof createCharadesMachine>;
	let initialContext: CharadesContext;
	let timer: Timer;

	beforeEach(() => {
		timer = new Timer(60000, () => {});
		initialContext = {
			teams: new Map<string, Team>(),
			activeTeamId: null,
			activeTurn: null,
			timer,
			countdown: null,
			showLeaderboard: false
		};
		machine = createCharadesMachine(initialContext);
	});

	it('should start in the waiting state', () => {
		const service = interpret(machine, () => {});
		expect(service.machine.current).toBe('waiting');
	});

	it('should handle ADD_TEAM', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');

		const ctx = service.context;
		expect(ctx.teams.size).toBe(1);
		const team = Array.from(ctx.teams.values())[0];
		expect(team.name).toBe('New Team');
	});

	it('should handle SELECT_TEAM', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];

		service.send({ type: 'SELECT_TEAM', teamId });
		expect(service.context.activeTeamId).toBe(teamId);
	});

	it('should transition to starting when PREPARE is sent with an active team', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		service.send({ type: 'SELECT_TEAM', teamId });

		service.send({ type: 'PREPARE' });
		expect(service.machine.current).toBe('starting');
		expect(service.context.countdown).toBe(3);
	});

	it('should transition to playing when START is sent from starting state', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		service.context.teams.get(teamId)!.words = ['Apple'];
		service.send({ type: 'SELECT_TEAM', teamId });
		service.send({ type: 'PREPARE' });

		service.send({ type: 'START' });
		expect(service.machine.current).toBe('playing');
		expect(service.context.activeTurn).not.toBeNull();
		expect(service.context.timer.state.isRunning).toBe(true);
		expect(service.context.countdown).toBeNull();
	});

	it('should NOT transition to starting when PREPARE is sent without an active team', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');

		service.send({ type: 'PREPARE' });
		expect(service.machine.current).toBe('waiting');
	});

	it('should handle MARK_CORRECT in playing state', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		const team = service.context.teams.get(teamId)!;
		team.words = ['Apple', 'Banana'];

		service.send({ type: 'SELECT_TEAM', teamId });
		service.send({ type: 'PREPARE' });
		service.send({ type: 'START' });

		const currentWord = team.currentWord?.text;
		expect(currentWord).toBeDefined();

		service.send({ type: 'MARK_CORRECT', teamId, word: currentWord! });

		expect(team.score).toBe(1);
		expect(service.context.activeTurn?.score).toBe(1);
		expect(team.currentWord?.text).not.toBe(currentWord);
	});

	it('should transition to paused and back to playing', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		service.context.teams.get(teamId)!.words = ['Apple'];
		service.send({ type: 'SELECT_TEAM', teamId });
		service.send({ type: 'PREPARE' });
		service.send({ type: 'START' });

		service.send({ type: 'PAUSE' });
		expect(service.machine.current).toBe('paused');
		expect(service.context.timer.state.isRunning).toBe(false);

		service.send({ type: 'RESUME' });
		expect(service.machine.current).toBe('playing');
		expect(service.context.timer.state.isRunning).toBe(true);
	});

	it('should transition to finished when TIME_UP is sent', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		service.send({ type: 'SELECT_TEAM', teamId });
		service.send({ type: 'PREPARE' });
		service.send({ type: 'START' });

		service.send({ type: 'TIME_UP' });
		expect(service.machine.current).toBe('finished');
	});

	it('should transition to finished immediately when pool is exhausted', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		const team = service.context.teams.get(teamId)!;
		team.words = ['Apple'];

		service.send({ type: 'SELECT_TEAM', teamId });
		service.send({ type: 'PREPARE' });
		service.send({ type: 'START' });

		service.send({ type: 'MARK_CORRECT', teamId, word: 'Apple' });

		expect(service.machine.current).toBe('finished');
		expect(service.context.timer.state.isRunning).toBe(false);
	});

	it('should reset game state when RESET is sent in finished state', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		service.send({ type: 'SELECT_TEAM', teamId });
		service.send({ type: 'PREPARE' });
		service.send({ type: 'START' });
		service.send({ type: 'TIME_UP' });

		service.send({ type: 'RESET' });
		expect(service.machine.current).toBe('waiting');
		expect(service.context.activeTurn).toBeNull();
		expect(service.context.countdown).toBeNull();
	});

	it('should handle TOGGLE_LEADERBOARD in waiting, paused, and finished states', () => {
		const service = interpret(machine, () => {});

		// Waiting state
		service.send('TOGGLE_LEADERBOARD');
		expect(service.context.showLeaderboard).toBe(true);
		service.send('TOGGLE_LEADERBOARD');
		expect(service.context.showLeaderboard).toBe(false);

		// Paused state
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		service.context.teams.get(teamId)!.words = ['Apple'];
		service.send({ type: 'SELECT_TEAM', teamId });
		service.send({ type: 'PREPARE' });
		service.send({ type: 'START' });
		service.send({ type: 'PAUSE' });
		expect(service.machine.current).toBe('paused');

		service.send('TOGGLE_LEADERBOARD');
		expect(service.context.showLeaderboard).toBe(true);

		// Finished state
		service.send({ type: 'FINISH' });
		expect(service.machine.current).toBe('finished');
		service.send('TOGGLE_LEADERBOARD');
		expect(service.context.showLeaderboard).toBe(false);
	});

	it('should NOT allow TOGGLE_LEADERBOARD in playing state', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		service.context.teams.get(teamId)!.words = ['Apple'];
		service.send({ type: 'SELECT_TEAM', teamId });
		service.send({ type: 'PREPARE' });
		service.send({ type: 'START' });
		expect(service.machine.current).toBe('playing');

		const initialStatus = service.context.showLeaderboard;
		service.send('TOGGLE_LEADERBOARD');
		expect(service.context.showLeaderboard).toBe(initialStatus);
	});

	it('should preserve scores when updating a team word list', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		const team = service.context.teams.get(teamId)!;

		// Initial words and mark one as correct
		team.words = ['Apple', 'Banana'];
		team.guessed('Apple');
		expect(team.score).toBe(1);

		// Update words, including the guessed one
		service.send({
			type: 'UPDATE_TEAM',
			teamId,
			words: ['Apple', 'Cherry', 'Date']
		});

		// Apple should still be guessed
		expect(team.score).toBe(1);
		expect(team.guessedWords).toContain('Apple');

		// Update words, removing the guessed one
		service.send({
			type: 'UPDATE_TEAM',
			teamId,
			words: ['Cherry', 'Date']
		});
		expect(team.score).toBe(0);
	});
});
