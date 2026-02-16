<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Check, X, Pause, Play, Timer } from '@lucide/svelte';

	let {
		status = 'waiting',
		countdown = null,
		canAction = true,
		onPrepare,
		onCorrect,
		onPass,
		onPause,
		onResume,
		onNext
	}: {
		status: string;
		countdown: number | null;
		canAction?: boolean;
		onPrepare: () => void;
		onCorrect: () => void;
		onPass: () => void;
		onPause: () => void;
		onResume: () => void;
		onNext: () => void;
	} = $props();
</script>

<div class="grid grid-cols-4 gap-3 border-t bg-background p-4">
	{#if status === 'playing'}
		<Button
			variant="destructive"
			size="lg"
			disabled={!canAction}
			class="col-span-1 flex h-20 flex-col gap-1 rounded-2xl"
			onclick={onPass}
			aria-label="Pass"
		>
			<X class="h-6 w-6" />
		</Button>

		<Button
			variant="outline"
			size="lg"
			class="col-span-1 h-20 rounded-2xl"
			onclick={onPause}
			aria-label="Pause"
		>
			<Pause class="h-6 w-6" />
		</Button>

		<Button
			variant="default"
			size="lg"
			disabled={!canAction}
			class="col-span-2 h-20 rounded-2xl bg-green-600 text-xl font-bold text-white hover:bg-green-700"
			onclick={onCorrect}
			aria-label="Correct"
		>
			<Check class="mr-2 h-8 w-8" />
			CORRECT
		</Button>
	{:else if status === 'paused'}
		<Button
			variant="default"
			size="lg"
			class="col-span-4 h-20 rounded-2xl text-xl font-bold"
			onclick={onResume}
		>
			<Play class="mr-2 h-8 w-8" />
			RESUME
		</Button>
	{:else if status === 'starting'}
		<Button
			variant="secondary"
			size="lg"
			disabled
			class="col-span-4 h-20 rounded-2xl text-xl font-bold"
		>
			<Timer class="mr-2 h-8 w-8 animate-pulse" />
			STARTING IN {countdown}...
		</Button>
	{:else if status === 'waiting' || status === 'finished'}
		<Button
			variant="default"
			size="lg"
			disabled={!canAction}
			class="col-span-4 h-20 rounded-2xl text-xl font-black tracking-tight uppercase"
			onclick={onPrepare}
		>
			<Play class="mr-2 h-8 w-8" />
			PREPARE ROUND
		</Button>
	{/if}
</div>
