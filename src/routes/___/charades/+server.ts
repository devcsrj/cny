import { GAME_MASTER } from '$lib/server/bus';
import { CHARADES } from '$lib/server/charades';
import type { CharadesGmCommand } from '$lib/types/charades';
import { text, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const c = CHARADES;
	const body = (await request.json()) as CharadesGmCommand;

	switch (body.type) {
		case 'SET_DURATION':
			c.timer.reset(body.seconds * 1000);
			sendDuration();
			break;
		case 'SELECT_TEAM':
			c.setCurrentTeam(body.teamId);
			break;
		case 'START_TIMER':
			c.timer.start();
			sendDuration();
			sendCurrentWord();
			break;
		case 'PAUSE_TIMER':
			c.timer.pause();
			sendDuration();
			break;
		case 'RESET_TIMER':
			c.timer.reset();
			sendDuration();
			GAME_MASTER.emit('charades:command', { type: 'RESET' });
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
			c.nextWord();
			sendCurrentWord();
			break;
		case 'MARK_MISSED':
			c.markMissed(body.team.id, body.word);
			c.nextWord();
			sendCurrentWord();
			break;
	}

	return text('OK');
};

function sendDuration() {
	const t = CHARADES.timer.state;
	GAME_MASTER.emit('charades:command', {
		type: 'SET_DURATION',
		duration: t.totalDuration,
		remainingTime: t.remainingTime,
		isRunning: t.isRunning,
		serverTimestamp: t.serverTimestamp
	});
}

function sendCurrentWord() {
	const currentWord = CHARADES.getCurrentWord();
	if (currentWord) {
		GAME_MASTER.emit('charades:command', {
			type: 'SET_WORD',
			word: currentWord.text
		});
	}
}
