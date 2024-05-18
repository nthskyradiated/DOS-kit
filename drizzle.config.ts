import { defineConfig } from 'drizzle-kit';
import env from './src/env';

export default defineConfig({
	schema: './src/db/schema/index.ts',
	out: './src/db/migrations',
	dialect: 'sqlite',
	dbCredentials: {
		url: env.DATABASE_URL
	},
	verbose: true,
	strict: true
});
