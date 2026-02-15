<script lang="ts">
	import { onMount } from 'svelte';
	import { CharadesGame, Charades, dispatch } from '$lib/components/charades/index.js';
	import type { CharadesCommand } from '$lib/types/charades';

	const game = new Charades('', 60);

	onMount(() => {
		(async () => {
			// 1. Fetch initial state
			try {
				const res = await fetch('/___/charades');
				const state = await res.json();
				game.update(state);
			} catch (e) {
				console.error('Failed to load initial state', e);
			}
		})();

		// 2. Subscribe to updates
		const path = `/api/charades/subscribe`;
		const es = new EventSource(path);
		es.addEventListener('message', async (e) => {
			const payload = JSON.parse(e.data) as CharadesCommand;
			dispatch(game, payload);
		});

		return () => {
			es.close();
		};
	});
</script>

<CharadesGame {game} />
