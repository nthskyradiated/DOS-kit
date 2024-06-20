<script>
	import ThemeToggler from './ThemeToggler.svelte';
</script>

<header class="my-12 mb-32 ml-4 mr-10 flex w-full flex-row gap-4 text-start sm:ml-8">
	<ThemeToggler side="bottom"/>
	<div>
		<h1 class="mb-2 text-3xl font-bold leading-none">LSD kit</h1>
		<small class="my-4 text-sm text-gray-500">
			Authentication template made with Lucia-auth, Drizzle-ORM, and Sveltekit</small
		>
	</div>
</header>
