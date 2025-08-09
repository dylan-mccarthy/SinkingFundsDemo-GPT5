<script lang="ts">
	import '../app.postcss';
	import { setTheme } from '@skeletonlabs/skeleton';
	setTheme('skeleton');
</script>

<div class="min-h-screen p-4">
	<nav class="mb-6 flex gap-4">
		<a class="underline" href="/">Home</a>
		<a class="underline" href="/funds">Funds</a>
	</nav>
	<slot />
</div>
