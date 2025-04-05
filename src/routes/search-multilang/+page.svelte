<script lang="ts">
    import { onMount } from 'svelte';
    let query = '可乐'; // 默认关键词
    let products = [];
  
    async function search() {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`;
      const res = await fetch(url);
      const data = await res.json();
      products = data.products;
    }
  
    onMount(search);
  </script>
  
  <h1 class="text-2xl font-bold mb-4">多语言搜索演示</h1>
  
  <input bind:value={query} class="border p-2 mr-2 rounded" placeholder="输入关键词（如：可乐）" />
  <button on:click={search} class="bg-blue-500 text-white px-4 py-2 rounded">搜索</button>
  
  {#if products.length > 0}
    <ul class="mt-4 space-y-4">
      {#each products.slice(0, 10) as product}
        <li class="border p-4 rounded shadow">
          <strong>{product.product_name}</strong>
          {product.product_name_cn ? `（${product.product_name_cn}）` : ''}
          <br />
          {#if product.image_small_url}
            <img src={product.image_small_url} alt="product image" height="50" />
          {/if}
          <br />
          Nutri-score: {product.nutriscore_grade ?? '未知'}
          <br />
          语言：{product.languages_tags?.join(', ') ?? '未知'}
        </li>
      {/each}
    </ul>
  {:else}
    <p class="mt-4 text-gray-500">暂无搜索结果</p>
  {/if}
  