<script lang="ts">
	import { Henyo } from './game.svelte.js';

	let { game }: { game: Henyo } = $props();
</script>

{#if game.status === 'playing' || game.status === 'paused'}
	<div class="relative z-30 flex flex-col items-center gap-4 px-4 text-center">
		<h2
			class="animate-in text-2xl font-black tracking-[0.4em] text-white/40 uppercase italic duration-700 fade-in slide-in-from-top-4"
		>
			Guess the Word
		</h2>
		<div
			class="animate-in text-7xl font-black tracking-tighter text-white uppercase italic drop-shadow-2xl duration-500 zoom-in-95 sm:text-8xl md:text-9xl lg:text-[12rem]"
		>
			{game.word}
		</div>
	</div>
{/if}
