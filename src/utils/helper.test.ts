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
import {assertEquals, assertThrows, describe, it, beforeAll, beforeEach, assertObjectMatch} from '../deps.ts';
import {
	getConfigEnvironmentVariable,
	getDatabaseEnvironmentVariables
} from './helper.ts';

describe('Test helper.ts getDatabaseEnvironmentVariables() method', () => {
	beforeAll(() => {
		Deno.env.delete('ANONYMIZER_LOCAL_DATABASE');
		Deno.env.delete('ANONYMIZER_LOCAL_USERNAME');
		Deno.env.delete('ANONYMIZER_LOCAL_PASSWORD');
		Deno.env.delete('ANONYMIZER_LOCAL_HOSTNAME');
		Deno.env.delete('ANONYMIZER_LOCAL_PORT');
		Deno.env.delete('ANONYMIZER_LOCAL_CONNECTION_TIMEOUT');
		Deno.env.delete('ANONYMIZER_CONFIG');
	});

	beforeEach(() => {
		Deno.env.set('ANONYMIZER_LOCAL_DATABASE', 'example_db');
		Deno.env.set('ANONYMIZER_LOCAL_USERNAME', 'example_username');
		Deno.env.set('ANONYMIZER_LOCAL_PASSWORD', 'example_pw');
	});

	it('to throw error when ANONYMIZER_LOCAL_DATABASE is missing', () => {
		Deno.env.delete('ANONYMIZER_LOCAL_DATABASE');
		assertThrows(() => getDatabaseEnvironmentVariables());
	});

	it('to throw error when ANONYMIZER_LOCAL_USERNAME is missing', () => {
		Deno.env.delete('ANONYMIZER_LOCAL_USERNAME');
		assertThrows(() => getDatabaseEnvironmentVariables());
	});

	it('to throw error when ANONYMIZER_LOCAL_PASSWORD is missing', () => {
		Deno.env.delete('ANONYMIZER_LOCAL_PASSWORD');
		assertThrows(() => getDatabaseEnvironmentVariables());
	});

	it('to use the correct settings from the enviroment variables', () => {
		const variables = getDatabaseEnvironmentVariables();
		assertObjectMatch(variables, {
			db: 'example_db',
			username: 'example_username',
			password: 'example_pw'
		});
	});

	it('to set the default hostname value if no environment variable is given', () => {
		const variables = getDatabaseEnvironmentVariables();
		assertEquals('127.0.0.1', variables.hostname);
	});

	it('to set the port given by ANONYMIZER_LOCAL_HOSTNAME', () => {
		Deno.env.set('ANONYMIZER_LOCAL_HOSTNAME', 'localhost');
		const variables = getDatabaseEnvironmentVariables();
		assertEquals('localhost', variables.hostname);
	});

	it('to set the default port value if no environment variable is given', () => {
		const variables = getDatabaseEnvironmentVariables();
		assertEquals(3306, variables.port);
	});

	it('to set the port given by ANONYMIZER_LOCAL_PORT', () => {
		Deno.env.set('ANONYMIZER_LOCAL_PORT', '6603');
		const variables = getDatabaseEnvironmentVariables();
		assertEquals(6603, variables.port);
	});

	it('to set the default timeout value if no environment variable is given', () => {
		Deno.env.delete('ANONYMIZER_LOCAL_CONNECTION_TIMEOUT');
		const variables = getDatabaseEnvironmentVariables();
		assertEquals(60000, variables.timeout);
	});

	it('to set the port given by ANONYMIZER_LOCAL_CONNECTION_TIMEOUT', () => {
		Deno.env.set('ANONYMIZER_LOCAL_CONNECTION_TIMEOUT', '1');
		const variables = getDatabaseEnvironmentVariables();
		assertEquals(1000, variables.timeout);
	});
});

describe('Test helper.ts getConfigEnvironmentVariable() method', () => {
	it('to check it throws an error when ANONYMIZER_CONFIG is missing', () => {
		Deno.env.delete('ANONYMIZER_CONFIG');
		assertThrows(() => getConfigEnvironmentVariable());
	});
	it('to check if all Database environment variables exist', () => {
		Deno.env.set('ANONYMIZER_CONFIG', '/Users/test/location/config.json');
		const variables = getConfigEnvironmentVariable();
		assertEquals('/Users/test/location/config.json', variables)
	});
});
