<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';

	let isDark = true;
	let hasUserPref = false; // track if user explicitly chose a theme

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

<div class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
	<header class="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-slate-950/70 border-b">
			<div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
				<a href="/" class="font-bold inline-flex items-center gap-2">
					<Icon name="wallet" />
					<span>Sinking Funds</span>
				</a>
				<nav class="flex gap-2 text-sm">
					<a class="btn-soft" href="/">
						<Icon name="home" />
						<span>Home</span>
					</a>
					<a class="btn-soft" href="/funds">
						<Icon name="wallet" />
						<span>Funds</span>
					</a>
					<a class="btn-soft" href="/periods">
						<Icon name="calendar" />
						<span>Periods</span>
					</a>
					<a class="btn-soft" href="/allocations">
						<Icon name="adjustments" />
						<span>Allocations</span>
					</a>
					<a class="btn-soft" href="/transactions">
						<Icon name="receipt" />
						<span>Transactions</span>
					</a>
					<a class="btn-soft" href="/settings">
						<Icon name="cog" />
						<span>Settings</span>
					</a>
				</nav>
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
	<main class="max-w-6xl mx-auto px-4 py-6">
		<slot />
	</main>
	<footer class="max-w-6xl mx-auto px-4 py-6 text-xs text-surface-500">© {new Date().getFullYear()} Sinking Funds</footer>
	</div>
