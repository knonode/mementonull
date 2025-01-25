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
		adapter: adapter(),
	},


};

export default config;
