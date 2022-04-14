/**
 * Copyright (C) 2022, Patrick van Zadel <patrickvanzadel@eleven.nl>
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
import {Rhum} from '../deps.ts';
import {getConfigEnvironmentVariable, getDatabaseEnvironmentVariables} from './helper.ts';

Rhum.testPlan('Test helper.ts methods', () => {
	Rhum.beforeAll(() => {
		Deno.env.delete('ANONYMIZER_LOCAL_DATABASE');
		Deno.env.delete('ANONYMIZER_LOCAL_USERNAME');
		Deno.env.delete('ANONYMIZER_LOCAL_PASSWORD');
		Deno.env.delete('ANONYMIZER_CONFIG');
	});

	Rhum.testSuite('Test getDatabaseEnvironmentVariables()', () => {
		Rhum.testCase('to check if all Database environment variables exist', () => {
			Deno.env.set('ANONYMIZER_LOCAL_DATABASE', 'example');
			Deno.env.set('ANONYMIZER_LOCAL_USERNAME', 'example');
			Deno.env.set('ANONYMIZER_LOCAL_PASSWORD', 'example');

			const variables = getDatabaseEnvironmentVariables();
			Rhum.asserts.assertExists(variables);
		});

		Rhum.testCase('to check if all Database environment variables exist', () => {
			Deno.env.set('ANONYMIZER_CONFIG', '/Users/test/location/config.json');

			const variables = getConfigEnvironmentVariable();
			Rhum.asserts.assertExists(variables);
		});
	});
});

Rhum.run();


