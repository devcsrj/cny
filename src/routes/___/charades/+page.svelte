<script lang="ts">
	import { onMount } from 'svelte';
	import CharadesGMController from '$lib/components/charades-gm/CharadesGMController.svelte';
	import { Charades } from '$lib/components/charades/index.js';
	import type { CharadesMessage } from '$lib/types/charades';

	const game = new Charades();

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
		es.addEventListener('message', (e) => {
			const payload = JSON.parse(e.data) as CharadesMessage;
			if (payload.type === 'SYNC_STATE') {
				game.update(payload.state);
			}
		});

		return () => {
			es.close();
		};
	});
</script>

<CharadesGMController {game} />
