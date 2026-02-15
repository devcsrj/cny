<script lang="ts">
	import { cn } from '$lib/utils.js';

	let {
		word = '',
		nextWord = '',
		status = 'waiting',
		correctWords = [],
		missedWords = []
	}: {
		word: string;
		nextWord?: string;
		status: string;
		correctWords?: string[];
		missedWords?: string[];
	} = $props();
</script>

<div class="flex flex-1 flex-col items-center justify-center space-y-8 p-6 text-center">
	{#if status === 'playing' || status === 'paused'}
		<div class="space-y-2">
			<span class="text-xs font-medium tracking-widest text-muted-foreground/60 uppercase">
				Current Word
			</span>
			<h1 class="text-5xl leading-tight font-black tracking-tight break-words uppercase">
				{word || '---'}
			</h1>
		</div>

		{#if nextWord}
			<div class="animate-in duration-500 fade-in slide-in-from-bottom-2">
				<span class="text-[10px] font-bold tracking-widest text-muted-foreground/40 uppercase">
					Up Next
				</span>
				<p class="text-sm font-semibold text-muted-foreground/80">
					{nextWord}
				</p>
			</div>
		{/if}

		{#if correctWords.length > 0 || missedWords.length > 0}
			<div class="mt-4 flex w-full flex-wrap justify-center gap-1.5 overflow-hidden px-2">
				{#each correctWords as w, i (i)}
					<div
						class="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-600 ring-1 ring-green-500/20 ring-inset"
					>
						{w}
					</div>
				{/each}
				{#each missedWords as w, i (i)}
					<div
						class="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground ring-1 ring-foreground/5 ring-inset"
					>
						{w}
					</div>
				{/each}
			</div>
		{/if}
	{:else if status === 'waiting'}
		<div class="animate-in space-y-4 duration-700 zoom-in-95 fade-in">
			<div
				class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
			>
				<div class="h-10 w-10 animate-ping rounded-full bg-primary opacity-20"></div>
			</div>
			<h2 class="text-2xl font-bold tracking-tight">Ready to start?</h2>
			<p class="mx-auto max-w-[200px] text-sm text-muted-foreground">
				Select a team and duration below to begin the round.
			</p>
		</div>
	{:else if status === 'finished'}
		<div class="space-y-2">
			<h2 class="text-3xl font-black tracking-tighter text-destructive uppercase italic">
				Time's Up!
			</h2>
			<p class="text-sm text-muted-foreground">Round complete. Review results below.</p>
		</div>
	{/if}
</div>
