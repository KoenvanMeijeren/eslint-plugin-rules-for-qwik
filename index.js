/**
 * This module exports a set of ESLint rules.
 * @module koenvanmeijeren-rules-for-qwik
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
        /**
         * The 'require-document-head' rule checks for the presence of a DocumentHead export in route files.
         * @property {Object} 'require-document-head' - The rule object for 'require-document-head'.
         * @property {Function} 'require-document-head'.create - The function to create the rule.
         * @param {Object} context - The context object provided by ESLint.
         * @returns {Object} An object containing the AST node types to listen for and the functions to run on those nodes.
         */
        'require-document-head': {
            create(context) {
                const filePath = context.getFilename();

                // Get excluded files from the rule options
                const options = context.options[0] || {};
                const excludedFiles = options.excludedFiles || [];

                // Check if the file is in the excluded files list
                if (excludedFiles.some((pattern) => new RegExp(pattern).test(filePath))) {
                    return {};
                }

                return {
                    /**
                     * The Program function checks if there is an export named 'DocumentHead'.
                     * @param {Object} node - The AST node to check.
                     */
                    Program(node) {
                        const sourceCode = context.getSourceCode();
                        const hasDocumentHeadExport = sourceCode.ast.body.some((node) =>
                            node.type === 'ExportNamedDeclaration' &&
                            node.declaration &&
                            node.declaration.declarations &&
                            node.declaration.declarations.some((declaration) =>
                                declaration.id.name === 'head' &&
                                declaration.init &&
                                declaration.init.type === 'ArrowFunctionExpression'
                            )
                        );

                        if (!hasDocumentHeadExport) {
                            context.report({
                                node,
                                message: 'Every route file must export a DocumentHead constant.',
                            });
                        }
                    },
                };
            },
        },
        /**
         * The 'require-generic-props' rule checks for the presence of generic type parameters in component$ calls.
         * @property {Object} 'require-generic-props' - The rule object for 'require-generic-props'.
         * @property {Function} 'require-generic-props'.create - The function to create the rule.
         * @param {Object} context - The context object provided by ESLint.
         * @returns {Object} An object containing the AST node types to listen for and the functions to run on those nodes.
         */
        'require-generic-props': {
            create(context) {
                return {
                    /**
                     * The CallExpression function checks if the call is to component$ and if it has the generic type parameter defined.
                     * @param {Object} node - The AST node to check.
                     */
                    CallExpression(node) {
                        // Check if the callee is component$
                        if (
                            node.callee.type === 'Identifier' &&
                            node.callee.name === 'component$'
                        ) {
                            // Check if the call has type parameters
                            if (!node.typeParameters) {
                                context.report({
                                    node,
                                    message: 'The component$ call must have generic type parameters defining the props.',
                                });
                            }
                        }
                    },
                };
            },
        },
    },
};
