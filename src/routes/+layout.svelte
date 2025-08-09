<script lang="ts">
	import '../app.postcss';
	import { onMount } from 'svelte';
	let isDark = true;
	function applyTheme() {
		document.documentElement.classList.toggle('dark', isDark);
	}
	onMount(applyTheme);
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
						<button class="btn" aria-labelledby="theme-label" on:click={() => (isDark = !isDark)} aria-label="Toggle theme">Toggle</button>
					</div>
		</div>
	</header>
	<main class="max-w-6xl mx-auto px-4 py-6">
		<slot />
	</main>
	<footer class="max-w-6xl mx-auto px-4 py-6 text-xs text-surface-500">© {new Date().getFullYear()} Sinking Funds</footer>
	</div>
