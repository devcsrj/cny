import type { CharadesStateData } from '$lib/types/charades';
import { GAME_MASTER } from '../bus';
import { CharadesState } from './state';

function finished() {
	const currentTeam = CHARADES.getCurrentTeam();
	GAME_MASTER.emit('charades:command', {
		type: 'FINISH',
		summary: currentTeam?.summary
	});
}

function broadcast(state: CharadesStateData) {
	GAME_MASTER.emit('charades:command', {
		type: 'SYNC_STATE',
		state
	});
}

export const CHARADES = new CharadesState({
	onExpired: finished,
	onStateChanged: broadcast
});
