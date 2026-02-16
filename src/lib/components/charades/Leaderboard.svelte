<script lang="ts">
	import type { Charades } from './index.js';
	import { cn } from '$lib/utils.js';
	import JSConfetti from 'js-confetti';

	let { game }: { game: Charades } = $props();

	let rankedTeams = $derived([...game.teams].sort((a, b) => b.score - a.score));

	$effect(() => {
		if (game.isGameOver) {
			const jsConfetti = new JSConfetti();
			const fire = () => {
				jsConfetti.addConfetti({
					emojis: ['🎉', '🎊', '🧧', '🍊', '🏮', '🥠', '福'],
					emojiSize: 50,
					confettiNumber: 40
				});
				jsConfetti.addConfetti();
			};

			fire();
			const interval = setInterval(fire, 3000);

			return () => {
				clearInterval(interval);
				jsConfetti.clearCanvas();
			};
		}
	});
</script>

<div
	class="fixed inset-0 z-[60] flex animate-in flex-col items-center justify-center bg-background/95 p-8 backdrop-blur-xl duration-500 slide-in-from-bottom-10 fade-in"
>
	<div class="mb-12 text-center">
		<h2 class="text-2xl font-black tracking-[0.3em] text-primary uppercase italic opacity-50">
			Leaderboard
		</h2>
		<h1 class="text-6xl font-black tracking-tighter uppercase md:text-8xl">Standings</h1>
	</div>

	<div class="flex w-full max-w-2xl flex-col gap-4">
		{#each rankedTeams as team, i (team.id)}
			<div
				class={cn(
					'flex items-center justify-between rounded-2xl border-2 p-6 transition-all duration-500',
					i === 0 ? 'border-primary bg-primary/10' : 'border-muted bg-muted/30'
				)}
				style="transition-delay: {i * 100}ms"
			>
				<div class="flex items-center gap-6">
					<div
						class={cn(
							'flex h-12 w-12 items-center justify-center rounded-full text-2xl font-black',
							i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'
						)}
					>
						{i + 1}
					</div>
					<div class="flex flex-col">
						<span class="text-xs font-black tracking-widest text-muted-foreground uppercase">
							{team.words.length} Words Total
						</span>
						<span class="text-3xl font-black tracking-tight uppercase">{team.name}</span>
					</div>
				</div>

				<div class="flex flex-col items-end">
					<span class="text-5xl leading-none font-black">{team.score}</span>
					<span class="text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
						>Points</span
					>
				</div>
			</div>
		{/each}

		{#if game.teams.length === 0}
			<div class="py-20 text-center text-muted-foreground italic">No teams registered yet</div>
		{/if}
	</div>
</div>
