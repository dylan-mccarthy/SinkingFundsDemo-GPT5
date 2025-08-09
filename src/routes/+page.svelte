<script lang="ts">
	import { onMount } from 'svelte';
	let totalCents = 0;
	let funds: Array<{ id: string; name: string }> = [];
	let loading = true;
	async function load() {
		const res = await fetch('/api/reports/summary');
		if (res.ok) {
			const json = await res.json();
			totalCents = json.totalCents ?? 0;
			funds = json.funds ?? [];
		}
		loading = false;
	}
	onMount(load);
	function fmt(c: number) { return (c/100).toFixed(2); }
</script>

<h1 class="text-3xl font-bold mb-4">Dashboard</h1>
{#if loading}
	<p>Loading…</p>
{:else}
	<div class="grid gap-4 mb-6" style="grid-template-columns: repeat(auto-fit,minmax(200px,1fr));">
		<div class="p-4 rounded-xl border">
			<div class="text-sm text-surface-500">Total Balance</div>
			<div class="text-2xl font-bold">${fmt(totalCents)}</div>
		</div>
		<a href="/funds" class="p-4 rounded-xl border">
			<div class="text-sm text-surface-500">Funds</div>
			<div class="text-2xl font-bold">{funds.length}</div>
		</a>
		<a href="/allocations" class="p-4 rounded-xl border">
			<div class="text-sm text-surface-500">Allocations</div>
			<div class="text-2xl font-bold">Manage</div>
		</a>
	</div>
	<div class="text-surface-500 text-sm">Gamification panel coming soon (streaks, badges, levels)</div>
{/if}
