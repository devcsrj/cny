import { GAME_MASTER } from '../bus';
import { CharadesState } from './state';

export const CHARADES = new CharadesState(() => {
	const currentTeam = CHARADES.getCurrentTeam();
	GAME_MASTER.emit('charades:command', {
		type: 'FINISH',
		summary: currentTeam?.summary
	});
});
