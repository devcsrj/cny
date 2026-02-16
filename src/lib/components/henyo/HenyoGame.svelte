<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import HenyoWord from './HenyoWord.svelte';
	import HenyoFinishOverlay from './HenyoFinishOverlay.svelte';
	import HenyoLeaderboard from './HenyoLeaderboard.svelte';
	import HenyoTimer from './HenyoTimer.svelte';
	import HenyoAudio from './HenyoAudio.svelte';
	import HenyoCountdown from './HenyoCountdown.svelte';
	import { Henyo } from './game.svelte.js';
	import { Settings, Volume2, VolumeX, X } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DrainingTank } from '../cny/index.js';

	let { game }: { game: Henyo } = $props();

	let audioEnabled = $state(false);
	let masterVolume = $state(0.5);
	let showSettings = $state(false);
	let audioRef: { unlock: () => void } | null = $state(null);

	onMount(() => {
		const storedEnabled = localStorage.getItem('henyo_audio_enabled');
		const storedVolume = localStorage.getItem('henyo_master_volume');
		if (storedEnabled !== null) audioEnabled = storedEnabled === 'true';
		if (storedVolume !== null) masterVolume = parseFloat(storedVolume);
	});

	$effect(() => {
		localStorage.setItem('henyo_audio_enabled', audioEnabled.toString());
	});

	$effect(() => {
		localStorage.setItem('henyo_master_volume', masterVolume.toString());
	});

	onDestroy(() => {
		game.destroy();
	});
</script>

<HenyoAudio bind:this={audioRef} {game} volume={masterVolume} enabled={audioEnabled} />

<div
	class="fixed inset-0 flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-background select-none"
>
	<!-- Background visual reuse from charades if suitable, or a slightly different color -->
	<DrainingTank timeLeft={game.timeLeft} duration={game.duration} />

	<HenyoTimer {game} />
	<HenyoWord {game} />
	<HenyoCountdown {game} />

	{#if game.status === 'paused'}
		<div
			class="absolute inset-0 z-40 flex animate-in flex-col items-center justify-center bg-black/60 backdrop-blur-xl duration-300 fade-in"
		>
			<div
				class="animate-in rounded-full bg-white/10 px-8 py-4 ring-1 ring-white/20 duration-500 zoom-in-95"
			>
				<h2 class="text-4xl font-black tracking-[0.2em] text-white uppercase italic">Paused</h2>
			</div>
		</div>
	{/if}

	<!-- Subtle Settings Toggle -->
	<div class="absolute right-4 bottom-4 z-[70] opacity-20 transition-opacity hover:opacity-100">
		<Button
			variant="ghost"
			size="icon"
			onclick={() => (showSettings = true)}
			class="h-12 w-12 rounded-full"
		>
			<Settings class="h-6 w-6" />
		</Button>
	</div>
</div>

{#if game.showLeaderboard}
	<HenyoLeaderboard {game} />
{/if}

{#if showSettings}
	<div
		class="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-black/40 backdrop-blur-sm duration-200 fade-in"
	>
		<div
			class="w-full max-w-sm animate-in rounded-3xl border bg-background p-8 shadow-2xl duration-200 zoom-in-95"
		>
			<div class="mb-8 flex items-center justify-between">
				<h2 class="text-2xl font-black tracking-tight uppercase">Audio Settings</h2>
				<Button variant="ghost" size="icon" onclick={() => (showSettings = false)}>
					<X class="h-6 w-6" />
				</Button>
			</div>

			<div class="space-y-8">
				<div class="flex items-center justify-between gap-4">
					<div class="flex flex-col">
						<span class="text-lg font-bold">Sound & Music</span>
						<span class="text-sm text-muted-foreground"
							>Enable game audio (required by browser)</span
						>
					</div>
					<Button
						variant={audioEnabled ? 'default' : 'outline'}
						onclick={() => {
							audioEnabled = !audioEnabled;
							if (audioEnabled) audioRef?.unlock();
						}}
						class="min-w-24"
					>
						{audioEnabled ? 'Enabled' : 'Disabled'}
					</Button>
				</div>

				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<span class="text-lg font-bold">Volume</span>
						<span class="font-mono text-sm">{Math.round(masterVolume * 100)}%</span>
					</div>
					<div class="flex items-center gap-4">
						{#if masterVolume === 0}
							<VolumeX class="h-5 w-5 text-muted-foreground" />
						{:else}
							<Volume2 class="h-5 w-5 text-muted-foreground" />
						{/if}
						<input
							type="range"
							min="0"
							max="1"
							step="0.01"
							bind:value={masterVolume}
							class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
						/>
					</div>
				</div>

				<Button
					class="h-12 w-full text-lg font-bold uppercase"
					onclick={() => (showSettings = false)}
				>
					Done
				</Button>
			</div>
		</div>
	</div>
{/if}

{#if game.status === 'finished'}
	<HenyoFinishOverlay {game} />
{/if}
