<script lang="ts">
  import { onMount } from 'svelte';
  type Rule = { id: string; fundId: string; mode: 'fixed'|'percent'|'priority'; fixedCents?: number|null; percentBp?: number|null; priority: number };
  let rules: Rule[] = [];
  let deposit = 0;
  let preview: { fundId: string; amountCents: number }[] = [];

  async function load() {
    const res = await fetch('/api/allocations');
    if (res.ok) rules = (await res.json()).rules ?? [];
  }
  async function runPreview() {
    const res = await fetch(`/api/allocations?depositCents=${Math.round(deposit*100)}`);
    if (res.ok) preview = (await res.json()).preview ?? [];
  }
  onMount(load);
</script>

<h1 class="text-2xl font-bold mb-4">Allocations</h1>

<div class="mb-4 flex items-end gap-2">
  <label for="dep">Deposit (monthly)</label>
  <input id="dep" class="input w-40" type="number" min="0" step="0.01" bind:value={deposit} />
  <button class="btn" on:click={runPreview}>Preview</button>
</div>

<ul class="space-y-1 mb-6">
  {#each rules as r}
    <li class="text-sm">{r.mode}: {r.fundId} {r.fixedCents ?? r.percentBp ?? ''}</li>
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
