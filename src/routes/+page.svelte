<script lang="ts">
	import { onMount } from 'svelte';
		let totalCents = 0;
		let funds: Array<{ id: string; name: string }> = [];
		let balances: Array<{ fundId: string; name: string; balanceCents: number; percentToTarget: number|null }> = [];
		let recent: Array<{ id: string; type: string; date: string; amountCents: number }> = [];
	let loading = true;
	async function load() {
		const res = await fetch('/api/reports/summary');
		if (res.ok) {
			const json = await res.json();
			totalCents = json.totalCents ?? 0;
			funds = json.funds ?? [];
		}
		const b = await fetch('/api/funds/balances');
		if (b.ok) balances = await b.json();
		const t = await fetch('/api/transactions');
		if (t.ok) recent = (await t.json()).slice(0, 5);
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
		<div class="grid gap-4" style="grid-template-columns: repeat(auto-fit,minmax(260px,1fr));">
			<div class="p-4 rounded-xl border">
				<div class="text-sm text-surface-500 mb-2">Top funds</div>
				<ul class="space-y-1 text-sm">
					{#each balances.slice(0,5) as b}
						<li class="flex justify-between">
							<span>{b.name}</span>
							<span>${fmt(b.balanceCents)} {b.percentToTarget !== null ? `(${b.percentToTarget}%)` : ''}</span>
						</li>
					{/each}
				</ul>
			</div>
			<div class="p-4 rounded-xl border">
				<div class="text-sm text-surface-500 mb-2">Recent activity</div>
				<ul class="space-y-1 text-sm">
					{#each recent as r}
						<li class="flex justify-between">
							<span>{r.date.slice(0,10)} {r.type}</span>
							<span>${fmt(r.amountCents)}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
		<div class="mt-4 text-surface-500 text-sm">Gamification panel coming soon (streaks, badges, levels)</div>
{/if}
