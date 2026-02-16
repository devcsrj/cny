import { describe, it, expect, beforeEach } from 'vitest';
import { interpret } from 'robot3';
import { createHenyoMachine, type HenyoContext } from './machine';
import { Team } from '../word-game/team';
import { Timer } from '../timer';

describe('Henyo State Machine', () => {
	let machine: ReturnType<typeof createHenyoMachine>;
	let initialContext: HenyoContext;
	let timer: Timer;

	beforeEach(() => {
		timer = new Timer(120000, () => {});
		initialContext = {
			teams: new Map<string, Team>(),
			activeTeamId: null,
			activeTurn: null,
			timer,
			countdown: null,
			showLeaderboard: false,
			timeTakenMs: 0
		};
		machine = createHenyoMachine(initialContext);
	});

	it('should start in the waiting state', () => {
		const service = interpret(machine, () => {});
		expect(service.machine.current).toBe('waiting');
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

	it('should handle COUNTDOWN_TICK in starting state', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		service.send({ type: 'SELECT_TEAM', teamId });
		service.send({ type: 'PREPARE' });

		service.send({ type: 'COUNTDOWN_TICK', value: 2 });
		expect(service.context.countdown).toBe(2);
	});

	it('should transition to playing when START is sent from starting state', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		const team = service.context.teams.get(teamId)!;
		team.words = ['Apple'];
		service.send({ type: 'SELECT_TEAM', teamId });
		service.send({ type: 'PREPARE' });

		service.send({ type: 'START' });
		expect(service.machine.current).toBe('playing');
		expect(service.context.countdown).toBeNull();
		expect(service.context.timer.state.isRunning).toBe(true);
	});

	it('should finalize turn and record timeTakenMs when pool is exhausted', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		const team = service.context.teams.get(teamId)!;
		team.words = ['Apple'];
		service.send({ type: 'SELECT_TEAM', teamId });
		service.send({ type: 'PREPARE' });
		service.send({ type: 'START' });

		// Mock some time passed
		// In a real test we might want to wait, but here we can just check if it records correctly
		service.send({ type: 'MARK_CORRECT', teamId, word: 'Apple' });

		expect(service.machine.current).toBe('finished');
		expect(service.context.timer.state.isRunning).toBe(false);
		expect(service.context.timeTakenMs).toBeGreaterThanOrEqual(0);
	});

	it('should record correct timeTakenMs', async () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		const team = service.context.teams.get(teamId)!;
		team.words = ['Apple'];
		service.send({ type: 'SELECT_TEAM', teamId });
		service.send({ type: 'PREPARE' });
		service.send({ type: 'START' });

		// Wait 100ms
		await new Promise((resolve) => setTimeout(resolve, 100));

		service.send({ type: 'MARK_CORRECT', teamId, word: 'Apple' });

		expect(service.context.timeTakenMs).toBeGreaterThanOrEqual(100);
	});

	it('should allow starting round again for a team that has played', () => {
		const service = interpret(machine, () => {});
		service.send('ADD_TEAM');
		const teamId = Array.from(service.context.teams.keys())[0];
		const team = service.context.teams.get(teamId)!;
		team.words = ['Apple'];
		service.send({ type: 'SELECT_TEAM', teamId });
		service.send({ type: 'PREPARE' });
		service.send({ type: 'START' });

		// Mark word as correct
		service.send({ type: 'MARK_CORRECT', teamId, word: 'Apple' });

		expect(service.machine.current).toBe('finished');
		expect(team.hasPlayed).toBe(true);
		expect(team.score).toBe(1);

		// GM adds more words
		team.words = ['Apple', 'Banana']; // Apple is already guessed

		// Start again
		service.send({ type: 'PREPARE' });
		expect(service.machine.current).toBe('starting');
		expect(service.context.timer.state.remainingTime).toBe(120000); // Reset to full duration

		service.send({ type: 'START' });
		expect(service.machine.current).toBe('playing');
		expect(team.hasPlayed).toBe(false); // Reset during round
		expect(team.score).toBe(1); // Score preserved
		expect(team.currentWord?.text).toBe('Banana'); // Skips Apple
	});
});
