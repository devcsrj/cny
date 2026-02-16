<script lang="ts">
	import { Henyo } from './game.svelte.js';

	let { game }: { game: Henyo } = $props();
</script>

{#if game.status === 'playing' || game.status === 'paused'}
	<div class="relative z-30 flex flex-col items-center gap-4 px-4 text-center mix-blend-difference">
		<div
			class="animate-in text-7xl font-black tracking-tighter text-white uppercase italic duration-500 zoom-in-95 sm:text-8xl md:text-9xl lg:text-[12rem]"
		>
			{game.word}
		</div>
	</div>
{/if}
