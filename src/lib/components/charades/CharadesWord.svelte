<script lang="ts">
	let { word }: { word: string } = $props();
</script>

<div
	class="relative z-10 flex h-full w-full flex-col items-center justify-center p-6 mix-blend-difference"
>
	<h1
		class="text-center text-6xl font-black tracking-tighter text-white uppercase md:text-8xl lg:text-9xl"
	>
		{word}
	</h1>
</div>
