<script lang="ts">
	import { Card, CardHeader, CardTitle, CardContent } from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { cn } from '$lib/utils.js';
	import WordManager from './WordManager.svelte';
	import { Plus } from '@lucide/svelte';

	export interface Team {
		id: string;
		name: string;
		score: number;
		words: string[];
	}

	let {
		teams = [],
		activeTeamId,
		onSelectTeam,
		onUpdateTeam,
		onDeleteTeam,
		onAddTeam,
		disabled = false
	}: {
		teams: Team[];
		activeTeamId: string | null;
		onSelectTeam: (id: string) => void;
		onUpdateTeam: (id: string, name: string, words: string[]) => void;
		onDeleteTeam: (id: string) => void;
		onAddTeam: () => void;
		disabled?: boolean;
	} = $props();
</script>

<div class="no-scrollbar flex gap-4 overflow-x-auto p-4">
	{#each teams as team (team.id)}
		<div class="flex min-w-[140px] flex-shrink-0 flex-col gap-2">
			<div class="flex items-center justify-between px-1">
				<span class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
					{team.words.length} words
				</span>
				<WordManager
					{team}
					onSave={(name, words) => onUpdateTeam(team.id, name, words)}
					onDelete={() => onDeleteTeam(team.id)}
				/>
			</div>
			<button
				class="w-full text-left"
				onclick={() => !disabled && onSelectTeam(team.id)}
				disabled={disabled && activeTeamId !== team.id}
			>
				<Card
					class={cn(
						'transition-all duration-200',
						activeTeamId === team.id
							? 'bg-primary/5 ring-2 ring-primary'
							: 'opacity-70 grayscale-[0.5] hover:border-primary/50',
						activeTeamId === team.id && 'opacity-100 grayscale-0'
					)}
				>
					<CardHeader class="p-3 pb-0">
						<CardTitle class="text-xs tracking-wider text-muted-foreground uppercase">
							{team.name}
						</CardTitle>
					</CardHeader>
					<CardContent class="p-3 pt-1">
						<div class="text-2xl font-bold">{team.score}</div>
						{#if activeTeamId === team.id}
							<Badge variant="default" class="mt-2 px-1 py-0 text-[10px]">ACTIVE</Badge>
						{/if}
					</CardContent>
				</Card>
			</button>
		</div>
	{/each}

	{#if !disabled}
		<button
			class="flex min-w-[140px] flex-shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/20 transition-colors hover:bg-muted/50"
			onclick={onAddTeam}
		>
			<Plus class="h-6 w-6 text-muted-foreground" />
			<span class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
				Add Team
			</span>
		</button>
	{/if}
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
