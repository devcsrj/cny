import { Timer } from '../timer';
import { Team } from './team';
import { Word } from './word';

export class CharadesState {
	private readonly teams = new Map<string, Team>();
	private activeTeamId: string | null = null;

	private readonly _timer: Timer;

	constructor(onExpired?: () => void) {
		this._timer = new Timer(60000, () => {
			if (onExpired) onExpired();
		});
	}

	get timer() {
		return this._timer;
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
}
