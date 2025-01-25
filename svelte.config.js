import adapter from '@sveltejs/adapter-netlify';
import preprocess from 'svelte-preprocess';

const config = {
	preprocess: preprocess({
		scss: {
			prependData: `@use 'sass:math';
										@import './src/styles/mixins';
										@import './src/styles/variables/breakpoints';`
		}
	}),

	kit: {
		adapter: adapter({
			// If you have edge functions:
			edge: false,
			
			// If you have serverless functions:
			split: false
		}),
	},


};

export default config;
