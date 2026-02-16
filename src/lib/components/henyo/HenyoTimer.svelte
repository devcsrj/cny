<script lang="ts">
	import { Henyo } from './game.svelte.js';

	let { game }: { game: Henyo } = $props();

	let minutes = $derived(Math.floor(game.timeLeft / 60));
	let seconds = $derived(Math.floor(game.timeLeft % 60));
</script>

{#if game.status !== 'waiting' && game.status !== 'starting'}
	<div
		class="absolute top-10 z-20 font-mono text-6xl font-black tracking-widest text-white mix-blend-difference"
	>
		{minutes}:{seconds.toString().padStart(2, '0')}
	</div>
{/if}
