<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';

  type Fund = {
    id: string; name: string; color?: string | null; icon?: string | null; targetCents?: number | null;
  };
  let funds: Fund[] = [];
  let name = '';

  async function load() {
    const res = await fetch('/api/funds');
    if (res.ok) funds = await res.json();
  }

  async function create() {
    if (!name.trim()) return;
    const res = await fetch('/api/funds', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
    if (res.ok) { name = ''; await load(); }
  }

  onMount(load);
</script>

<div class="flex items-center justify-between mb-4">
  <h1 class="text-2xl font-bold">Funds</h1>
  <a class="btn-soft" href="/">
    <Icon name="home" />
    <span>Home</span>
  </a>
</div>

<div class="card mb-6">
  <div class="card-header">
    <span class="title">Create a fund</span>
    <Icon name="wallet" />
  </div>
  <div class="card-body flex flex-wrap gap-3 items-end">
    <label class="block">
      <span class="text-sm muted">Name</span>
      <input class="input w-64" bind:value={name} placeholder="e.g., Groceries" aria-label="Fund name" />
    </label>
    <button class="btn-primary" on:click={create} aria-label="Create fund">
      <Icon name="star" /> Create
    </button>
  </div>
</div>

<ul class="space-y-2">
  {#each funds as f}
    <li class="p-4 rounded-xl border flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <span class="w-3 h-3 rounded-full shrink-0" style={`background:${f.color ?? '#999'}`}></span>
        <span class="font-medium break-words">{f.name}</span>
      </div>
      <a class="btn-soft" href={`/funds/${f.id}`} aria-label={`Open ${f.name}`} title={f.name}>
        <Icon name="arrows" /> Open
      </a>
    </li>
  {/each}
  {#if funds.length === 0}
    <li class="text-surface-500">No funds yet.</li>
  {/if}
</ul>
