<script lang="ts">
	let { timeLeft, totalTime }: { timeLeft: number; totalTime: number } = $props();
	let height = $derived((timeLeft / totalTime) * 100);
</script>

<div
	class="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-linear"
	style:height="{height}%"
	class:bg-primary={timeLeft > 5}
	class:bg-destructive={timeLeft <= 5}
></div>
