# eslint-plugin-rules-for-qwik

ESLint plugin with rules for programming in Qwik.

## Installation

Install the plugin with npm:

```bash
npm install koenvanmeijeren-eslint-plugin-rules-for-qwik
```

## Usage
In your `.eslintrc` file, add the rules to your plugins:

```json
{
  "plugins": [
    "koenvanmeijeren-rules-for-qwik"
  ],
  "rules": {
    "koenvanmeijeren-rules-for-qwik/no-direct-scss-imports": "error"
  }
}
```

## Release new version

To release a new version, run the following commands:

```bash
npm login
npm run release
```

## Rules

### no-direct-scss-imports

This rule checks for direct imports of SCSS files and suggests using importing the SCSS in global files instead.

## License

This project is licensed under the MIT License.
