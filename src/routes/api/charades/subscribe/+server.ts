import { GAME_MASTER } from '$lib/server/bus';
import type { CharadesMessage } from '$lib/types/charades';
import type { RequestHandler } from '@sveltejs/kit';
import { produce, type Connection } from 'sveltekit-sse';

export const GET: RequestHandler = async () => {
	return produce(commands);
};

function commands({ emit }: Connection) {
	const onCmd = (msg: CharadesMessage) => {
		emit('message', JSON.stringify(msg));
	};

	GAME_MASTER.on('charades:command', onCmd);
	return () => {
		GAME_MASTER.off('charades:command', onCmd);
	};
}
