<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { Charades } from '$lib/components/charades/index.js';

	let { game }: { game: Charades } = $props();

	let container = $state<HTMLDivElement>();

	$effect(() => {
		if (game.word && container) {
			const active = container.querySelector('[data-active="true"]');
			if (active) {
				active.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	});
</script>

<div
	class="flex flex-1 flex-col items-center justify-center space-y-8 overflow-hidden p-6 text-center"
>
	{#if game.status === 'playing' || game.status === 'paused'}
		<div class="flex w-full flex-col items-center space-y-4">
			<span class="text-xs font-medium tracking-widest text-muted-foreground/60 uppercase">
				Word Reel
			</span>

			<div
				bind:this={container}
				class="no-scrollbar flex max-h-[200px] w-full flex-col items-center space-y-2 overflow-y-auto py-10"
			>
				{#if game.activeTeam}
					{#each game.activeTeam.words as w (w)}
						{@const isGuessed = game.activeTeam.guessedWords.includes(w)}
						{@const isActive = game.word === w}
						<div
							data-active={isActive}
							class={cn(
								'text-lg transition-all duration-300',
								isActive
									? 'scale-110 text-3xl font-black text-foreground'
									: 'font-medium text-muted-foreground/40',
								isGuessed && 'text-green-500/60'
							)}
						>
							<span class={cn(isGuessed && 'line-through')}>
								{isGuessed ? '✓ ' : ''}{w}
							</span>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{:else if game.status === 'waiting'}
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
	{:else if game.status === 'finished'}
		<div class="space-y-2">
			<h2 class="text-3xl font-black tracking-tighter text-destructive uppercase italic">
				{game.isWin ? 'Round Complete!' : "Time's Up!"}
			</h2>
			<p class="text-sm text-muted-foreground">Round complete. Review results below.</p>
		</div>
	{/if}
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
