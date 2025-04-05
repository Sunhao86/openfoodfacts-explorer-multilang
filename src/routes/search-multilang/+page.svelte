<script lang="ts">
	import { onMount } from 'svelte';
	let query = 'cola'; // default keyword
	let products = [];

	async function search() {
		const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`;
		const res = await fetch(url);
		const data = await res.json();
		products = data.products;
	}

	onMount(search);
</script>

<h1 class="mb-4 text-2xl font-bold">Multilingual Search Demo</h1>

<input bind:value={query} class="mr-2 rounded border p-2" placeholder="Enter a keyword (e.g. cola)" />
<button on:click={search} class="rounded bg-blue-500 px-4 py-2 text-white">Search</button>

{#if products.length > 0}
	<ul class="mt-4 space-y-4">
		{#each products.slice(0, 10) as product}
			<li class="rounded border p-4 shadow">
				<strong>{product.product_name}</strong>
				{product.product_name_en ? ` (${product.product_name_en})` : ''}
				<br />
				{#if product.image_small_url}
					<img src={product.image_small_url} alt="product image" height="50" />
				{/if}
				<br />
				Nutri-score: {product.nutriscore_grade ?? 'Unknown'}
				<br />
				Languages: {product.languages_tags?.join(', ') ?? 'Unknown'}
			</li>
		{/each}
	</ul>
{:else}
	<p class="mt-4 text-gray-500">No search results found.</p>
{/if}
