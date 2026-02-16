<script lang="ts">
	import { Henyo } from './game.svelte.js';
	import { AudioController } from '../charades/audio.svelte.js';

	let {
		game,
		volume = 0.5,
		enabled = false
	}: { game: Henyo; volume?: number; enabled?: boolean } = $props();

	const controller = new AudioController();

	$effect(() => {
		controller.volume = volume;
	});

	$effect(() => {
		controller.enabled = enabled;
	});

	// React to game status changes
	$effect(() => {
		const status = game.status;
		const timeLeft = game.timeLeft;

		if (status === 'playing') {
			if (timeLeft <= 10) {
				controller.playMusic(1.5); // Fast music for last 10s
			} else {
				controller.playMusic(1.0);
			}
		} else if (status === 'paused') {
			controller.pauseMusic(true); // Dim music
		} else if (status === 'finished') {
			controller.stopAll();
			if (game.score > 0) {
				controller.playSfx('victory');
			} else {
				controller.playSfx('times-up');
			}
		} else {
			controller.stopAll();
		}
	});

	// Trigger sfx on correct guesses
	$effect(() => {
		const score = game.score;
		if (score > 0 && game.status === 'playing') {
			controller.playSfx('correct');
		}
	});

	// Ramping logic for the 10s warning
	let hasRamped = $state(false);
	$effect(() => {
		if (game.status === 'playing' && game.timeLeft <= 10 && !hasRamped) {
			controller.rampPlaybackRate(1.5);
			hasRamped = true;
		}
		if (game.status !== 'playing' || game.timeLeft > 10) {
			hasRamped = false;
		}
	});

	export function unlock() {
		controller.unlock();
	}
</script>
