<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
		let totalCents = 0;
		let funds: Array<{ id: string; name: string }> = [];
		let balances: Array<{ fundId: string; name: string; balanceCents: number; percentToTarget: number|null }> = [];
		let recent: Array<{ id: string; type: string; date: string; amountCents: number }> = [];
		let loading = true;
		let gamification: { streakMonths: number; level: number; badges: string[] } = { streakMonths: 0, level: 0, badges: [] };
		let prevBadges: string[] = [];
		let newBadge: string | null = null;
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
		const g = await fetch('/api/gamification');
			if (g.ok) {
				const gj = await g.json();
				// detect new badge
				const diff = (gj.badges as string[]).find((b: string) => !prevBadges.includes(b));
				gamification = gj;
				if (diff) {
					newBadge = diff;
					prevBadges = gj.badges;
				}
			}
		loading = false;
	}
	onMount(load);
	function fmt(c: number) { return (c/100).toFixed(2); }
</script>

<div class="flex items-center justify-between mb-4">
  <h1 class="text-3xl font-bold">Dashboard</h1>
  <a href="/transactions" class="btn-primary"><Icon name="receipt" /> Add Transaction</a>
</div>
{#if loading}
	<p>Loading…</p>
{:else}
	{#if newBadge}
		<div class="card p-0 mb-4" role="status" aria-live="polite">
			<div class="card-body flex items-center gap-3">
				<Icon name="trophy" />
				<div class="flex-1">
					<div class="font-semibold">New badge unlocked!</div>
					<div class="text-sm muted">{newBadge}</div>
				</div>
				<button class="btn-soft" on:click={() => newBadge=null} aria-label="Dismiss">Dismiss</button>
			</div>
		</div>
	{/if}
	<div class="grid gap-4 mb-6" style="grid-template-columns: repeat(auto-fit,minmax(220px,1fr));">
		<div class="card">
			<div class="card-header">
				<span class="title">Total Balance</span>
				<Icon name="wallet" />
			</div>
			<div class="card-body text-2xl font-bold">${fmt(totalCents)}</div>
		</div>
		<a href="/funds" class="card">
			<div class="card-header">
				<span class="title">Funds</span>
				<Icon name="wallet" />
			</div>
			<div class="card-body text-2xl font-bold">{funds.length}</div>
		</a>
		<a href="/allocations" class="card">
			<div class="card-header">
				<span class="title">Allocations</span>
				<Icon name="adjustments" />
			</div>
			<div class="card-body text-2xl font-bold">Manage</div>
		</a>
	</div>
		<div class="grid gap-4" style="grid-template-columns: repeat(auto-fit,minmax(260px,1fr));">
			<div class="card">
				<div class="card-header"><span class="title">Top funds</span><Icon name="star" /></div>
				<ul class="card-body space-y-1 text-sm">
					{#each balances.slice(0,5) as b}
						<li class="flex justify-between">
							<span>{b.name}</span>
							<span>${fmt(b.balanceCents)} {b.percentToTarget !== null ? `(${b.percentToTarget}%)` : ''}</span>
						</li>
					{/each}
				</ul>
				</div>
				<div class="card">
				<div class="card-header"><span class="title">Recent activity</span><Icon name="receipt" /></div>
				<ul class="card-body space-y-1 text-sm">
					{#each recent as r}
						<li class="flex justify-between">
							<span>{r.date.slice(0,10)} {r.type}</span>
							<span>${fmt(r.amountCents)}</span>
						</li>
					{/each}
				</ul>
			</div>
				<div class="card">
					<div class="card-header"><span class="title">Gamification</span><Icon name="trophy" /></div>
					<div class="flex items-center gap-4">
						<div>
							<div class="text-xs text-surface-500">Streak</div>
							<div class="text-xl font-bold">{gamification.streakMonths} months</div>
						</div>
						<div>
							<div class="text-xs text-surface-500">Level</div>
							<div class="text-xl font-bold">{gamification.level}</div>
						</div>
						<div class="flex-1">
							<div class="text-xs text-surface-500 mb-1">Badges</div>
							<div class="card-body flex flex-wrap gap-2">
								{#each gamification.badges as b}
									<span class="badge"><Icon name="star" size={14} /> {b}</span>
								{/each}
								{#if gamification.badges.length === 0}
									<span class="text-surface-500 text-xs">No badges yet. Keep saving!</span>
								{/if}
							</div>
						</div>
					</div>
				</div>
		</div>
  
{/if}
