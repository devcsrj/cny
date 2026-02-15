import type { CharadesCommand } from '$lib/types/charades';
import type { Charades } from './charades.svelte.js';

/**
 * Maps incoming commands to the Charades game state methods.
 * This acts as the bridge between a remote controller (e.g. WebSocket)
 * and the local reactive state.
 */
export function dispatch(game: Charades, command: CharadesCommand) {
	switch (command.type) {
		case 'SYNC_STATE':
			game.update(command.state);
			break;
		case 'SET_WORD':
			game.setWord(command.word);
			break;
		case 'SET_DURATION':
			game.sync(
				command.duration,
				command.remainingTime,
				command.isRunning,
				command.serverTimestamp,
				command.status
			);
			break;
		case 'START':
			game.start();
			break;
		case 'PAUSE':
			game.pause();
			break;
		case 'RESET':
			game.reset();
			break;
		case 'FINISH':
			game.finish(command.summary);
			break;
	}
}
