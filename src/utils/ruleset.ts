import {AnonymizerRules} from '../interfaces/anonymizer.rules.ts';

export const mergeRulesets = (...rulesets: Partial<AnonymizerRules>[]): AnonymizerRules => {
	const rules: AnonymizerRules = {
		tables: {},
		custom_queries: {
			before: [],
			after: []
		}
	};

	rulesets.forEach(ruleset => {
		if (ruleset.tables) {
			Object.entries(ruleset.tables).forEach(([tableName, tableConfig]) => {
				if (!rules.tables[tableName]) {
					rules.tables[tableName] = {};
				}

				Object.entries(tableConfig).forEach(([columnName, columnConfig]) => {
					rules.tables[tableName][columnName] = columnConfig;
				});
			});
		}

		if (ruleset.custom_queries?.before && Array.isArray(ruleset.custom_queries.before)) {
			rules.custom_queries.before.push(...ruleset.custom_queries.before);
		}

		if (ruleset.custom_queries?.after && Array.isArray(ruleset.custom_queries.after)) {
			rules.custom_queries.after.push(...ruleset.custom_queries.after);
		}
	});

	return rules;
};