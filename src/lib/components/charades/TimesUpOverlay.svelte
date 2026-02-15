<script lang="ts">
	import type { Charades } from './charades';
	let { game }: { game: Charades } = $props();
</script>

<div
	class="fixed inset-0 z-50 flex animate-in flex-col items-center justify-center overflow-y-auto bg-destructive p-8 text-white duration-300 fade-in zoom-in"
>
	<h1 class="mb-4 text-6xl font-black tracking-tighter uppercase italic md:text-8xl lg:text-9xl">
		Time's Up!
	</h1>

	<div class="mb-12 flex flex-col items-center gap-2">
		<div class="text-2xl font-black tracking-widest uppercase opacity-90 md:text-4xl">
			Final Score
		</div>
		<div class="text-7xl leading-none font-black md:text-9xl">
			{game.score}
		</div>
	</div>

	<div class="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-16">
		<!-- Correct Words -->
		<div class="flex flex-col gap-4">
			<h2
				class="flex items-center justify-between border-b-4 border-white pb-2 text-xl font-black tracking-widest uppercase"
			>
				Correct
				<span class="rounded bg-white px-2 py-0.5 text-sm text-destructive"
					>{game.correctWords.length}</span
				>
			</h2>
			{#if game.correctWords.length > 0}
				<ul class="flex flex-col gap-2">
					{#each game.correctWords as word, i (i)}
						<li class="line-clamp-1 text-lg font-bold tracking-tight uppercase md:text-2xl">
							✓ {word}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="font-bold text-white/50 uppercase italic">None</p>
			{/if}
		</div>

		<!-- Missed Words -->
		<div class="flex flex-col gap-4">
			<h2
				class="flex items-center justify-between border-b-4 border-white/30 pb-2 text-xl font-black tracking-widest uppercase"
			>
				Missed
				<span class="rounded bg-white/30 px-2 py-0.5 text-sm text-white"
					>{game.missedWords.length}</span
				>
			</h2>
			{#if game.missedWords.length > 0}
				<ul class="flex flex-col gap-2">
					{#each game.missedWords as word, i (i)}
						<li
							class="line-clamp-1 text-lg font-bold tracking-tight uppercase line-through opacity-70 md:text-2xl"
						>
							{word}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="font-bold text-white/50 uppercase italic">None</p>
			{/if}
		</div>
	</div>
</div>
