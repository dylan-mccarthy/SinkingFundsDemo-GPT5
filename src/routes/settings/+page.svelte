<script lang="ts">
  import { onMount } from 'svelte';
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

<h1 class="text-2xl font-bold mb-4">Settings</h1>
{#if !s}
  <p>Loading…</p>
{:else}
  <div class="grid gap-4 mb-4" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
    <label class="block">
      <span class="text-sm">Currency</span>
      <input class="input w-full" bind:value={s.currency} />
    </label>
    <label class="block">
      <span class="text-sm">Timezone</span>
      <input class="input w-full" bind:value={s.timezone} />
    </label>
    <label class="block">
      <span class="text-sm">Monthly deposit day</span>
      <input class="input w-full" type="number" min="1" max="28" bind:value={s.monthlyDepositDay} />
    </label>
    <label class="inline-flex items-center gap-2 mt-6">
      <input type="checkbox" bind:checked={s.overspendPrevent} />
      <span>Prevent overspend</span>
    </label>
  </div>
  <button class="btn" disabled={saving} on:click={save}>{saving ? 'Saving…' : 'Save'}</button>
{/if}
