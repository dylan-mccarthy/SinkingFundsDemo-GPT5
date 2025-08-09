<script lang="ts">
  import { onMount } from 'svelte';
  type Rule = { id: string; fundId: string; mode: 'fixed'|'percent'|'priority'; fixedCents: number|null; percentBp: number|null; priority: number };
  let rules: Rule[] = [];
  let deposit = 0;
  let preview: { fundId: string; amountCents: number }[] = [];
  // form
  let fundId = '';
  let mode: Rule['mode'] = 'fixed';
  let fixedCents: number | null = null;
  let percentBp: number | null = null;
  let priority = 0;

  async function load() {
    const res = await fetch('/api/allocations');
    if (res.ok) rules = (await res.json()).rules ?? [];
  }
  async function runPreview() {
    const res = await fetch(`/api/allocations?depositCents=${Math.round(deposit*100)}`);
    if (res.ok) preview = (await res.json()).preview ?? [];
  }
  async function addRule() {
    const body: any = { fundId, mode, fixedCents, percentBp, priority };
    const res = await fetch('/api/allocations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { fundId=''; mode='fixed'; fixedCents=null; percentBp=null; priority=0; await load(); }
  }
  async function removeRule(id: string) {
    const res = await fetch(`/api/allocations/${id}`, { method: 'DELETE' });
    if (res.ok) await load();
  }
  onMount(load);
</script>

<h1 class="text-2xl font-bold mb-4">Allocations</h1>

<div class="mb-4 flex items-end gap-2">
  <label for="dep">Deposit (monthly)</label>
  <input id="dep" class="input w-40" type="number" min="0" step="0.01" bind:value={deposit} />
  <button class="btn" on:click={runPreview}>Preview</button>
</div>

<div class="rounded-xl border p-3 mb-6">
  <div class="font-semibold mb-2">New rule</div>
  <div class="flex flex-wrap gap-2 items-end">
    <label class="block">
      <span class="text-xs">Fund ID</span>
      <input class="input w-48" bind:value={fundId} placeholder="fund id" />
    </label>
    <label class="block">
      <span class="text-xs">Mode</span>
      <select class="input w-32" bind:value={mode}>
        <option value="fixed">fixed</option>
        <option value="percent">percent</option>
        <option value="priority">priority</option>
      </select>
    </label>
    <label class="block">
      <span class="text-xs">Fixed (cents)</span>
      <input class="input w-32" type="number" bind:value={fixedCents} />
    </label>
    <label class="block">
      <span class="text-xs">Percent (bp)</span>
      <input class="input w-28" type="number" bind:value={percentBp} />
    </label>
    <label class="block">
      <span class="text-xs">Priority</span>
      <input class="input w-24" type="number" bind:value={priority} />
    </label>
    <button class="btn" on:click={addRule}>Add</button>
  </div>
</div>

<ul class="space-y-1 mb-6">
  {#each rules as r}
    <li class="text-sm flex justify-between items-center p-2 border rounded">
      <div>{r.mode}: {r.fundId} {r.fixedCents ?? r.percentBp ?? ''}</div>
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
    <li class="text-sm">{p.fundId}: {(p.amountCents/100).toFixed(2)}</li>
  {/each}
  {#if preview.length === 0}
    <li class="text-surface-500">No preview.</li>
  {/if}
</ul>
