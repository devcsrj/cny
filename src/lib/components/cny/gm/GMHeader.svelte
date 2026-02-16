<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { RotateCcw, Trophy } from '@lucide/svelte';

	let {
		status = 'waiting',
		timeLeft = 60,
		showLeaderboard = false,
		onReset,
		onToggleLeaderboard
	}: {
		status: string;
		timeLeft: number;
		showLeaderboard?: boolean;
		onReset: () => void;
		onToggleLeaderboard: () => void;
	} = $props();

	const statusColor: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
		waiting: 'secondary',
		starting: 'secondary',
		playing: 'default',
		paused: 'outline',
		finished: 'destructive'
	};
</script>

<header class="flex items-center justify-between border-b p-4">
	<div class="flex items-center gap-2">
		<Badge variant={statusColor[status] || 'default'} class="capitalize">
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

	<div class="flex items-center gap-1">
		<Button
			variant={showLeaderboard ? 'default' : 'ghost'}
			size="icon"
			onclick={onToggleLeaderboard}
			disabled={status === 'playing'}
			aria-label="Toggle Leaderboard"
			class={showLeaderboard ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
		>
			<Trophy class="h-5 w-5" />
		</Button>

		<Button variant="ghost" size="icon" onclick={onReset} aria-label="Reset Game">
			<RotateCcw class="h-5 w-5" />
		</Button>
	</div>
</header>
