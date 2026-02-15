<script lang="ts">
	import type { Charades } from './charades';
	let { game }: { game: Charades } = $props();
</script>

<div
	class="fixed inset-0 z-50 flex animate-in flex-col items-center justify-center bg-destructive text-white duration-300 fade-in zoom-in"
>
	<h1 class="text-8xl font-black tracking-tighter uppercase italic md:text-9xl">Time's Up!</h1>
	{#if game.score > 0}
		<div class="mt-8 text-4xl font-black tracking-widest uppercase opacity-90 md:text-6xl">
			Score: {game.score}
		</div>
	{/if}
</div>
