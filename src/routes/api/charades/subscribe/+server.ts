import { GAME_MASTER } from '$lib/server/bus';
import type { CharadesCommand } from '$lib/types/charades';
import type { RequestHandler } from '@sveltejs/kit';
import { type Connection, produce } from 'sveltekit-sse';

export const GET: RequestHandler = async () => {
	return produce(commands);
};

function commands({ emit }: Connection) {
	const onCmd = (cmd: CharadesCommand) => {
		emit('message', JSON.stringify(cmd));
	};

	GAME_MASTER.on('charades:command', onCmd);
	return () => {
		GAME_MASTER.off('charades:command', onCmd);
	};
}
