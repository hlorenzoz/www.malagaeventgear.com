import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			$lib: resolve(__dirname, './src/lib'),
		},
	},
	test: {
		environment: 'node',
		include: ['src/lib/server/**/*.test.ts', 'workers/**/*.test.ts'],
		exclude: ['tests/e2e/**'],
	},
});
