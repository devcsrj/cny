<script lang="ts">
	import { onMount } from 'svelte';
	import CharadesGMController from '$lib/components/charades-gm/CharadesGMController.svelte';
	import { CharadesGM } from '$lib/components/charades-gm/gm.svelte.js';
	import type { CharadesCommand } from '$lib/types/charades';

	const gm = new CharadesGM();

	onMount(() => {
		(async () => {
			// 1. Fetch initial state
			try {
				const res = await fetch('/___/charades');
				const state = await res.json();
				gm.syncWithServer(state);
			} catch (e) {
				console.error('Failed to load initial state', e);
			}
		})();

		// 2. Subscribe to updates
		const path = `/api/charades/subscribe`;
		const es = new EventSource(path);
		es.addEventListener('message', (e) => {
			const payload = JSON.parse(e.data) as CharadesCommand;
			gm.applyCommand(payload);
		});

		return () => {
			es.close();
		};
	});
</script>

<CharadesGMController {gm} />
