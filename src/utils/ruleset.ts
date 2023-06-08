/**
 * Copyright (C) 2022, Rowan Ramtahalsing <rowanramtahalsing@eleven.nl>
 *
 * Anonymizer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Anonymizer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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
