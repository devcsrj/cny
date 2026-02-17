<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Play } from '@lucide/svelte';

	let {
		duration = 60,
		label = 'START ROUND',
		onSetDuration,
		onStart,
		canStart = false,
		durations
	}: {
		duration: number;
		label?: string;
		onSetDuration: (seconds: number) => void;
		onStart: () => void;
		canStart: boolean;
		durations: number[];
	} = $props();
</script>

<div class="space-y-6 rounded-t-3xl border-t bg-secondary/30 p-6 shadow-2xl">
	<div class="space-y-3">
		<span class="ml-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
			Round Duration
		</span>
		<div class="grid grid-cols-4 gap-2">
			{#each durations as d, i (i)}
				<Button
					variant={duration === d ? 'default' : 'outline'}
					size="sm"
					class="h-10 rounded-xl font-bold"
					onclick={() => onSetDuration(d)}
				>
					{d}s
				</Button>
			{/each}
		</div>
	</div>

	<div class="pt-2">
		<Button
			disabled={!canStart}
			class="h-16 w-full rounded-2xl text-lg font-black tracking-tight shadow-lg transition-transform active:scale-95"
			onclick={onStart}
		>
			<Play class="mr-2 h-6 w-6 fill-current" />
			{label}
		</Button>
	</div>
</div>
