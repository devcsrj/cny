import type { Charades } from './charades';

export type CharadesCommand =
	| { type: 'SET_WORD'; word: string }
	| { type: 'SET_DURATION'; seconds: number }
	| { type: 'START' }
	| { type: 'PAUSE' }
	| { type: 'RESET' }
	| { type: 'FINISH'; score?: number };

/**
 * Maps incoming commands to the Charades game state methods.
 * This acts as the bridge between a remote controller (e.g. WebSocket)
 * and the local reactive state.
 */
export function dispatch(game: Charades, command: CharadesCommand) {
	switch (command.type) {
		case 'SET_WORD':
			game.setWord(command.word);
			break;
		case 'SET_DURATION':
			game.setDuration(command.seconds);
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
			game.finish(command.score);
			break;
	}
}
