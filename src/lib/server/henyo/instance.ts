import type { HenyoStateData } from '$lib/types/henyo';
import { GAME_MASTER } from '../bus';
import { HenyoState } from './state';

function finished() {
	// For Henyo, the final turn results are already broadcasted via onStateChanged
	// but we can send a dedicated message if needed, similar to Charades.
}

function broadcast(state: HenyoStateData) {
	GAME_MASTER.emit('henyo:command', {
		type: 'SYNC_STATE',
		state
	});
}

export const HENYO = new HenyoState({
	onExpired: finished,
	onStateChanged: broadcast
});
