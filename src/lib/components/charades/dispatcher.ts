import type { CharadesMessage } from '$lib/types/charades';
import type { Charades } from './charades.svelte.js';

/**
 * Maps incoming messages to the Charades game state methods.
 * This acts as the bridge between the server and the local reactive state.
 */
export function dispatch(game: Charades, message: CharadesMessage) {
	switch (message.type) {
		case 'SYNC_STATE':
			game.update(message.state);
			break;
		case 'FINISH':
			game.finish(message.summary);
			break;
	}
}
