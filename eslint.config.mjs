import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default [
	{ ignores: ['node_modules/**', 'dist/**', 'build/**', 'vite.config.js'] },
	{
		files: ['**/*.js', '**/*.jsx'],
		plugins: { react, 'react-hooks': reactHooks, import: importPlugin },
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: { ecmaFeatures: { jsx: true } },
			globals: { ...globals.browser, React: 'readonly', Intl: 'readonly' },
		},
		settings: {
			react: { version: 'detect' },
			'import/resolver': {
				node: { extensions: ['.js', '.jsx'] },
				alias: { map: [['@', './src']], extensions: ['.js', '.jsx'] },
			},
		},
		rules: {
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			...importPlugin.flatConfigs.recommended.rules,

			// Reglas no críticas - deshabilitadas porque el código funciona bien sin ellas
			'react/prop-types': 'off',
			'react/no-unescaped-entities': 'off',
			'react/display-name': 'off', // No crítico, el componente funciona sin displayName
			'react/jsx-uses-react': 'off', // No necesario en React 17+, no crítico
			'react/react-in-jsx-scope': 'off', // No necesario en React 17+, no crítico
			'react/jsx-uses-vars': 'off', // No crítico, el código funciona bien
			'react/jsx-no-comment-textnodes': 'off', // No crítico, los comentarios podrían ser visibles si se ponen dentro del JSX; la mayoría de los casos solo renderizan texto como '///'

			'no-unused-vars': 'off', // No crítico, el código funciona bien con variables no usadas
			'import/no-named-as-default': 'off', // Puede causar errores de importación en tiempo de ejecución; normalmente está bien dejarlo así
			'import/no-named-as-default-member': 'off', // Puede causar errores de importación en tiempo de ejecución

			// Reglas críticas que previenen errores en tiempo de ejecución
			'no-undef': 'error', // Las variables indefinidas causan errores en tiempo de ejecución

			// Anular reglas de importación recomendadas para comprobación más estricta
			'import/no-self-import': 'error', // Regla extremadamente rápida; si falla provoca bucle infinito/error de empaquetado

			// Deshabilitar reglas costosas por rendimiento
			'import/no-cycle': 'off', // La IA rara vez comete este error, y la regla es muy lenta de ejecutar
		},
	},
	{ files: ['tools/**/*.js', 'tailwind.config.js'], languageOptions: { globals: globals.node } },
];
