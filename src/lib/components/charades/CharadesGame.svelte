<script lang="ts">
	import { onDestroy } from 'svelte';
	import DrainingTank from './DrainingTank.svelte';
	import CharadesWord from './CharadesWord.svelte';
	import TimesUpOverlay from './TimesUpOverlay.svelte';
	import TimerDisplay from './TimerDisplay.svelte';
	import type { Charades } from './index.js';

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

	{#if game.status === 'paused'}
		<div
			class="absolute inset-0 z-40 flex animate-in flex-col items-center justify-center bg-black/60 backdrop-blur-xl duration-300 fade-in"
		>
			<div
				class="animate-in rounded-full bg-white/10 px-8 py-4 ring-1 ring-white/20 duration-500 zoom-in-95"
			>
				<h2 class="text-4xl font-black tracking-[0.2em] text-white uppercase italic">Paused</h2>
			</div>
		</div>
	{/if}
</div>

{#if game.status === 'finished'}
	<TimesUpOverlay {game} />
{/if}
