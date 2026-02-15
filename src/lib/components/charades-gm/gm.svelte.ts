import { Charades } from '$lib/components/charades/index.js';

export interface GMTeam {
	id: string;
	name: string;
	score: number;
	words: string[];
}

export class CharadesGM {
	teams = $state<GMTeam[]>([]);
	activeTeamId = $state<string | null>(null);
	currentWordIndex = $state(0);
	duration = $state(60);
	game: Charades;

	constructor(teams: GMTeam[], duration: number = 60) {
		this.teams = teams;
		this.duration = duration;
		this.game = new Charades('', duration);
	}

	activeTeam = $derived(this.teams.find((t) => t.id === this.activeTeamId));
	currentWordPool = $derived(this.activeTeam?.words || []);
	nextWord = $derived(
		this.currentWordPool[(this.currentWordIndex + 1) % this.currentWordPool.length]
	);

	selectTeam(id: string) {
		if (this.game.status === 'waiting') {
			this.activeTeamId = id;
		}
	}

	setDuration(seconds: number) {
		this.duration = seconds;
		this.game.setDuration(seconds);
	}

	setTeamWords(id: string, words: string[]) {
		const team = this.teams.find((t) => t.id === id);
		if (team) {
			team.words = words;
		}
	}

	setTeamName(id: string, name: string) {
		const team = this.teams.find((t) => t.id === id);
		if (team) {
			team.name = name;
		}
	}

	addTeam(name: string = 'New Team') {
		const id = Math.random().toString(36).substring(2, 9);
		this.teams.push({
			id,
			name,
			score: 0,
			words: []
		});
	}

	deleteTeam(id: string) {
		this.teams = this.teams.filter((t) => t.id !== id);
		if (this.activeTeamId === id) {
			this.activeTeamId = null;
		}
	}

	startRound() {
		if (!this.activeTeamId) return;
		this.currentWordIndex = 0;
		this.game.setWord(this.currentWordPool[this.currentWordIndex]);
		this.game.start();
	}

	handleCorrect() {
		const team = this.teams.find((t) => t.id === this.activeTeamId);
		if (team) team.score++;
		this.game.score++;
		this.game.correctWords.push(this.game.word);
		this.advanceWord();
	}

	handleMiss() {
		this.game.missedWords.push(this.game.word);
		this.advanceWord();
	}

	private advanceWord() {
		this.currentWordIndex = (this.currentWordIndex + 1) % this.currentWordPool.length;
		this.game.setWord(this.currentWordPool[this.currentWordIndex]);
	}

	resetGame() {
		this.game.reset();
		this.teams.forEach((t) => (t.score = 0));
		this.activeTeamId = null;
		this.currentWordIndex = 0;
	}
}
