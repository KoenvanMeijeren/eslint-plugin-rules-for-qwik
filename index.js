/**
 * This module exports a set of ESLint rules.
 * @module eslint-plugin-no-direct-scss-imports
 */
module.exports = {
    /**
     * The rules object contains all the rules for this plugin.
     * Currently, it only contains the 'no-direct-scss-imports' rule.
     */
    rules: {
        /**
         * The 'no-direct-scss-imports' rule checks for direct imports of SCSS files in TypeScript files.
         * @property {Object} 'no-direct-scss-imports' - The rule object for 'no-direct-scss-imports'.
         * @property {Function} 'no-direct-scss-imports'.create - The function to create the rule.
         * @param {Object} context - The context object provided by ESLint.
         * @returns {Object} An object containing the AST node types to listen for and the functions to run on those nodes.
         */
        'no-direct-scss-imports': {
            create(context) {
                return {
                    /**
                     * The ImportDeclaration function checks if the import path ends with '.scss'.
                     * @param {Object} node - The AST node to check.
                     */
                    ImportDeclaration(node) {
                        const importPath = node.source.value;
                        if (importPath.endsWith('.scss') || importPath.endsWith('.css')) {
                            /**
                             * If the import path matches, it reports an error message.
                             */
                            context.report({
                                node,
                                message: 'Avoid direct imports of SCSS files in component libraries in Qwik. Use classes instead and import the SCSS file in the global SCSS file.',
                            });
                        }
                    },
                };
            },
        },
    },
};
