<script lang="ts">
	import GMHeader from '../cny/gm/GMHeader.svelte';
	import TeamDashboard from '../cny/gm/TeamDashboard.svelte';
	import CharadesGameStage from './CharadesGameStage.svelte';
	import ActionZone from './ActionZone.svelte';
	import SetupTray from '../cny/gm/SetupTray.svelte';
	import { Charades } from '$lib/components/charades/game.svelte.js';

	let { game }: { game: Charades } = $props();

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
		disabled={game.status !== 'waiting'}
	/>

	<CharadesGameStage {game} onWordClick={handleWordClick} />

	{#if game.status === 'waiting' || game.status === 'finished'}
		<div class="mt-auto">
			<SetupTray
				duration={game.duration}
				label="PREPARE ROUND"
				onSetDuration={(s) => game.send({ type: 'SET_DURATION', durationMs: s * 1000 })}
				onStart={() => game.send({ type: 'PREPARE' })}
				canStart={game.activeTeamId !== null}
			/>
		</div>
	{:else}
		<div class="mt-auto">
			<ActionZone
				status={game.status}
				countdown={game.countdown}
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
