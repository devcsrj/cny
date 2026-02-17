<script lang="ts">
	import { onMount } from 'svelte';
	import { Flame, Sparkles, Volume2, VolumeX } from '@lucide/svelte';
	import JSConfetti from 'js-confetti';
	import { fade, fly } from 'svelte/transition';

	// YouTube IFrame Player API Types
	interface YTPlayer {
		mute(): void;
		unMute(): void;
		playVideo(): void;
	}

	interface YTPlayerEvent {
		target: YTPlayer;
	}

	interface YTPlayerConfig {
		height: string;
		width: string;
		videoId: string;
		playerVars: {
			autoplay: number;
			controls: number;
			disablekb: number;
			enablejsapi: number;
			loop: number;
			playlist: string;
			modestbranding: number;
		};
		events: {
			onReady: (event: YTPlayerEvent) => void;
		};
	}

	interface YTWindow extends Window {
		onYouTubeIframeAPIReady?: () => void;
		YT?: {
			Player: new (id: string, config: YTPlayerConfig) => YTPlayer;
		};
	}

	let jsConfetti = $state<JSConfetti | null>(null);
	let blessingIndex = $state(0);
	let isMuted = $state(true);
	let player = $state<YTPlayer | null>(null);

	const BLESSINGS = [
		{ zh: '新年快乐', en: 'Happy New Year' },
		{ zh: '大吉大利', en: 'Great luck, Great prosperity' },
		{ zh: '马到成功', en: 'Instant Success' },
		{ zh: '万事如意', en: 'May all go well' },
		{ zh: '身体健康', en: 'Good Health' },
		{ zh: '恭喜发财', en: 'Prosperity & Wealth' }
	];

	onMount(() => {
		jsConfetti = new JSConfetti();

		// Load YouTube IFrame Player API
		const tag = document.createElement('script');
		tag.src = 'https://www.youtube.com/iframe_api';
		const firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

		const ytWindow = window as YTWindow;
		ytWindow.onYouTubeIframeAPIReady = () => {
			if (ytWindow.YT) {
				player = new ytWindow.YT.Player('youtube-player', {
					height: '0',
					width: '0',
					videoId: 'INKsLDB4-EQ',
					playerVars: {
						autoplay: 1,
						controls: 0,
						disablekb: 1,
						enablejsapi: 1,
						loop: 1,
						playlist: 'INKsLDB4-EQ',
						modestbranding: 1
					},
					events: {
						onReady: (event) => {
							event.target.mute();
						}
					}
				});
			}
		};

		// Auto-cycle blessings every 6 seconds
		const blessingTimer = setInterval(() => {
			blessingIndex = (blessingIndex + 1) % BLESSINGS.length;
		}, 6000);

		// Auto-trigger confetti every 20 seconds
		const confettiTimer = setInterval(() => {
			triggerConfetti();
		}, 20000);

		// Initial burst
		setTimeout(triggerConfetti, 1000);

		return () => {
			clearInterval(blessingTimer);
			clearInterval(confettiTimer);
		};
	});

	function toggleMute() {
		if (!player) return;
		if (isMuted) {
			player.unMute();
			player.playVideo();
			isMuted = false;
		} else {
			player.mute();
			isMuted = true;
		}
	}

	function triggerConfetti() {
		jsConfetti?.addConfetti({
			emojis: ['🧧', '✨', '🐎', '🔥', '🏮', '🎆'],
			confettiNumber: 80,
			emojiSize: 40
		});
	}
</script>

<svelte:head>
	<title>CNY 2026 | Year of the Fire Horse</title>
</svelte:head>

<main
	class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-red-950 px-4 text-amber-100 selection:bg-amber-500/30"
>
	<!-- YouTube Player (Hidden) -->
	<div id="youtube-player" class="absolute -z-50 opacity-0"></div>

	<!-- Audio Toggle -->
	<button
		onclick={toggleMute}
		class="fixed top-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30 bg-red-900/40 text-amber-400 backdrop-blur-md transition-all hover:scale-110 hover:bg-red-800/60 active:scale-95"
		aria-label={isMuted ? 'Unmute' : 'Mute'}
	>
		{#if isMuted}
			<VolumeX class="h-6 w-6" />
		{:else}
			<Volume2 class="h-6 w-6" />
		{/if}
	</button>
	<!-- Ambient Background Elements (Embers) -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		{#each Array(20) as _, i (i)}
			<div
				class="absolute animate-pulse rounded-full bg-amber-500/10 blur-xl"
				style="
                    width: {Math.random() * 300 + 100}px;
                    height: {Math.random() * 300 + 100}px;
                    top: {Math.random() * 100}%;
                    left: {Math.random() * 100}%;
                    animation-duration: {Math.random() * 5 + 3}s;
                "
			></div>
		{/each}
	</div>

	<!-- Rising Lanterns (Subtle) -->
	<div class="pointer-events-none absolute inset-0 z-0 opacity-20">
		{#each Array(10) as _, i (i)}
			<div
				class="lantern absolute bottom-[-100px]"
				style="
                    left: {Math.random() * 90 + 5}%;
                    animation-delay: {Math.random() * 15}s;
                    animation-duration: {Math.random() * 15 + 20}s;
                "
			>
				<div
					class="h-12 w-10 rounded-lg border border-amber-400/50 bg-red-600/60 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
				></div>
				<div class="mx-auto h-4 w-0.5 bg-amber-500/30"></div>
			</div>
		{/each}
	</div>

	<!-- Fire Particles / Glow -->
	<div class="pointer-events-none absolute inset-0 z-0">
		<div
			class="absolute bottom-0 h-1/2 w-full bg-gradient-to-t from-red-900/40 to-transparent"
		></div>
	</div>

	<!-- Content -->
	<div class="z-10 flex flex-col items-center gap-10 text-center">
		<!-- Calligraphy / Title -->
		<div class="animate-in duration-1000 fade-in zoom-in">
			<h2 class="mb-2 font-serif text-3xl tracking-widest text-amber-500 md:text-4xl">丙午年</h2>
			<h1 class="text-6xl font-black tracking-tight text-amber-400 drop-shadow-2xl md:text-8xl">
				2026
			</h1>
			<p
				class="mt-4 flex items-center justify-center gap-3 text-xl font-medium tracking-wide text-amber-200/80 md:text-2xl"
			>
				<Flame class="h-6 w-6 text-orange-500" />
				Year of the Fire Horse
				<span class="text-2xl">🐎</span>
			</p>
		</div>

		<!-- Blessing Card (Replacing Countdown Grid) -->
		<div class="relative flex h-56 w-full items-center justify-center">
			{#key blessingIndex}
				<div
					in:fly={{ y: 20, duration: 800, opacity: 0 }}
					out:fade={{ duration: 600 }}
					class="absolute flex flex-col items-center justify-center rounded-2xl border border-amber-500/20 bg-red-900/30 px-10 py-8 backdrop-blur-sm transition-transform hover:scale-105 md:px-20 md:py-12"
				>
					<span
						class="font-serif text-5xl font-bold text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] md:text-7xl"
					>
						{BLESSINGS[blessingIndex].zh}
					</span>
					<span class="mt-4 text-xs tracking-[0.4em] text-amber-200/60 uppercase md:text-sm">
						{BLESSINGS[blessingIndex].en}
					</span>
				</div>
			{/key}
		</div>

		<!-- Footer Decorative -->
		<div class="mt-12 flex items-center gap-4 text-amber-500/40">
			<Sparkles class="h-4 w-4" />
			<div
				class="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
			></div>
			<span class="font-serif italic">Lunar New Year Celebration</span>
			<div
				class="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
			></div>
			<Sparkles class="h-4 w-4" />
		</div>
	</div>

	<!-- Decorative Corner Lanterns (Restored original opacity/style) -->
	<div class="fixed top-0 left-0 hidden p-8 opacity-20 lg:block">
		<div class="mx-auto h-32 w-1 bg-amber-600/50"></div>
		<div
			class="h-16 w-12 rounded-xl border-2 border-amber-500 bg-red-600 shadow-[0_0_30px_rgba(251,191,36,0.3)]"
		></div>
	</div>
	<div class="fixed top-0 right-0 hidden p-8 opacity-20 lg:block">
		<div class="mx-auto h-32 w-1 bg-amber-600/50"></div>
		<div
			class="h-16 w-12 rounded-xl border-2 border-amber-500 bg-red-600 shadow-[0_0_30px_rgba(251,191,36,0.3)]"
		></div>
	</div>
</main>

<style>
	:global(body) {
		background-color: #450a0a;
		margin: 0;
		overflow: hidden;
	}

	@keyframes float-up {
		0% {
			transform: translateY(0) rotate(0deg);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			transform: translateY(-120vh) rotate(15deg);
			opacity: 0;
		}
	}

	.lantern {
		animation: float-up linear infinite;
	}
</style>
