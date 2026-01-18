import {defineConfig} from 'eslint/config';
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";

export default defineConfig([
	...tseslint.configs.recommended,
	{
		files: ["**/*.{ts,tsx}"],
		plugins: { prettier },
		rules: {
			"prettier/prettier": "error",
			"@typescript-eslint/no-unused-vars": "warn",
			"@typescript-eslint/explicit-module-boundary-types": "off",
		},
	}
]);
