<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Charades } from './game.svelte.js';
	import { AudioController } from './audio.svelte.js';

	let {
		game,
		volume = 0.5,
		enabled = false
	}: { game: Charades; volume?: number; enabled?: boolean } = $props();

	const controller = new AudioController();

	// Track internal logic states
	let lastScore = $state(game.score);
	let lastStatus = $state(game.status);
	let isWarningActive = $state(false);

	// Derived "Phase" determines high-level behavior
	const phase = $derived.by(() => {
		if (game.status === 'waiting') return 'idle';
		if (game.status === 'paused') return 'paused';
		if (game.status === 'playing') {
			return game.timeLeft <= 10 ? 'warning' : 'playing';
		}
		return 'finished';
	});

	// Synchronize settings to controller
	$effect(() => {
		controller.volume = volume;
	});
	$effect(() => {
		controller.enabled = enabled;
	});

	export function unlock() {
		controller.unlock();
	}

	// 1. Manage Music Transitions (Declarative)
	$effect(() => {
		if (!enabled) return;

		switch (phase) {
			case 'idle':
				controller.stopAll();
				isWarningActive = false;
				break;
			case 'playing':
				if (lastStatus !== 'playing') {
					controller.stopAll();
					controller.playMusic(1.2);
				}
				break;
			case 'warning':
				if (!isWarningActive) {
					isWarningActive = true;
					controller.rampPlaybackRate(1.5);
				}
				break;
			case 'paused':
				controller.pauseMusic(true); // Dimming
				break;
			case 'finished':
				if (lastStatus === 'playing') {
					controller.stopAll();
					const sfxName: 'victory' | 'times-up' = game.isWin ? 'victory' : 'times-up';
					controller.playSfx(sfxName);
				}
				break;
		}

		lastStatus = game.status;
	});

	// 2. Handle One-Shot Score SFX
	$effect(() => {
		if (!enabled) return;
		if (game.score > lastScore && game.status === 'playing') {
			controller.playSfx('correct');
		}
		lastScore = game.score;
	});

	onDestroy(() => controller.destroy());
</script>
