<script lang="ts">
	import GMHeader from './GMHeader.svelte';
	import TeamDashboard from './TeamDashboard.svelte';
	import GameStage from './GameStage.svelte';
	import ActionZone from './ActionZone.svelte';
	import SetupTray from './SetupTray.svelte';
	import type { Charades } from '$lib/components/charades/index.js';

	let { game }: { game: Charades } = $props();

	function handleReset() {
		if (confirm('Are you sure you want to reset the entire game?')) {
			game.send({ type: 'RESET' });
			game.teams.forEach((t) => {
				game.send({ type: 'RESET_TEAM', id: t.id });
			});
		}
	}
</script>

<div
	class="mx-auto flex h-screen max-w-md flex-col overflow-hidden border-x bg-background text-foreground"
>
	<GMHeader status={game.status} timeLeft={game.timeLeft} onReset={handleReset} />

	<TeamDashboard
		teams={game.teams}
		activeTeamId={game.activeTeamId}
		onSelectTeam={(id) => game.send({ type: 'SELECT_TEAM', teamId: id })}
		onUpdateTeam={(id, name, words) => {
			game.send({ type: 'UPDATE_TEAM', id, name, words });
		}}
		onDeleteTeam={(id) => game.send({ type: 'DELETE_TEAM', id })}
		onAddTeam={() => game.send({ type: 'ADD_TEAM' })}
		disabled={game.status !== 'waiting'}
	/>

	<GameStage {game} />

	{#if game.status === 'waiting'}
		<div class="mt-auto">
			<SetupTray
				duration={game.duration}
				onSetDuration={(s) => game.send({ type: 'SET_DURATION', durationMs: s * 1000 })}
				onStart={() => game.send({ type: 'START' })}
				canStart={game.activeTeamId !== null}
			/>
		</div>
	{:else}
		<div class="mt-auto">
			<ActionZone
				status={game.status}
				canAction={!!game.word}
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
