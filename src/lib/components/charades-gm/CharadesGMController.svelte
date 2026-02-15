<script lang="ts">
	import GMHeader from './GMHeader.svelte';
	import TeamDashboard from './TeamDashboard.svelte';
	import GameStage from './GameStage.svelte';
	import ActionZone from './ActionZone.svelte';
	import SetupTray from './SetupTray.svelte';
	import { CharadesGM, type GMTeam } from './gm.svelte.js';

	// Hardcoded data
	const initialTeams: GMTeam[] = [
		{
			id: '1',
			name: 'Dragons',
			score: 0,
			words: ['Spider-Man', 'Elephant', 'Piano', 'Baking a Cake', 'Riding a Bike', 'Mona Lisa']
		},
		{
			id: '2',
			name: 'Phoenixes',
			score: 0,
			words: ['Michael Jackson', 'Doctor', 'Swimming', 'Firefighter', 'Pizza', 'Space Shuttle']
		}
	];

	const gm = new CharadesGM(initialTeams, 60);

	function handleReset() {
		if (confirm('Are you sure you want to reset the entire game?')) {
			gm.resetGame();
		}
	}
</script>

<div
	class="mx-auto flex h-screen max-w-md flex-col overflow-hidden border-x bg-background text-foreground"
>
	<GMHeader status={gm.game.status} timeLeft={gm.game.timeLeft} onReset={handleReset} />

	<TeamDashboard
		teams={gm.teams}
		activeTeamId={gm.activeTeamId}
		onSelectTeam={(id) => gm.selectTeam(id)}
		onUpdateTeam={(id, name, words) => {
			gm.setTeamName(id, name);
			gm.setTeamWords(id, words);
		}}
		onDeleteTeam={(id) => gm.deleteTeam(id)}
		onAddTeam={() => gm.addTeam()}
		disabled={gm.game.status !== 'waiting'}
	/>

	<GameStage status={gm.game.status} word={gm.game.word} nextWord={gm.nextWord} />

	{#if gm.game.status === 'waiting'}
		<div class="mt-auto">
			<SetupTray
				duration={gm.duration}
				onSetDuration={(s) => gm.setDuration(s)}
				onStart={() => gm.startRound()}
				canStart={gm.activeTeamId !== null}
			/>
		</div>
	{:else}
		<div class="mt-auto">
			<ActionZone
				status={gm.game.status}
				onCorrect={() => gm.handleCorrect()}
				onPass={() => gm.handleMiss()}
				onPause={() => gm.game.pause()}
				onResume={() => gm.game.start()}
				onNext={() => gm.prepareNextRound()}
			/>
		</div>
	{/if}
</div>
