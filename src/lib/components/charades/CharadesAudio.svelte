<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Charades } from './game.svelte.js';
	import { AudioController } from '../cny/index.js';
	import type { CharadesStatus } from '$lib/types/charades';

	let {
		game,
		volume = 0.5,
		enabled = false
	}: { game: Charades; volume?: number; enabled?: boolean } = $props();

	const controller = new AudioController();

	// Track internal logic states
	let lastScore = $state<number | null>(null);
	let lastStatus = $state<CharadesStatus | null>(null);
	let isWarningActive = $state(false);

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

	// 1. Manage Music (Declarative)
	$effect(() => {
		if (!enabled) return;

		const status = game.status;
		const timeLeft = game.timeLeft;

		if (status === 'playing') {
			if (timeLeft <= 10) {
				controller.playMusic(1.5);
			} else {
				controller.playMusic(1.2);
			}
		} else if (status === 'paused') {
			controller.pauseMusic(true);
		} else {
			controller.stopAll();
		}
	});

	// 2. Ramping logic for the 10s warning
	$effect(() => {
		if (!enabled) return;
		if (game.status === 'playing' && game.timeLeft <= 10 && !isWarningActive) {
			isWarningActive = true;
			controller.rampPlaybackRate(1.5);
		}
		if (game.status !== 'playing' || game.timeLeft > 10) {
			isWarningActive = false;
		}
	});

	// 3. One-shot SFX
	$effect(() => {
		if (!enabled) return;

		// Initialize last values on first run
		if (lastScore === null || lastStatus === null) {
			lastScore = game.score;
			lastStatus = game.status;
			return;
		}

		// Score SFX
		if (game.score > lastScore && game.status === 'playing') {
			controller.playSfx('correct');
		}
		lastScore = game.score;

		// Finish SFX
		if (game.status === 'finished' && lastStatus === 'playing') {
			controller.stopAll();
			const sfxName: 'victory' | 'times-up' = game.isWin ? 'victory' : 'times-up';
			controller.playSfx(sfxName);
		}
		lastStatus = game.status;
	});

	onDestroy(() => controller.destroy());
</script>
