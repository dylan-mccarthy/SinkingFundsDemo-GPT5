<script lang="ts">
	import '../app.postcss';
</script>

<div class="min-h-screen p-4">
	<nav class="mb-6 flex gap-4">
		<a class="underline" href="/">Home</a>
		<a class="underline" href="/funds">Funds</a>
	<a class="underline" href="/allocations">Allocations</a>
		<a class="underline" href="/transactions">Transactions</a>
	<a class="underline" href="/settings">Settings</a>
	</nav>
	<slot />
</div>
