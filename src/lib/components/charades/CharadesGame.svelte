<script lang="ts">
	import { onMount } from 'svelte';
	import DrainingTank from './DrainingTank.svelte';
	import CharadesWord from './CharadesWord.svelte';
	import TimesUpOverlay from './TimesUpOverlay.svelte';
	import TimerDisplay from './TimerDisplay.svelte';

	let { word, duration = 60 }: { word: string; duration?: number } = $props();

	let timeLeft = $state(duration);

	onMount(() => {
		const timer = setInterval(() => {
			if (timeLeft > 0) timeLeft--;
		}, 1000);
		return () => clearInterval(timer);
	});
</script>

<div
	class="fixed inset-0 flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-background select-none"
>
	<DrainingTank {timeLeft} totalTime={duration} />
	<TimerDisplay {timeLeft} />
	<CharadesWord {word} />
</div>

{#if timeLeft === 0}
	<TimesUpOverlay />
{/if}
