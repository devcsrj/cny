<script lang="ts">
	import type { Charades } from './charades';
	let { game }: { game: Charades } = $props();
</script>

<div
	class="absolute top-10 z-20 font-mono text-5xl font-black tracking-widest text-white opacity-80 mix-blend-difference"
>
	{game.timeLeft.toString().padStart(2, '0')}
</div>
