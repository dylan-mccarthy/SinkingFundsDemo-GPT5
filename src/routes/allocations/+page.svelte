<script lang="ts">
  import { onMount } from 'svelte';
  type Rule = { id: string; fundId: string; mode: 'fixed'|'percent'|'priority'; fixedCents: number|null; percentBp: number|null; priority: number };
  type Fund = { id: string; name: string };
  type RuleInput = { fundId: string; mode: Rule['mode']; fixedCents: number|null; percentBp: number|null; priority: number };
  let rules: Rule[] = [];
  let fundsList: Fund[] = [];
  let deposit = 0; // dollars
  let preview: { fundId: string; amountCents: number }[] = [];
  // form
  let fundId = '';
  let mode: Rule["mode"] = 'fixed';
  // friendlier inputs: fixed in dollars, percent in % (not bp)
  let fixedDollars: number | null = null;
  let percentPct: number | null = null; // e.g. 5 means 5%
  let priority = 0;

  async function load() {
    const [allocRes, fundsRes] = await Promise.all([
      fetch('/api/allocations'),
      fetch('/api/funds')
    ]);
    if (allocRes.ok) rules = (await allocRes.json()).rules ?? [];
    if (fundsRes.ok) fundsList = await fundsRes.json();
  }
  async function runPreview() {
    const res = await fetch(`/api/allocations?depositCents=${Math.round(deposit*100)}`);
    if (res.ok) preview = (await res.json()).preview ?? [];
  }
  async function addRule() {
    if (!fundId) return;
    const fixedCents = mode === 'fixed' && fixedDollars != null ? Math.round(fixedDollars * 100) : null;
    const percentBp = mode === 'percent' && percentPct != null ? Math.round(percentPct * 100) : null;
    const body: RuleInput = { fundId, mode, fixedCents, percentBp, priority };
    const res = await fetch('/api/allocations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { fundId=''; mode='fixed'; fixedDollars=null; percentPct=null; priority=0; await load(); preview = []; }
  }
  async function removeRule(id: string) {
    const res = await fetch(`/api/allocations/${id}`, { method: 'DELETE' });
    if (res.ok) await load();
  }
  onMount(load);

  function fundName(id: string) {
    const f = fundsList.find((x) => x.id === id);
    return f ? f.name : id;
  }
  function fmt(c: number) { return (c/100).toFixed(2); }
</script>

<h1 class="text-2xl font-bold mb-4">Allocations</h1>

<div class="mb-4 flex items-end gap-2">
  <label for="dep">Deposit (monthly)</label>
  <input id="dep" class="input w-40" type="number" min="0" step="0.01" bind:value={deposit} />
  <button class="btn" on:click={runPreview}>Preview</button>
  <button class="btn btn-ghost" title="Reset all rules" on:click={async () => { await fetch('/api/allocations', { method: 'DELETE' }); await load(); preview = []; }}>Reset rules</button>
</div>

<div class="rounded-xl border p-3 mb-6">
  <div class="font-semibold mb-2">New rule</div>
  <div class="flex flex-wrap gap-2 items-end">
    <label class="block">
      <span class="text-xs">Fund</span>
      <select class="input w-56" bind:value={fundId}>
        <option value="" disabled selected>Select a fund</option>
        {#each fundsList as f}
          <option value={f.id}>{f.name}</option>
        {/each}
      </select>
    </label>
    <label class="block">
      <span class="text-xs">Mode</span>
      <select class="input w-36" bind:value={mode}>
        <option value="fixed">Fixed amount</option>
        <option value="percent">Percent of deposit</option>
        <option value="priority">Priority (use remainder)</option>
      </select>
    </label>
    {#if mode === 'fixed'}
      <label class="block">
        <span class="text-xs">Fixed ($)</span>
        <input class="input w-32" type="number" min="0" step="0.01" bind:value={fixedDollars} />
      </label>
    {/if}
    {#if mode === 'percent'}
      <label class="block">
        <span class="text-xs">Percent (%)</span>
        <input class="input w-28" type="number" min="0" max="100" step="0.01" bind:value={percentPct} />
      </label>
    {/if}
    {#if mode === 'priority'}
      <label class="block">
        <span class="text-xs">Priority (lower first)</span>
        <input class="input w-28" type="number" min="0" step="1" bind:value={priority} />
      </label>
    {/if}
    <button class="btn" on:click={addRule}>Add</button>
  </div>
</div>

<ul class="space-y-1 mb-6">
  {#each rules as r}
    <li class="text-sm flex justify-between items-center p-2 border rounded">
      <div>
        <span class="font-medium">{fundName(r.fundId)}</span>
        <span class="text-surface-500">
          — {r.mode === 'fixed' ? `Fixed $${fmt(r.fixedCents ?? 0)}` : r.mode === 'percent' ? `${(r.percentBp ?? 0)/100}%` : `Priority ${r.priority}`}
        </span>
      </div>
      <button class="btn btn-text" on:click={() => removeRule(r.id)}>Delete</button>
    </li>
  {/each}
  {#if rules.length === 0}
    <li class="text-surface-500">No rules yet.</li>
  {/if}
</ul>

<h2 class="text-xl font-semibold mb-2">Preview</h2>
<ul class="space-y-1">
  {#each preview as p}
    <li class="text-sm">{fundName(p.fundId)}: ${fmt(p.amountCents)}</li>
  {/each}
  {#if preview.length === 0}
    <li class="text-surface-500">No preview.</li>
  {/if}
</ul>
