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
				// We can use the dispatch tool or just sync directly
				game.sync(
					state.timer.totalDuration,
					state.timer.remainingTime,
					state.timer.isRunning,
					state.timer.serverTimestamp
				);
				if (state.currentWord) game.setWord(state.currentWord);
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
