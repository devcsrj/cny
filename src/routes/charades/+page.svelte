<script lang="ts">
	import { onMount } from 'svelte';
	import { CharadesGame, Charades, dispatch } from '$lib/components/charades/index.js';
	import type { CharadesCommand } from '$lib/types/charades';

	const game = new Charades('', 60);

	onMount(() => {
		const path = `/api/bookings/subscribe`;
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
