import { GAME_MASTER } from '$lib/server/bus';
import { CHARADES } from '$lib/server/charades';
import type { CharadesGmCommand } from '$lib/types/charades';
import { text, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const c = CHARADES;

	const body = (await request.json()) as CharadesGmCommand;
	if (body.type === 'SET_DURATION') {
		c.timer.reset(body.seconds * 1000);
		sendDuration();
	} else if (body.type === 'SELECT_TEAM') {
		c.setCurrentTeam(body.teamId);
	} else if (body.type === 'START_TIMER') {
		c.timer.start();
		sendDuration();
		sendCurrentWord();
	} else if (body.type === 'PAUSE_TIMER') {
		c.timer.pause();
		sendDuration();
	} else if (body.type === 'RESET_TIMER') {
		c.timer.reset();
		sendDuration();
		GAME_MASTER.emit('charades:command', { type: 'RESET' });
	} else if (body.type === 'ADD_TEAM') {
		c.addTeam();
	} else if (body.type === 'UPDATE_TEAM') {
		c.updateTeam(body.team.id, {
			name: body.team.name,
			words: body.team.words
		});
	} else if (body.type === 'DELETE_TEAM') {
		c.deleteTeam(body.team.id);
	} else if (body.type === 'RESET_TEAM') {
		c.resetTeam(body.team.id);
	} else if (body.type === 'MARK_CORRECT') {
		c.markCorrect(body.team.id, body.word);
		c.nextWord();
		sendCurrentWord();
	} else if (body.type === 'MARK_MISSED') {
		c.markMissed(body.team.id, body.word);
		c.nextWord();
		sendCurrentWord();
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
