import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { Translate } from '@google-cloud/translate/build/src/v2';

let translate: Translate | null = null;
let translationErrorOnInit: any = null;

try {
	if (!env.GOOGLE_TRANSLATE_API_KEY) {
		throw new Error('GOOGLE_TRANSLATE_API_KEY environment variable is not set.');
	}
	translate = new Translate({ key: env.GOOGLE_TRANSLATE_API_KEY });
	console.log('Google Translate client initialized successfully.');
} catch (error) {
	translationErrorOnInit = error;
	console.error('Failed to initialize Google Translate client:', error);
}

const targetLanguage = 'en';

export const GET: RequestHandler = async ({ url }) => {
	const originalQuery = url.searchParams.get('term');

	if (!originalQuery) {
		return json({ error: 'Search term is required' }, { status: 400 });
	}

	let queryForApi = originalQuery;

	if (translate) {
		try {
			console.log(`Attempting to translate "${originalQuery}" to ${targetLanguage}...`);
			const [translation] = await translate.translate(originalQuery, targetLanguage);

			if (translation.toLowerCase() !== originalQuery.toLowerCase()) {
				queryForApi = translation;
				console.log(`Successfully translated to: "${queryForApi}"`);
			} else {
				console.log(`Translation resulted in the same term or query is already in ${targetLanguage}. Using original: "${originalQuery}"`);
			}

		} catch (translationError) {
			console.error(`Translation failed for "${originalQuery}":`, translationError);
			queryForApi = originalQuery;
			console.log('Translation failed, falling back to original query.');
		}
	} else {
		console.warn('Translate client not initialized. Skipping translation.');
		if (translationErrorOnInit) {
			console.error('Reason for initialization failure:', translationErrorOnInit);
		}
		queryForApi = originalQuery;
	}

	try {
		const openFoodFactsApiUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
			queryForApi
		)}&search_simple=1&action=process&json=1`;

		console.log(`Workspaceing from OFF API: ${openFoodFactsApiUrl}`);

		const response = await fetch(openFoodFactsApiUrl);

		if (!response.ok) {
			throw new Error(`Open Food Facts API request failed with status ${response.status}`);
		}

		const data = await response.json();
		return json(data);

	} catch (offApiError) {
		console.error('Error fetching from Open Food Facts API:', offApiError);
		return json({ error: 'Failed to fetch search results' }, { status: 500 });
	}
};