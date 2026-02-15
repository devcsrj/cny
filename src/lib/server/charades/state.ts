import { Timer } from '../timer';
import { Team } from './team';
import { Word } from './word';

export class CharadesState {
	private readonly teams: Team[] = [];
	private currentTeamIndex = 0;

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
		const index = this.teams.findIndex((team) => team.id === id);
		if (index !== -1) {
			this.currentTeamIndex = index;
		}
	}

	getCurrentTeam(): Team {
		return this.teams[this.currentTeamIndex];
	}

	resetTeam(id: Team['id']) {
		const team = this.teams.find((team) => team.id === id);
		if (team) {
			team.reset();
		}
	}

	nextWord() {
		this.getCurrentTeam().nextWord();
	}

	getCurrentWord(): Word | null {
		return this.getCurrentTeam().currentWord;
	}

	addTeam(): Team {
		const team = new Team();
		this.teams.push(team);
		return team;
	}

	updateTeam(id: Team['id'], opts: { name?: string; words?: string[] }) {
		const { name, words } = opts;
		for (const team of this.teams) {
			if (team.id !== id) {
				continue;
			}

			if (name) {
				team.name = name;
			}

			if (words) {
				team.words = words.map((word) => new Word(word));
			}
		}
	}

	deleteTeam(id: Team['id']) {
		for (let i = 0; i < this.teams.length; i++) {
			if (this.teams[i].id === id) {
				this.teams.splice(i, 1);
				break;
			}
		}
	}

	markCorrect(teamId: Team['id'], word: string) {
		for (const team of this.teams) {
			if (team.id !== teamId) {
				continue;
			}
			team.guessed(word);
		}
	}

	markMissed(teamId: Team['id'], word: string) {
		for (const team of this.teams) {
			if (team.id !== teamId) {
				continue;
			}
			team.missed(word);
		}
	}
}
