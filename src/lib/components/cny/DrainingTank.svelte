<script lang="ts">
	let { timeLeft, duration }: { timeLeft: number; duration: number } = $props();
	let height = $derived((timeLeft / duration) * 100);
</script>

<div
	class="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-linear"
	style:height="{height}%"
	class:bg-primary={timeLeft > 5}
	class:bg-destructive={timeLeft <= 5}
></div>
