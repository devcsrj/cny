<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Pencil } from '@lucide/svelte';
	import type { GMTeam } from './gm.svelte.js';

	let {
		team,
		onSave,
		onDelete
	}: {
		team: GMTeam;
		onSave: (name: string, words: string[]) => void;
		onDelete: () => void;
	} = $props();

	let open = $state(false);
	let name = $state(team.name);
	let wordsText = $state(team.words.join('\n'));

	function handleSave() {
		const words = wordsText
			.split('\n')
			.map((w) => w.trim())
			.filter((w) => w.length > 0);
		onSave(name, words);
		open = false;
	}

	function handleDelete() {
		if (confirm(`Are you sure you want to delete "${team.name}"?`)) {
			onDelete();
			open = false;
		}
	}

	$effect(() => {
		if (open) {
			name = team.name;
			wordsText = team.words.join('\n');
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button variant="ghost" size="icon" class="h-6 w-6 rounded-full">
			<Pencil class="h-3 w-3" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit Team Settings</Dialog.Title>
			<Dialog.Description>Update team name and its word list.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="name">Team Name</Label>
				<Input id="name" bind:value={name} placeholder="Enter team name..." />
			</div>
			<div class="grid gap-2">
				<Label for="words">Word List</Label>
				<Textarea
					id="words"
					placeholder="Enter words..."
					class="min-h-[300px] font-mono text-sm"
					bind:value={wordsText}
				/>
			</div>
		</div>
		<Dialog.Footer class="flex flex-col gap-2 sm:flex-row">
			<Button variant="destructive" class="sm:mr-auto" onclick={handleDelete}>Delete Team</Button>
			<div class="flex gap-2">
				<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button onclick={handleSave}>Save Changes</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
