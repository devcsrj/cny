import { HENYO } from '$lib/server/henyo';
import type { HenyoAction } from '$lib/types/henyo';
import { json, text, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	return json(HENYO.getData());
};

export const POST: RequestHandler = async ({ request }) => {
	const action = (await request.json()) as HenyoAction;
	HENYO.send(action);
	return text('OK');
};
