<script lang="ts">
  import { onMount } from 'svelte';

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

<h1 class="text-2xl font-bold mb-4">Funds</h1>

<div class="flex gap-2 items-end mb-6">
  <label class="form-control w-full max-w-xs">
    <span class="label">Name</span>
    <input class="input" bind:value={name} placeholder="e.g., Groceries" />
  </label>
  <button class="btn" on:click={create}>Create</button>
  <a class="btn btn-text" href="/">Back</a>
</div>

<ul class="space-y-2">
  {#each funds as f}
    <li class="p-3 rounded-xl border flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full" style={`background:${f.color ?? '#999'}`}></span>
        <span class="font-medium">{f.name}</span>
      </div>
      <a class="text-primary-500" href={`/funds/${f.id}`}>open</a>
    </li>
  {/each}
  {#if funds.length === 0}
    <li class="text-surface-500">No funds yet.</li>
  {/if}
</ul>
