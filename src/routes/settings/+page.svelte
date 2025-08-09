<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  type Settings = { currency: string; timezone: string; monthlyDepositDay: number; overspendPrevent: boolean };
  let s: Settings | null = null;
  let saving = false;
  async function load() {
    const res = await fetch('/api/settings');
    if (res.ok) s = await res.json();
  }
  async function save() {
    if (!s) return;
    saving = true;
    const res = await fetch('/api/settings', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(s) });
    saving = false;
    if (!res.ok) alert('Failed to save');
  }
  onMount(load);
</script>

<div class="flex items-center justify-between mb-4">
  <h1 class="text-2xl font-bold">Settings</h1>
  <a class="btn-soft" href="/"><Icon name="home" /> Home</a>
</div>
{#if !s}
  <p>Loading…</p>
{:else}
  <div class="card">
    <div class="card-header"><span class="title">Preferences</span><Icon name="cog" /></div>
    <div class="card-body">
      <div class="grid gap-4 mb-4" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
        <label class="block">
          <span class="text-sm muted">Currency</span>
          <input class="input w-full" bind:value={s.currency} aria-label="Currency" />
        </label>
        <label class="block">
          <span class="text-sm muted">Timezone</span>
          <input class="input w-full" bind:value={s.timezone} aria-label="Timezone" />
        </label>
        <label class="block">
          <span class="text-sm muted">Monthly deposit day</span>
          <input class="input w-full" type="number" min="1" max="28" bind:value={s.monthlyDepositDay} aria-label="Monthly deposit day" />
        </label>
        <label class="inline-flex items-center gap-2 mt-6">
          <input type="checkbox" bind:checked={s.overspendPrevent} aria-label="Prevent overspend" />
          <span>Prevent overspend</span>
        </label>
      </div>
      <button class="btn-primary" disabled={saving} on:click={save}>{saving ? 'Saving…' : 'Save'}</button>
    </div>
  </div>
{/if}
