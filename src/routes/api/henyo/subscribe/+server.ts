import { GAME_MASTER } from '$lib/server/bus';
import type { HenyoMessage } from '$lib/types/henyo';
import type { RequestHandler } from '@sveltejs/kit';
import { produce, type Connection } from 'sveltekit-sse';

export const GET: RequestHandler = async () => {
	return produce(commands);
};

function commands({ emit }: Connection) {
	const onCmd = (msg: HenyoMessage) => {
		emit('message', JSON.stringify(msg));
	};

	GAME_MASTER.on('henyo:command', onCmd);
	return () => {
		GAME_MASTER.off('henyo:command', onCmd);
	};
}
