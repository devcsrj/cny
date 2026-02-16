import { GAME_MASTER } from '$lib/server/bus';
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
			sendDuration();
			break;
		case 'SELECT_TEAM':
			c.setCurrentTeam(body.teamId);
			break;
		case 'START_TIMER':
			c.startTimer();
			sendDuration();
			sendCurrentWord();
			break;
		case 'PAUSE_TIMER':
			c.pauseTimer();
			sendDuration();
			break;
		case 'RESET_TIMER':
			c.resetTimer();
			sendDuration();
			GAME_MASTER.emit('charades:command', { type: 'RESET' });
			break;
		case 'ADD_TEAM':
			c.addTeam();
			broadcastSync();
			break;
		case 'UPDATE_TEAM':
			c.updateTeam(body.team.id, {
				name: body.team.name,
				words: body.team.words
			});
			broadcastSync();
			break;
		case 'DELETE_TEAM':
			c.deleteTeam(body.team.id);
			broadcastSync();
			break;
		case 'RESET_TEAM':
			c.resetTeam(body.team.id);
			broadcastSync();
			break;
		case 'MARK_CORRECT':
			c.markCorrect(body.team.id, body.word);
			if (c.status === 'finished') {
				sendFinish();
			} else {
				sendCurrentWord();
				broadcastSync();
			}
			break;
		case 'MARK_MISSED':
			c.markMissed(body.team.id, body.word);
			if (c.status === 'finished') {
				sendFinish();
			} else {
				sendCurrentWord();
				broadcastSync();
			}
			break;
	}

	return text('OK');
};

function sendFinish() {
	const currentTeam = CHARADES.getCurrentTeam();
	GAME_MASTER.emit('charades:command', {
		type: 'FINISH',
		summary: currentTeam?.summary
	});
	broadcastSync();
}

function sendDuration() {
	const t = CHARADES.timer.state;
	GAME_MASTER.emit('charades:command', {
		type: 'SET_DURATION',
		duration: t.totalDuration,
		remainingTime: t.remainingTime,
		isRunning: t.isRunning,
		serverTimestamp: t.serverTimestamp,
		status: CHARADES.status
	});
}

function broadcastSync() {
	GAME_MASTER.emit('charades:command', {
		type: 'SYNC_STATE',
		state: CHARADES.getState()
	});
}

function sendCurrentWord() {
	const currentWord = CHARADES.getCurrentWord();
	const team = CHARADES.getCurrentTeam();
	if (currentWord && team) {
		GAME_MASTER.emit('charades:command', {
			type: 'SET_WORD',
			word: currentWord.text,
			index: team.currentWordIndex
		});
	} else {
		GAME_MASTER.emit('charades:command', {
			type: 'SET_WORD',
			word: '',
			index: -1
		});
	}
}
