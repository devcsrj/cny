import { CHARADES } from '$lib/server/charades';
import type { CharadesGmCommand } from '$lib/types/charades';
import { json, text, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	return json(CHARADES.getState());
};

export const POST: RequestHandler = async ({ request }) => {
	const c = CHARADES;
	const body = (await request.json()) as CharadesGmCommand;

	switch (body.type) {
		case 'SET_DURATION':
			c.resetTimer(body.seconds * 1000);
			break;
		case 'SELECT_TEAM':
			c.setCurrentTeam(body.teamId);
			break;
		case 'START_TIMER':
			c.startTimer();
			break;
		case 'PAUSE_TIMER':
			c.pauseTimer();
			break;
		case 'RESET_TIMER':
			c.resetTimer();
			break;
		case 'ADD_TEAM':
			c.addTeam();
			break;
		case 'UPDATE_TEAM':
			c.updateTeam(body.team.id, {
				name: body.team.name,
				words: body.team.words
			});
			break;
		case 'DELETE_TEAM':
			c.deleteTeam(body.team.id);
			break;
		case 'RESET_TEAM':
			c.resetTeam(body.team.id);
			break;
		case 'MARK_CORRECT':
			c.markCorrect(body.team.id, body.word);
			break;
		case 'MARK_MISSED':
			c.markMissed(body.team.id, body.word);
			break;
	}

	return text('OK');
};
