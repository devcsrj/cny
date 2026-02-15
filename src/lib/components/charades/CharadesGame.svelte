<script lang="ts">
	import { onDestroy } from 'svelte';
	import DrainingTank from './DrainingTank.svelte';
	import CharadesWord from './CharadesWord.svelte';
	import TimesUpOverlay from './TimesUpOverlay.svelte';
	import TimerDisplay from './TimerDisplay.svelte';
	import type { Charades } from './charades';

	let { game }: { game: Charades } = $props();

	onDestroy(() => {
		game.destroy();
	});
</script>

<div
	class="fixed inset-0 flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-background select-none"
>
	<DrainingTank {game} />
	<TimerDisplay {game} />
	<CharadesWord {game} />
</div>

{#if game.status === 'finished'}
	<TimesUpOverlay {game} />
{/if}
