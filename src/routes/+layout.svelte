<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';

	let isDark = true;
	let hasUserPref = false; // track if user explicitly chose a theme

	function applyTheme() {
		document.documentElement.classList.toggle('dark', isDark);
		try {
			if (hasUserPref) {
				localStorage.setItem('theme', isDark ? 'dark' : 'light');
			}
		} catch {}
	}

	function detectInitialTheme() {
		try {
			const saved = localStorage.getItem('theme');
			if (saved === 'dark' || saved === 'light') {
				isDark = saved === 'dark';
				hasUserPref = true;
				return;
			}
		} catch {}
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
			unwatch && unwatch();
		};
	});

	$: applyTheme();
</script>

<div class="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
	<header class="sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-slate-950/70 border-b">
		<div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
			<a href="/" class="font-bold">Sinking Funds</a>
			<nav class="flex gap-4 text-sm">
				<a class="hover:underline" href="/">Home</a>
				<a class="hover:underline" href="/funds">Funds</a>
				<a class="hover:underline" href="/periods">Periods</a>
				<a class="hover:underline" href="/allocations">Allocations</a>
				<a class="hover:underline" href="/transactions">Transactions</a>
				<a class="hover:underline" href="/settings">Settings</a>
			</nav>
					<div class="ml-auto flex items-center gap-2">
						<span id="theme-label" class="text-xs">{isDark ? 'Dark' : 'Light'}</span>
						<button
							class="btn"
							aria-labelledby="theme-label"
							aria-pressed={isDark}
							on:click={() => { hasUserPref = true; isDark = !isDark; }}
							aria-label="Toggle theme"
						>
							Toggle
						</button>
					</div>
		</div>
	</header>
	<main class="max-w-6xl mx-auto px-4 py-6">
		<slot />
	</main>
	<footer class="max-w-6xl mx-auto px-4 py-6 text-xs text-surface-500">© {new Date().getFullYear()} Sinking Funds</footer>
	</div>
