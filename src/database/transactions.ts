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
import {Column, Table} from '../interfaces/anonymizer.rules.ts';
import {config} from './config.ts';
import {client} from './connection.ts';
import {parseRowConfig, truncate, updateToFakerValue, updateToStaticValue} from './anonimizer.ts';

/**
 * Execute the custom_queries in the 'after' object
 *
 * @param queries
 */
const executeCustomQueries = async (queries: string[]): Promise<void> => {
	if (!queries || queries.length < 1) {
		return;
	}

	for (const query of queries) {
		await executeCustomQuery(query);
	}
};

/**
 * Execute a query in a transaction.
 *
 * @param query
 */
const executeCustomQuery = async (query: string): Promise<void> => {
	await client.transaction(async (conn) => {
		return await conn.query(query);
	});
};

/**
 * Run the queries specified in the JSON config file.
 */
const runQueriesFromConfig = async () => {
	console.time('Anonimizer done in: ');

	const tables: Record<string, Table> = config.tables;
	const tableNames: string[] = Object.keys(tables);

	for (const table of tableNames) {
		console.log(`+ Starting for table ${table}`);
		console.time(`  Table ${table} done in`);
		const columns: Record<string, Column> = tables[table];
		const columnNames: string[] = Object.keys(columns);

		const rowConfig = parseRowConfig(columnNames, columns);

		if (rowConfig.truncate) {
			await truncate(table);
		} else {
			if (rowConfig.empty.length > 0 || rowConfig.staticValue.length > 0) {
				await updateToStaticValue(table, rowConfig);
			}

			if (rowConfig.fakerValue.length > 0) {
				await updateToFakerValue(table, rowConfig);
			}
		}

		console.timeEnd(`  Table ${table} done in`);
		console.log('');
		console.log('----------------------------------------------------------------');
		console.log('');
	}

	await client.execute('DROP TABLE IF EXISTS `ANONYMIZER_JOIN_TABLE`;');
	console.timeEnd('Anonimizer done in: ');
};

export {executeCustomQueries, runQueriesFromConfig};
