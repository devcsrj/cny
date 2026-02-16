<script lang="ts">
	import { Charades } from './game.svelte.js';

	let { game }: { game: Charades } = $props();
</script>

{#if game.status === 'starting'}
	<div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-3xl">
		{#key game.countdown}
			<div
				class="scale-150 animate-in text-[15rem] font-black text-white duration-500 zoom-in-50 fade-in"
			>
				{game.countdown}
			</div>
		{/key}
	</div>
{/if}
