<script lang="ts">
  export let name: 'home' | 'wallet' | 'calendar' | 'adjustments' | 'arrows' | 'receipt' | 'cog' | 'sun' | 'moon' | 'trophy' | 'star' = 'home';
  export let size: number = 18;
  export let className = '';
  const s = `${size}`;
</script>

{#if name === 'home'}
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width={s} height={s} class={className} aria-hidden="true"><path d="M11.47 3.84a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L18 11.53V18a2.25 2.25 0 0 1-2.25 2.25h-1.5a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75v3a.75.75 0 0 1-.75.75H6.25A2.25 2.25 0 0 1 4 18v-6.47l-1.97 1.97a.75.75 0 1 1-1.06-1.06l7.5-7.5Z"/></svg>
{:else if name === 'wallet'}
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width={s} height={s} class={className}><path d="M3.75 6A2.75 2.75 0 0 1 6.5 3.25h9.75a.75.75 0 0 1 0 1.5H6.5c-.69 0-1.25.56-1.25 1.25v.25H17A3.75 3.75 0 0 1 20.75 10v6.25A3.75 3.75 0 0 1 17 20H6.5A2.75 2.75 0 0 1 3.75 17.25V6Zm13.5 5.5a1 1 0 1 0 0 2h2a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75h-2Z"/></svg>
{:else if name === 'calendar'}
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width={s} height={s} class={className}><path d="M6.75 3a.75.75 0 0 1 .75.75V5h9V3.75a.75.75 0 0 1 1.5 0V5h.75A2.25 2.25 0 0 1 21 7.25v10A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25v-10A2.25 2.25 0 0 1 5.25 5H6V3.75A.75.75 0 0 1 6.75 3ZM4.5 10.25V17.5c0 .69.56 1.25 1.25 1.25h12.5c.69 0 1.25-.56 1.25-1.25v-7.25H4.5Z"/></svg>
{:else if name === 'adjustments'}
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width={s} height={s} class={className}><path d="M6.75 4.5a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0ZM7.5 5.25h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1 0-1.5Zm-4.25 6a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0ZM7.5 11.25h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1 0-1.5Zm-4.25 6a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0ZM7.5 17.25h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1 0-1.5Z"/></svg>
{:else if name === 'arrows'}
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width={s} height={s} class={className}><path d="M4.5 8.25a.75.75 0 0 1 .75-.75h8.69l-1.72-1.72a.75.75 0 1 1 1.06-1.06l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H5.25a.75.75 0 0 1-.75-.75Zm15 7.5a.75.75 0 0 1-.75.75H10.06l1.72 1.72a.75.75 0 1 1-1.06 1.06l-3-3a.75.75 0 0 1 0-1.06l3-3a.75.75 0 1 1 1.06 1.06l-1.72 1.72h8.69a.75.75 0 0 1 .75.75Z"/></svg>
{:else if name === 'receipt'}
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width={s} height={s} class={className}><path d="M6.75 3A2.75 2.75 0 0 0 4 5.75v13.19a.75.75 0 0 0 1.09.67l1.91-.96 1.91.96c.22.11.48.11.7 0l1.91-.96 1.91.96c.22.11.48.11.7 0l1.91-.96 1.91.96a.75.75 0 0 0 1.09-.67V5.75A2.75 2.75 0 0 0 17.25 3h-10.5Zm1.5 5.25a.75.75 0 0 1 0-1.5h7.5a.75.75 0 0 1 0 1.5h-7.5Zm0 3a.75.75 0 0 1 0-1.5h7.5a.75.75 0 0 1 0 1.5h-7.5Zm0 3a.75.75 0 0 1 0-1.5h4.5a.75.75 0 0 1 0 1.5h-4.5Z"/></svg>
{:else if name === 'cog'}
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width={s} height={s} class={className}><path d="M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm8.25 3a6.25 6.25 0 0 0-.1-1.11l1.66-1.29a.75.75 0 0 0 .17-1.01l-1.5-2.6a.75.75 0 0 0-.93-.32l-1.95.78a8.04 8.04 0 0 0-1.91-1.11l-.3-2.08a.75.75 0 0 0-.74-.64h-3a.75.75 0 0 0-.74.64l-.3 2.08a8.04 8.04 0 0 0-1.91 1.11l-1.95-.78a.75.75 0 0 0-.93.32l-1.5 2.6a.75.75 0 0 0 .17 1.01l1.66 1.29c-.07.36-.1.73-.1 1.11s.04.75.1 1.11L2.7 14.5a.75.75 0 0 0-.17 1.01l1.5 2.6c.2.35.6.49.93.32l1.95-.78c.58.46 1.22.83 1.91 1.11l.3 2.08c.06.36.37.64.74.64h3c.37 0 .68-.28.74-.64l.3-2.08c.69-.28 1.33-.65 1.91-1.11l1.95.78c.33.17.74.03.93-.32l1.5-2.6a.75.75 0 0 0-.17-1.01l-1.66-1.29c.06-.36.1-.73.1-1.11Z"/></svg>
{:else if name === 'sun'}
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width={s} height={s} class={className}><path d="M12 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 12 5.25ZM5.47 6.53a.75.75 0 1 1 1.06-1.06l.35.35a.75.75 0 0 1-1.06 1.06l-.35-.35ZM4.5 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1A.75.75 0 0 1 4.5 12Zm7.5 6.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Zm6.03-11.97a.75.75 0 0 1 0 1.06l-.35.35a.75.75 0 1 1-1.06-1.06l.35-.35a.75.75 0 0 1 1.06 0ZM18.75 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75ZM9 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.53 18.53l.35-.35a.75.75 0 0 1 1.06 1.06l-.35.35a.75.75 0 0 1-1.06-1.06Zm9.88 0a.75.75 0 0 1 1.06 0l.35.35a.75.75 0 1 1-1.06 1.06l-.35-.35a.75.75 0 0 1 0-1.06Z"/></svg>
{:else if name === 'moon'}
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width={s} height={s} class={className}><path d="M21 12c0 5-4 9-9 9a9 9 0 0 1-8.52-6.21.75.75 0 0 1 .97-.94A7.5 7.5 0 0 0 12 4.5c.95 0 1.86.18 2.7.52.36.15.44.64.18.92A6.74 6.74 0 0 0 21 12Z"/></svg>
{:else if name === 'trophy'}
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width={s} height={s} class={className}><path d="M6 3.75A.75.75 0 0 1 6.75 3h10.5a.75.75 0 0 1 .75.75v1.5A3.75 3.75 0 0 0 21.75 9 4.75 4.75 0 0 1 17 13.75h-2.25v1A3.25 3.25 0 0 1 11.5 18h-1v1.25H15a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5h1V18h-1a3.25 3.25 0 0 1-3.25-3.25v-1H3A3.75 3.75 0 0 1-.75 9 3.75 3.75 0 0 1 3 5.25v-1.5A.75.75 0 0 1 3.75 3H6Zm12 2.25H6v1A2.25 2.25 0 0 1 3.75 9 2.25 2.25 0 0 0 6 11.25h11A2.25 2.25 0 0 0 19.25 9 2.25 2.25 0 0 1 18 6.75Z"/></svg>
{:else if name === 'star'}
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width={s} height={s} class={className}><path d="M11.48 3.5a.75.75 0 0 1 1.04 0l2.73 2.8 3.8.62a.75.75 0 0 1 .4 1.3l-2.7 2.62.66 3.77a.75.75 0 0 1-1.1.79L12 14.96 7.69 15.8a.75.75 0 0 1-1.1-.79l.66-3.77-2.7-2.62a.75.75 0 0 1 .4-1.3l3.8-.62 2.73-2.8Z"/></svg>
{/if}

<style>
  svg { display: inline-block; }
  /* Global utility classes live in app.postcss */
</style>
