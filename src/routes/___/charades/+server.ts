import { CHARADES } from '$lib/server/charades';
import type { CharadesAction } from '$lib/types/charades';
import { json, text, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	return json(CHARADES.getData());
};

export const POST: RequestHandler = async ({ request }) => {
	const action = (await request.json()) as CharadesAction;
	CHARADES.send(action);
	return text('OK');
};
