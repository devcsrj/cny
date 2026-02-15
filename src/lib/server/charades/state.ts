import { Timer } from '../timer';
import { Team } from './team';
import { Word } from './word';
import type { CharadesStateData, CharadesStatus } from '$lib/types/charades';

export class CharadesState {
	private readonly teams = new Map<string, Team>();
	private activeTeamId: string | null = null;
	private _status: CharadesStatus = 'waiting';

	private readonly _timer: Timer;

	constructor(onExpired?: () => void) {
		this._timer = new Timer(60000, () => {
			this._status = 'finished';
			if (onExpired) onExpired();
		});
	}

	get timer() {
		return this._timer;
	}

	get status() {
		return this._status;
	}

	startTimer() {
		this._timer.start();
		this._status = 'playing';
	}

	pauseTimer() {
		this._timer.pause();
		this._status = 'paused';
	}

	resetTimer(durationMs?: number) {
		this._timer.reset(durationMs);
		this._status = 'waiting';
	}

	setCurrentTeam(id: Team['id']) {
		if (this.teams.has(id)) {
			this.activeTeamId = id;
		}
	}

	getCurrentTeam(): Team | undefined {
		return this.activeTeamId ? this.teams.get(this.activeTeamId) : undefined;
	}

	resetTeam(id: Team['id']) {
		this.teams.get(id)?.reset();
	}

	nextWord() {
		this.getCurrentTeam()?.nextWord();
	}

	getCurrentWord(): Word | null {
		return this.getCurrentTeam()?.currentWord ?? null;
	}

	addTeam(): Team {
		const team = new Team();
		this.teams.set(team.id, team);
		return team;
	}

	updateTeam(id: Team['id'], opts: { name?: string; words?: string[] }) {
		const team = this.teams.get(id);
		if (!team) return;

		if (opts.name) team.name = opts.name;
		if (opts.words) {
			team.words = opts.words.map((word) => new Word(word));
		}
	}

	deleteTeam(id: Team['id']) {
		this.teams.delete(id);
		if (this.activeTeamId === id) {
			this.activeTeamId = null;
		}
	}

	markCorrect(teamId: Team['id'], word: string) {
		this.teams.get(teamId)?.guessed(word);
	}

	markMissed(teamId: Team['id'], word: string) {
		this.teams.get(teamId)?.missed(word);
	}

	getState(): CharadesStateData {
		return {
			teams: Array.from(this.teams.values()).map((t) => ({
				id: t.id,
				name: t.name,
				score: t.score,
				words: t.words.map((w) => w.text),
				currentWordIndex: t.currentWordIndex
			})),
			activeTeamId: this.activeTeamId,
			status: this._status,
			timer: this._timer.state,
			currentWord: this.getCurrentWord()?.text ?? null
		};
	}
}
