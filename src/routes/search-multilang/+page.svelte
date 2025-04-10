<script lang="ts">
	import { onMount } from 'svelte';
	let query = 'cola';
	let products = [];
	let isLoading = false;
	let errorMessage = '';

	async function search() {
		isLoading = true;
		errorMessage = '';
		products = [];

		try {
			const apiUrl = `/api/translate-search?term=${encodeURIComponent(query)}`;
			const res = await fetch(apiUrl);

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
				throw new Error(errorData.error || `Request failed with status ${res.status}`);
			}

			const data = await res.json();
			products = data.products || [];

		} catch (error: any) {
			console.error('Search failed:', error);
			errorMessage = error.message || 'An unexpected error occurred.';
			products = [];
		} finally {
			isLoading = false;
		}
	}

	onMount(search);
</script>

<h1 class="mb-4 text-2xl font-bold">Multilingual Search Demo</h1>

<div class="mb-4 flex items-center">
	<input bind:value={query} class="mr-2 rounded border p-2 flex-grow" placeholder="Enter a keyword (e.g. cola)" />
	<button on:click={search} class="rounded bg-blue-500 px-4 py-2 text-white" disabled={isLoading}>
		{#if isLoading}
			Searching...
		{:else}
			Search
		{/if}
	</button>
</div>

{#if errorMessage}
	<p class="mt-4 text-red-500">Error: {errorMessage}</p>
{/if}

{#if !isLoading && !errorMessage && products.length === 0}
	<p class="mt-4 text-gray-500">No search results found.</p>
{/if}

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
{/if}