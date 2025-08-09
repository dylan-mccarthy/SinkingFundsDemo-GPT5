<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	let isDark = true;
	let hasUserPref = false; // track if user explicitly chose a theme
	let sidebarOpen = false;

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
			<a class="btn-soft w-full justify-start" href="/"><Icon name="home" /><span>Home</span></a>
			<a class="btn-soft w-full justify-start" href="/funds"><Icon name="wallet" /><span>Funds</span></a>
			<a class="btn-soft w-full justify-start" href="/periods"><Icon name="calendar" /><span>Periods</span></a>
			<a class="btn-soft w-full justify-start" href="/allocations"><Icon name="adjustments" /><span>Allocations</span></a>
			<a class="btn-soft w-full justify-start" href="/transactions"><Icon name="receipt" /><span>Transactions</span></a>
			<a class="btn-soft w-full justify-start" href="/settings"><Icon name="cog" /><span>Settings</span></a>
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
					<a class="btn-soft w-full justify-start" href="/" on:click={() => sidebarOpen=false}><Icon name="home" /><span>Home</span></a>
					<a class="btn-soft w-full justify-start" href="/funds" on:click={() => sidebarOpen=false}><Icon name="wallet" /><span>Funds</span></a>
					<a class="btn-soft w-full justify-start" href="/periods" on:click={() => sidebarOpen=false}><Icon name="calendar" /><span>Periods</span></a>
					<a class="btn-soft w-full justify-start" href="/allocations" on:click={() => sidebarOpen=false}><Icon name="adjustments" /><span>Allocations</span></a>
					<a class="btn-soft w-full justify-start" href="/transactions" on:click={() => sidebarOpen=false}><Icon name="receipt" /><span>Transactions</span></a>
					<a class="btn-soft w-full justify-start" href="/settings" on:click={() => sidebarOpen=false}><Icon name="cog" /><span>Settings</span></a>
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
