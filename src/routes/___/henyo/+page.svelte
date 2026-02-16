<script lang="ts">
	import { onMount } from 'svelte';
	import HenyoGMController from '$lib/components/henyo-gm/HenyoGMController.svelte';
	import { Henyo } from '$lib/components/henyo/index.js';
	import type { HenyoMessage } from '$lib/types/henyo';

	const game = new Henyo();

	onMount(() => {
		(async () => {
			// 1. Fetch initial state
			try {
				const res = await fetch('/___/henyo');
				const state = await res.json();
				game.update(state);
			} catch (e) {
				console.error('Failed to load initial state', e);
			}
		})();

		// 2. Subscribe to updates
		const path = `/api/henyo/subscribe`;
		const es = new EventSource(path);
		es.addEventListener('message', (e) => {
			const payload = JSON.parse(e.data) as HenyoMessage;
			if (payload.type === 'SYNC_STATE') {
				game.update(payload.state);
			}
		});

		return () => {
			es.close();
		};
	});
</script>

<HenyoGMController {game} />
