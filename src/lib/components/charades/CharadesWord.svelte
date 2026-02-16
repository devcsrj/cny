<script lang="ts">
	import type { Charades } from './index.js';

	let { game }: { game: Charades } = $props();
</script>

<div
	class="relative z-10 flex h-full w-full flex-col items-center justify-center p-6 mix-blend-difference"
>
	{#if game.activeTeam && game.status !== 'playing'}
		<span class="mb-4 text-2xl font-bold tracking-[0.2em] text-white/60 uppercase">
			{game.activeTeam.name}
		</span>
	{/if}
	<h1
		class="text-center text-6xl font-black tracking-tighter text-white uppercase md:text-8xl lg:text-9xl"
	>
		{#if game.status === 'playing'}
			{game.word}
		{:else}
			Get Ready!
		{/if}
	</h1>
</div>
