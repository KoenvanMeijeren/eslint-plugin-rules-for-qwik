# eslint-plugin-rules-for-qwik

ESLint plugin with rules for programming in Qwik.

## Installation

Install the plugin with npm:

```bash
npm install --save-dev koenvanmeijeren-eslint-plugin-rules-for-qwik
```

## Usage
In your `.eslintrc` file, add the rules to your plugins:

```json
{
  "plugins": [
    "koenvanmeijeren-rules-for-qwik"
  ],
  "rules": {
    "koenvanmeijeren-rules-for-qwik/no-direct-scss-imports": "error",
    "koenvanmeijeren-rules-for-qwik/require-generic-props": "error",
    "koenvanmeijeren-rules-for-qwik/require-document-head": ["error", {
      "excludedFiles": ["**/exclude-this-file.ts", "**/exclude-this-directory/**"]
    }],
    "koenvanmeijeren-rules-for-qwik/require-entity-query-conditions": "error"
  }
}
```

## Available Rules

### no-direct-scss-imports
Prevents direct imports of SCSS files in components. Encourages the use of CSS classes instead and importing SCSS files in a global stylesheet.

### require-generic-props
Ensures that component$ calls with parameters have generic type definitions for their props.

### require-document-head
Enforces that route files export a DocumentHead constant. You can exclude specific files or directories using the excludedFiles option.

### require-entity-query-conditions
Enforces that entity queries always include a group with an "AND" conjunction containing both "status" and "dental_laboratory" conditions. This ensures that all entity queries have proper filtering in place.

## Release new version

To release a new version, run the following commands:

```bash
npm login
npm run release
```

## License

This project is licensed under the MIT License.
