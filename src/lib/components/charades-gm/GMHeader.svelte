<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { RotateCcw } from '@lucide/svelte';
	import type { CharadesStatus } from '$lib/types/charades';

	let {
		status = 'waiting',
		timeLeft = 60,
		onReset
	}: {
		status: CharadesStatus;
		timeLeft: number;
		onReset: () => void;
	} = $props();

	const statusColor: Record<CharadesStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
		waiting: 'secondary',
		playing: 'default',
		paused: 'outline',
		finished: 'destructive'
	};
</script>

<header class="flex items-center justify-between border-b p-4">
	<div class="flex items-center gap-2">
		<Badge variant={statusColor[status]} class="capitalize">
			{status}
		</Badge>
	</div>

	<div
		class="text-3xl font-bold tabular-nums"
		class:text-destructive={timeLeft <= 10 && status === 'playing'}
	>
		{#if true}
			{@const displayTime = Math.ceil(timeLeft)}
			{Math.floor(displayTime / 60)}:{(displayTime % 60).toString().padStart(2, '0')}
		{/if}
	</div>

	<Button variant="ghost" size="icon" onclick={onReset} aria-label="Reset Game">
		<RotateCcw class="h-5 w-5" />
	</Button>
</header>
