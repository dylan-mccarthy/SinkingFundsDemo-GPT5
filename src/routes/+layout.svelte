<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { page } from '$app/stores';

	let isDark = true;
	let hasUserPref = false; // track if user explicitly chose a theme
	let sidebarOpen = false;
		$: pathname = $page.url.pathname;
		// Month selector state (defaults to current UTC)
		let selYear = new Date().getUTCFullYear();
		let selMonth = new Date().getUTCMonth() + 1;
		function periodsLink() { return `/periods?year=${selYear}&month=${selMonth}`; }

	function applyTheme() {
		document.documentElement.classList.toggle('dark', isDark);
		// persist choice when explicitly set
		if (hasUserPref && typeof localStorage !== 'undefined') {
			localStorage.setItem('theme', isDark ? 'dark' : 'light');
		}
	}

	function detectInitialTheme() {
		if (typeof localStorage !== 'undefined') {
			const saved = localStorage.getItem('theme');
			if (saved === 'dark' || saved === 'light') {
				isDark = saved === 'dark';
				hasUserPref = true;
				return;
			}
		}
		// fall back to system preference
		const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
		isDark = !!prefersDark;
	}

	function watchSystemPref() {
		// Only react to system changes if user hasn't explicitly chosen
		const mq = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
		if (!mq) return;
		const handler = (e: MediaQueryListEvent) => {
			if (!hasUserPref) {
				isDark = e.matches;
				applyTheme();
			}
		};
		mq.addEventListener?.('change', handler);
		return () => mq.removeEventListener?.('change', handler);
	}

	onMount(() => {
		detectInitialTheme();
		const unwatch = watchSystemPref();
		applyTheme();
		return () => {
			if (unwatch) unwatch();
		};
	});

</script>

<div class="app-root min-h-screen flex">
	<!-- Sidebar -->
		<aside class={`hidden md:flex md:flex-col w-64 shrink-0 border-r bg-white dark:bg-slate-950`} aria-label="Sidebar">
		<div class="px-4 py-4 font-bold inline-flex items-center gap-2 border-b">
			<Icon name="wallet" />
			<span>Sinking Funds</span>
		</div>
			<nav class="p-3 space-y-2 text-sm">
				<a class={`btn-soft w-full justify-start ${pathname==='/' ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''}`} href="/" aria-current={pathname==='/' ? 'page' : undefined}><Icon name="home" /><span>Home</span></a>
				<a class={`btn-soft w-full justify-start ${pathname.startsWith('/funds') ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''}`} href="/funds" aria-current={pathname.startsWith('/funds') ? 'page' : undefined}><Icon name="wallet" /><span>Funds</span></a>
				<a class={`btn-soft w-full justify-start ${pathname.startsWith('/periods') ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''}`} href="/periods" aria-current={pathname.startsWith('/periods') ? 'page' : undefined}><Icon name="calendar" /><span>Periods</span></a>
				<a class={`btn-soft w-full justify-start ${pathname.startsWith('/allocations') ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''}`} href="/allocations" aria-current={pathname.startsWith('/allocations') ? 'page' : undefined}><Icon name="adjustments" /><span>Allocations</span></a>
				<a class={`btn-soft w-full justify-start ${pathname.startsWith('/transactions') ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''}`} href="/transactions" aria-current={pathname.startsWith('/transactions') ? 'page' : undefined}><Icon name="receipt" /><span>Transactions</span></a>
				<a class={`btn-soft w-full justify-start ${pathname.startsWith('/settings') ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''}`} href="/settings" aria-current={pathname.startsWith('/settings') ? 'page' : undefined}><Icon name="cog" /><span>Settings</span></a>
		</nav>
		<div class="mt-auto p-3 text-xs text-surface-500">© {new Date().getFullYear()} Sinking Funds</div>
	</aside>

	<!-- Drawer for mobile -->
		<div class={`fixed inset-0 z-20 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}
			 role="dialog" aria-modal="true" aria-hidden={!sidebarOpen}>
			<button type="button" class={`absolute inset-0 bg-black/30 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} aria-label="Close menu" on:click={() => sidebarOpen=false}></button>
		<aside class={`absolute left-0 top-0 bottom-0 w-64 border-r bg-white dark:bg-slate-950 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
			<div class="px-4 py-4 font-bold inline-flex items-center gap-2 border-b">
				<Icon name="wallet" />
				<span>Sinking Funds</span>
			</div>
						<nav class="p-3 space-y-2 text-sm">
							<a class={`btn-soft w-full justify-start ${pathname==='/' ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''}`} href="/" on:click={() => sidebarOpen=false} aria-current={pathname==='/' ? 'page' : undefined}><Icon name="home" /><span>Home</span></a>
							<a class={`btn-soft w-full justify-start ${pathname.startsWith('/funds') ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''}`} href="/funds" on:click={() => sidebarOpen=false} aria-current={pathname.startsWith('/funds') ? 'page' : undefined}><Icon name="wallet" /><span>Funds</span></a>
							<a class={`btn-soft w-full justify-start ${pathname.startsWith('/periods') ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''}`} href="/periods" on:click={() => sidebarOpen=false} aria-current={pathname.startsWith('/periods') ? 'page' : undefined}><Icon name="calendar" /><span>Periods</span></a>
							<a class={`btn-soft w-full justify-start ${pathname.startsWith('/allocations') ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''}`} href="/allocations" on:click={() => sidebarOpen=false} aria-current={pathname.startsWith('/allocations') ? 'page' : undefined}><Icon name="adjustments" /><span>Allocations</span></a>
							<a class={`btn-soft w-full justify-start ${pathname.startsWith('/transactions') ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''}`} href="/transactions" on:click={() => sidebarOpen=false} aria-current={pathname.startsWith('/transactions') ? 'page' : undefined}><Icon name="receipt" /><span>Transactions</span></a>
							<a class={`btn-soft w-full justify-start ${pathname.startsWith('/settings') ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''}`} href="/settings" on:click={() => sidebarOpen=false} aria-current={pathname.startsWith('/settings') ? 'page' : undefined}><Icon name="cog" /><span>Settings</span></a>
			</nav>
		</aside>
	</div>

	<!-- Content -->
	<div class="flex-1 min-w-0 flex flex-col">
		<header class="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-slate-950/70 border-b">
			<div class="px-4 py-3 flex items-center gap-3">
				<button class="icon-btn md:hidden" aria-label="Open menu" aria-expanded={sidebarOpen} on:click={() => sidebarOpen = !sidebarOpen}>
					<Icon name="arrows" />
				</button>
				<a href="/" class="font-bold inline-flex items-center gap-2 md:hidden">
					<Icon name="wallet" />
					<span>Sinking Funds</span>
				</a>
						<div class="ml-auto flex items-center gap-2">
							<!-- Month selector (quick access to Periods) -->
							<label class="hidden sm:flex items-center gap-2 text-xs" aria-label="Select month">
								<select class="input w-28" bind:value={selMonth} aria-label="Month">
									<option value={1}>Jan</option>
									<option value={2}>Feb</option>
									<option value={3}>Mar</option>
									<option value={4}>Apr</option>
									<option value={5}>May</option>
									<option value={6}>Jun</option>
									<option value={7}>Jul</option>
									<option value={8}>Aug</option>
									<option value={9}>Sep</option>
									<option value={10}>Oct</option>
									<option value={11}>Nov</option>
									<option value={12}>Dec</option>
								</select>
								<input class="input w-20" type="number" bind:value={selYear} aria-label="Year" />
								<a class="btn-soft" href={periodsLink()} title="Open Periods">Go</a>
							</label>
					<button
						class="icon-btn"
						aria-label="Toggle theme"
						aria-pressed={isDark}
						on:click={() => { hasUserPref = true; isDark = !isDark; applyTheme(); }}
						title={isDark ? 'Switch to Light' : 'Switch to Dark'}
					>
						{#if isDark}
							<Icon name="moon" />
						{:else}
							<Icon name="sun" />
						{/if}
					</button>
				</div>
			</div>
		</header>
		<main class="px-4 py-6 max-w-6xl">
			<slot />
		</main>
	</div>
</div>
