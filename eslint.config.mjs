import globals from 'globals';
export default [{files:['src/**/*.mjs'],languageOptions:{ecmaVersion:'latest',sourceType:'module',globals:{...globals.browser,...globals.es2025}},rules:{'no-undef':'error'}}];
