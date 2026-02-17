<script lang="ts">
	import GMHeader from '../cny/gm/GMHeader.svelte';
	import TeamDashboard from '../cny/gm/TeamDashboard.svelte';
	import HenyoGameStage from './HenyoGameStage.svelte';
	import HenyoActionZone from './HenyoActionZone.svelte';
	import SetupTray from '../cny/gm/SetupTray.svelte';
	import { Henyo } from '$lib/components/henyo/game.svelte.js';

	let { game }: { game: Henyo } = $props();

	function handleReset() {
		if (confirm('Are you sure you want to reset the entire game?')) {
			game.send({ type: 'RESET' });
			game.teams.forEach((t) => {
				game.send({ type: 'RESET_TEAM', teamId: t.id });
			});
		}
	}

	function handleWordClick(wordText: string) {
		const isGuessed = game.activeTeam?.guessedWords?.includes(wordText);
		const isMissed = game.activeTurn?.missedWords?.includes(wordText);

		let newStatus: 'correct' | 'missed' | 'unmarked';
		if (isGuessed) {
			newStatus = 'missed';
		} else if (isMissed) {
			newStatus = 'unmarked';
		} else {
			newStatus = 'correct';
		}

		game.send({
			type: 'SET_WORD_STATUS',
			teamId: game.activeTeamId!,
			word: wordText,
			status: newStatus
		});
	}

	let isWin = $derived(
		game.status === 'finished' &&
			game.activeTeam &&
			game.activeTeam.words.length > 0 &&
			game.activeTeam.words.length === game.activeTeam.guessedWords.length
	);
</script>

<div
	class="mx-auto flex h-screen max-w-md flex-col overflow-hidden border-x bg-background text-foreground"
>
	<GMHeader
		status={game.status}
		timeLeft={game.timeLeft}
		showLeaderboard={game.showLeaderboard}
		onReset={handleReset}
		onToggleLeaderboard={() => game.send({ type: 'TOGGLE_LEADERBOARD' })}
	/>

	<TeamDashboard
		teams={game.teams}
		activeTeamId={game.activeTeamId}
		onSelectTeam={(id) => game.send({ type: 'SELECT_TEAM', teamId: id })}
		onUpdateTeam={(id, name, words) => {
			game.send({ type: 'UPDATE_TEAM', teamId: id, name, words });
		}}
		onDeleteTeam={(id) => game.send({ type: 'DELETE_TEAM', teamId: id })}
		onAddTeam={() => game.send({ type: 'ADD_TEAM' })}
		disabled={game.status !== 'waiting' && game.status !== 'finished'}
	/>

	<HenyoGameStage
		{game}
		{isWin}
		onWordClick={handleWordClick}
		instruction="Select a team, duration and input the secret words below."
	/>

	{#if game.status === 'waiting' || game.status === 'finished'}
		<div class="mt-auto">
			<SetupTray
				duration={game.duration}
				label="PREPARE ROUND"
				onSetDuration={(s) => game.send({ type: 'SET_DURATION', durationMs: s * 1000 })}
				onStart={() => game.send({ type: 'PREPARE' })}
				canStart={game.activeTeamId !== null && game.activeTeam!.words.length > 0}
				durations={[120, 180, 240, 300]}
			/>
		</div>
	{:else}
		<div class="mt-auto">
			<HenyoActionZone
				status={game.status}
				countdown={game.countdown}
				canAction={!!game.word}
				onPrepare={() => game.send({ type: 'PREPARE' })}
				onCorrect={() =>
					game.send({
						type: 'MARK_CORRECT',
						teamId: game.activeTeamId!,
						word: game.word
					})}
				onPass={() =>
					game.send({
						type: 'MARK_MISSED',
						teamId: game.activeTeamId!,
						word: game.word
					})}
				onPause={() => game.send({ type: 'PAUSE' })}
				onResume={() => game.send({ type: 'RESUME' })}
				onNext={() => game.send({ type: 'RESET' })}
			/>
		</div>
	{/if}
</div>
