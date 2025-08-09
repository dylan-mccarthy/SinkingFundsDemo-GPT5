<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  type Rule = { id: string; fundId: string; mode: 'fixed'|'percent'|'priority'; fixedCents: number|null; percentBp: number|null; priority: number };
  type Fund = { id: string; name: string; color?: string };
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
  // inline edit state
  let editingId: string | null = null;
  let editMode: Rule["mode"] = 'fixed';
  let editFixedDollars: number | null = null;
  let editPercentPct: number | null = null;
  let editPriority = 0;

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
  function startEdit(r: Rule) {
    editingId = r.id;
    editMode = r.mode;
    editFixedDollars = r.fixedCents != null ? r.fixedCents / 100 : null;
    editPercentPct = r.percentBp != null ? r.percentBp / 100 : null;
    editPriority = r.priority ?? 0;
  }
  function cancelEdit() {
    editingId = null;
  }
  function addValid(): boolean {
    if (!fundId) return false;
    if (mode === 'fixed') return fixedDollars != null && fixedDollars > 0;
    if (mode === 'percent') return percentPct != null && percentPct >= 0 && percentPct <= 100;
    // priority
    return priority >= 0;
  }
  function editValid(): boolean {
    if (!editingId) return false;
    if (editMode === 'fixed') return editFixedDollars != null && editFixedDollars > 0;
    if (editMode === 'percent') return editPercentPct != null && editPercentPct >= 0 && editPercentPct <= 100;
    return editPriority >= 0;
  }
  async function saveEdit(id: string) {
    if (!editValid()) return;
    const fixedCents = editMode === 'fixed' && editFixedDollars != null ? Math.round(editFixedDollars * 100) : null;
    const percentBp = editMode === 'percent' && editPercentPct != null ? Math.round(editPercentPct * 100) : null;
    const body: { mode?: Rule['mode']; fixedCents?: number|null; percentBp?: number|null; priority?: number } = {
      mode: editMode,
      fixedCents: editMode === 'fixed' ? fixedCents : null,
      percentBp: editMode === 'percent' ? percentBp : null,
      priority: editMode === 'priority' ? editPriority : 0
    };
    const res = await fetch(`/api/allocations/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { editingId = null; await load(); }
  }
  onMount(load);

  function fundById(id: string) { return fundsList.find((x) => x.id === id); }
  function fundName(id: string) { return fundById(id)?.name ?? id; }
  function fmt(c: number) { return (c/100).toFixed(2); }
</script>

<div class="flex items-center justify-between mb-4">
  <h1 class="text-2xl font-bold">Allocations</h1>
  <a href="/" class="btn-soft"><Icon name="home" /> Home</a>
</div>

<div class="card mb-4">
  <div class="card-header"><span class="title">Monthly deposit</span><Icon name="wallet" /></div>
  <div class="card-body flex items-end gap-2">
    <label for="dep" class="block">
      <span class="text-xs muted">Deposit ($)</span>
      <input id="dep" class="input w-40" type="number" min="0" step="0.01" bind:value={deposit} />
    </label>
    <button class="btn-primary" on:click={runPreview}><Icon name="adjustments" /> Preview</button>
    <button class="btn-soft" title="Reset all rules" on:click={async () => { await fetch('/api/allocations', { method: 'DELETE' }); await load(); preview = []; }}><Icon name="star" /> Reset</button>
  </div>
</div>

<div class="card mb-6">
  <div class="card-header"><span class="title">New rule</span><Icon name="adjustments" /></div>
  <div class="card-body flex flex-wrap gap-2 items-end">
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
  <button class="btn-primary" disabled={!addValid()} on:click={addRule}><Icon name="star" /> Add</button>
  </div>
</div>

<ul class="space-y-1 mb-6">
  {#each rules as r}
  <li class="text-sm p-3 border rounded-xl accent-l" style={`--accent:${fundById(r.fundId)?.color ?? '#64748b'}`}>
      {#if editingId === r.id}
        <div class="flex flex-wrap gap-2 items-end">
      <div class="font-medium flex items-center gap-2"><span class="accent-dot"></span>{fundName(r.fundId)}</div>
          <label class="block">
            <span class="text-xs">Mode</span>
            <select class="input w-36" bind:value={editMode}>
              <option value="fixed">Fixed amount</option>
              <option value="percent">Percent</option>
              <option value="priority">Priority</option>
            </select>
          </label>
          {#if editMode === 'fixed'}
            <label class="block">
              <span class="text-xs">Fixed ($)</span>
              <input class="input w-28" type="number" min="0" step="0.01" bind:value={editFixedDollars} />
            </label>
          {/if}
          {#if editMode === 'percent'}
            <label class="block">
              <span class="text-xs">Percent (%)</span>
              <input class="input w-24" type="number" min="0" max="100" step="0.01" bind:value={editPercentPct} />
            </label>
          {/if}
          {#if editMode === 'priority'}
            <label class="block">
              <span class="text-xs">Priority</span>
              <input class="input w-20" type="number" min="0" step="1" bind:value={editPriority} />
            </label>
          {/if}
          <div class="ml-auto flex gap-2">
            <button class="btn-soft" on:click={cancelEdit}>Cancel</button>
            <button class="btn-primary" disabled={!editValid()} on:click={() => saveEdit(r.id)}><Icon name="star" /> Save</button>
          </div>
        </div>
      {:else}
    <div class="flex items-center">
          <div class="flex-1">
      <span class="font-medium flex items-center gap-2"><span class="accent-dot"></span>{fundName(r.fundId)}</span>
            <span class="text-surface-500">
              — {r.mode === 'fixed' ? `Fixed $${fmt(r.fixedCents ?? 0)}` : r.mode === 'percent' ? `${(r.percentBp ?? 0)/100}%` : `Priority ${r.priority}`}
            </span>
          </div>
          <div class="flex gap-2">
            <button class="btn-soft" on:click={() => startEdit(r)}><Icon name="adjustments" /> Edit</button>
            <button class="btn-soft" on:click={() => removeRule(r.id)}><Icon name="arrows" /> Delete</button>
          </div>
        </div>
      {/if}
    </li>
  {/each}
  {#if rules.length === 0}
    <li class="text-surface-500">No rules yet.</li>
  {/if}
</ul>

<h2 class="text-xl font-semibold mb-2">Preview</h2>
<ul class="space-y-1">
  {#each preview as p}
    <li class="text-sm flex items-center justify-between accent-l" style={`--accent:${fundById(p.fundId)?.color ?? '#64748b'}`}>
      <span class="flex items-center gap-2"><span class="accent-dot"></span>{fundName(p.fundId)}</span>
      <span>${fmt(p.amountCents)}</span>
    </li>
  {/each}
  {#if preview.length === 0}
    <li class="text-surface-500">No preview.</li>
  {/if}
</ul>
