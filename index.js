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
         * The 'require-entity-query-conditions' rule checks that entityQuery objects always have
         * a group with AND conjunction containing both status and dental_laboratory conditions,
         * or these conditions are directly in the filter's conditions array.
         * @property {Object} 'require-entity-query-conditions' - The rule object.
         * @property {Function} 'require-entity-query-conditions'.create - The function to create the rule.
         * @param {Object} context - The context object provided by ESLint.
         * @returns {Object} An object containing the AST node types to listen for and the functions to run on those nodes.
         */
        'require-entity-query-conditions': {
            create(context) {
                /**
                 * Checks if a node is an entityQuery object
                 * @param {Object} node - The node to check
                 * @returns {boolean} - Whether the node is an entityQuery object
                 */
                function isEntityQuery(node) {
                    return (
                        node.type === 'Property' &&
                        node.key.type === 'Identifier' &&
                        node.key.name === 'entityQuery'
                    );
                }

                /**
                 * Checks if the given conditions array contains both status and dental_laboratory conditions
                 * @param {Array} conditions - The array of condition objects to check
                 * @returns {boolean} - Whether the required conditions are present
                 */
                function conditionsArrayHasRequired(conditions) {
                    if (!conditions || !Array.isArray(conditions)) return false;

                    // Check if there are conditions for both status and dental_laboratory
                    const hasStatusCondition = conditions.some(condition => {
                        if (!condition || condition.type !== 'ObjectExpression') return false;
                        const fieldProperty = condition.properties.find(
                            prop => prop.key.type === 'Identifier' && prop.key.name === 'field'
                        );
                        return fieldProperty &&
                               fieldProperty.value &&
                               fieldProperty.value.type === 'Literal' &&
                               fieldProperty.value.value === 'status';
                    });

                    const hasDentalLabCondition = conditions.some(condition => {
                        if (!condition || condition.type !== 'ObjectExpression') return false;
                        const fieldProperty = condition.properties.find(
                            prop => prop.key.type === 'Identifier' && prop.key.name === 'field'
                        );
                        return fieldProperty &&
                               fieldProperty.value &&
                               fieldProperty.value.type === 'Literal' &&
                               fieldProperty.value.value === 'dental_laboratory';
                    });

                    return hasStatusCondition && hasDentalLabCondition;
                }

                /**
                 * Checks if a node has the required conditions either:
                 * 1. In a group with AND conjunction, or
                 * 2. Directly in the filter's conditions array
                 * @param {Object} node - The node to check
                 * @returns {boolean} - Whether the required conditions are present
                 */
                function hasRequiredConditions(node) {
                    // If this is not an object expression, we can't check it
                    if (!node || node.type !== 'ObjectExpression') return false;

                    // Find the __args property which contains the filter
                    const argsProperty = node.properties.find(
                        prop => prop.key.type === 'Identifier' && prop.key.name === '__args'
                    );

                    if (!argsProperty || !argsProperty.value || argsProperty.value.type !== 'ObjectExpression') return false;

                    // Find the filter property inside __args
                    const filterProperty = argsProperty.value.properties.find(
                        prop => prop.key.type === 'Identifier' && prop.key.name === 'filter'
                    );

                    if (!filterProperty || !filterProperty.value || filterProperty.value.type !== 'ObjectExpression') return false;

                    // Check for direct conditions at the top level of the filter
                    const conditionsProperty = filterProperty.value.properties.find(
                        prop => prop.key.type === 'Identifier' && prop.key.name === 'conditions'
                    );

                    if (conditionsProperty &&
                        conditionsProperty.value &&
                        conditionsProperty.value.type === 'ArrayExpression' &&
                        conditionsArrayHasRequired(conditionsProperty.value.elements)) {
                        return true;
                    }

                    // If not found in top-level conditions, check for them in groups
                    const groupsProperty = filterProperty.value.properties.find(
                        prop => prop.key.type === 'Identifier' && prop.key.name === 'groups'
                    );

                    if (!groupsProperty || !groupsProperty.value || groupsProperty.value.type !== 'ArrayExpression') return false;

                    // Check each group to see if one of them matches our requirements
                    return groupsProperty.value.elements.some(group => {
                        if (!group || group.type !== 'ObjectExpression') return false;

                        // Check if this group has AND conjunction
                        const conjunctionProperty = group.properties.find(
                            prop => prop.key.type === 'Identifier' && prop.key.name === 'conjunction'
                        );

                        if (conjunctionProperty &&
                            conjunctionProperty.value &&
                            conjunctionProperty.value.type === 'Literal' &&
                            conjunctionProperty.value.value === 'AND') {

                            // Find the conditions array in this AND group
                            const groupConditionsProperty = group.properties.find(
                                prop => prop.key.type === 'Identifier' && prop.key.name === 'conditions'
                            );

                            if (groupConditionsProperty &&
                                groupConditionsProperty.value &&
                                groupConditionsProperty.value.type === 'ArrayExpression') {

                                return conditionsArrayHasRequired(groupConditionsProperty.value.elements);
                            }
                        }

                        return false;
                    });
                }

                return {
                    /**
                     * Check object expressions that might be entity queries
                     * @param {Object} node - The AST node to check
                     */
                    Property(node) {
                        if (isEntityQuery(node) && node.value && node.value.type === 'ObjectExpression') {
                            if (!hasRequiredConditions(node.value)) {
                                context.report({
                                    node,
                                    message: 'Entity queries must have the required "status" and "dental_laboratory" conditions either at the top level or in a group with AND conjunction.'
                                });
                            }
                        }
                    },

                    /**
                     * Check direct entityQuery object assignments
                     * @param {Object} node - The AST node to check
                     */
                    VariableDeclarator(node) {
                        if (node.id &&
                            node.id.type === 'ObjectPattern' &&
                            node.id.properties &&
                            node.id.properties.some(prop => prop.key && prop.key.name === 'entityQuery')) {

                            // This is destructuring an object with entityQuery, check if parent assignment has required conditions
                            if (node.init &&
                                node.init.type === 'AwaitExpression' &&
                                node.init.argument &&
                                node.init.argument.type === 'CallExpression' &&
                                node.init.argument.arguments &&
                                node.init.argument.arguments.length > 0) {

                                const queryArg = node.init.argument.arguments[0];
                                if (queryArg && queryArg.type === 'ObjectExpression') {
                                    const entityQueryProp = queryArg.properties.find(prop =>
                                        prop.key && prop.key.name === 'entityQuery'
                                    );

                                    if (entityQueryProp && !hasRequiredConditions(entityQueryProp.value)) {
                                        context.report({
                                            node,
                                            message: 'Entity queries must have the required "status" and "dental_laboratory" conditions either at the top level or in a group with AND conjunction.'
                                        });
                                    }
                                }
                            }
                        }
                    }
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
                            // Check if the function parameter list is not empty
                            const arrowFunction = node.arguments[0];
                            if (arrowFunction && arrowFunction.type === 'ArrowFunctionExpression' && arrowFunction.params.length > 0) {
                                // Check if the call has type parameters
                                if (!node.typeParameters) {
                                    context.report({
                                        node,
                                        message: 'The component$ call must have generic type parameters defining the props.',
                                    });
                                }
                            }
                        }
                    },
                };
            },
        },
    },
};
