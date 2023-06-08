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
import {mergeRulesets} from '../utils/ruleset.ts';
import {FakerType} from '../faker/faker.type.enum.ts';
import {ActionType} from './action.type.enum.ts';
import {AnonymizerRules} from '../interfaces/anonymizer.rules.ts';
import {assertEquals} from '../deps.ts';

Deno.test('merges configurations correctly', () => {
	const ruleset = mergeRulesets(
		{
			tables: {
				'table1': {
					'col1': {
						type: FakerType.COMPANY,
						action: ActionType.UPDATE
					}
				},
				'table2': {
					'col1': {
						type: FakerType.CITY,
						action: ActionType.UPDATE
					}
				},
			},
			custom_queries: {
				before: ['1'],
				after: ['2']
			}
		},
		{
			tables: {
				'table1': {
					'col2': {
						type: FakerType.FIRST_NAME,
						action: ActionType.UPDATE
					}
				},
				'table2': {
					'col1': {
						type: FakerType.EMAIL,
						action: ActionType.UPDATE
					},
				},
				'table3': {
					'col1': {
						type: FakerType.PHONE,
						action: ActionType.UPDATE
					}
				},
			},
			custom_queries: {
				before: ['2'],
				after: ['3']
			}
		},
	);

	assertEquals(ruleset.tables.table1.col1.type, FakerType.COMPANY);
	assertEquals(ruleset.tables.table1.col2.type, FakerType.FIRST_NAME);
	assertEquals(ruleset.tables.table2.col1.type, FakerType.EMAIL);
	assertEquals(ruleset.tables.table3.col1.type, FakerType.PHONE);

	assertEquals(ruleset.custom_queries.before[0], '1');
	assertEquals(ruleset.custom_queries.before[1], '2');

	assertEquals(ruleset.custom_queries.after[0], '2');
	assertEquals(ruleset.custom_queries.after[1], '3');
});

Deno.test('merges partial configurations correctly', () => {
	const ruleset = mergeRulesets(
		{
			tables: {
				'table1': {
					'col1': {
						type: FakerType.COMPANY,
						action: ActionType.UPDATE
					}
				},
				'table2': {
					'col1': {
						type: FakerType.CITY,
						action: ActionType.UPDATE
					}
				},
			}
		},
		{
			custom_queries: {
				before: ['1'],
			}
		} as AnonymizerRules,
	);

	assertEquals(ruleset.tables.table1.col1.type, FakerType.COMPANY);
	assertEquals(ruleset.tables.table2.col1.type, FakerType.CITY);

	assertEquals(ruleset.custom_queries.before[0], '1');
	assertEquals(ruleset.custom_queries.after.length, 0);
});
