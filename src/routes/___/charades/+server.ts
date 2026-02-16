import { CHARADES } from '$lib/server/charades';
import type { CharadesAction } from '$lib/types/charades';
import { json, text, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	return json(CHARADES.getData());
};

export const POST: RequestHandler = async ({ request }) => {
	const c = CHARADES;
	const body = (await request.json()) as CharadesAction;

	switch (body.type) {
		case 'SET_DURATION':
			c.resetTimer(body.durationMs);
			break;
		case 'SELECT_TEAM':
			c.setCurrentTeam(body.teamId);
			break;
		case 'START':
			c.startTimer();
			break;
		case 'PAUSE':
			c.pauseTimer();
			break;
		case 'RESET':
			c.resetTimer(body.durationMs);
			break;
		case 'ADD_TEAM':
			c.addTeam();
			break;
		case 'UPDATE_TEAM':
			c.updateTeam(body.id, {
				name: body.name,
				words: body.words
			});
			break;
		case 'DELETE_TEAM':
			c.deleteTeam(body.id);
			break;
		case 'RESET_TEAM':
			c.resetTeam(body.id);
			break;
		case 'MARK_CORRECT':
			c.markCorrect(body.teamId, body.word);
			break;
		case 'MARK_MISSED':
			c.markMissed(body.teamId, body.word);
			break;
	}

	return text('OK');
};
