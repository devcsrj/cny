<script lang="ts">
	import { Charades } from './game.svelte.js';

	let { game }: { game: Charades } = $props();
	let height = $derived((game.timeLeft / game.duration) * 100);
</script>

<div
	class="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-linear"
	style:height="{height}%"
	class:bg-primary={game.timeLeft > 5}
	class:bg-destructive={game.timeLeft <= 5}
></div>
