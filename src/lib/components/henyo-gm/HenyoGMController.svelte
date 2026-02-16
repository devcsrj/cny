<script lang="ts">
	import GMHeader from '../cny/gm/GMHeader.svelte';
	import TeamDashboard from '../cny/gm/TeamDashboard.svelte';
	import GameStage from '../cny/gm/GameStage.svelte';
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

	let isWin = $derived(
		game.status === 'finished' &&
			game.activeTeam?.words.length === game.activeTeam?.guessedWords.length
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
		teams={game.teams as any}
		activeTeamId={game.activeTeamId}
		onSelectTeam={(id) => game.send({ type: 'SELECT_TEAM', teamId: id })}
		onUpdateTeam={(id, name, words) => {
			game.send({ type: 'UPDATE_TEAM', teamId: id, name, words });
		}}
		onDeleteTeam={(id) => game.send({ type: 'DELETE_TEAM', teamId: id })}
		onAddTeam={() => game.send({ type: 'ADD_TEAM' })}
		disabled={game.status !== 'waiting'}
	/>

	<GameStage
		status={game.status}
		word={game.word}
		activeTeam={game.activeTeam as any}
		{isWin}
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
