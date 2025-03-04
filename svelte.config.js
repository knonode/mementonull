import adapter from '@sveltejs/adapter-netlify';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		scss: {
			prependData: `@use 'sass:math';
										@import './src/styles/mixins';
										@import './src/styles/variables/breakpoints';`
		}
	}),

	kit: {
		adapter: adapter(),
		paths: {
			base: ''
		},
		prerender: {
			entries: ['*']  // Prerender all routes
		}
	}
};

export default config;
