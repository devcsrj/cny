<script lang="ts">
	let { timeLeft }: { timeLeft: number } = $props();
</script>

<div
	class="absolute top-10 z-20 font-mono text-5xl font-black tracking-widest text-white opacity-80 mix-blend-difference"
>
	{timeLeft.toString().padStart(2, '0')}
</div>
