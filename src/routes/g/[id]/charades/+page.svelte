<script lang="ts">
	import { onMount } from 'svelte';
	import { CharadesGame, Charades } from '$lib/components/charades/index.js';

	const game = new Charades('Diving with goggles', 60);

	onMount(() => {
		game.start();
	});
</script>

<CharadesGame {game} />
