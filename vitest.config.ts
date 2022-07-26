import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    'import.meta.vitest': false,
  },
  test: {
    passWithNoTests: true,
    includeSource: ['src/**/*.{js,ts}'],
    isolate: false,
  },
});
