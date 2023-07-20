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
import {parseRowConfig, RowConfig, truncate, updateToFakerValue, updateToStaticValue} from './anonymizer.ts';

/**
 * Execute the custom_queries in the 'after' object
 *
 * @param queries
 */
const executeCustomQueries = async (queries: string[], errors: Error[]): Promise<void> => {
	if (!queries || queries.length < 1) {
		return;
	}

	for (const query of queries) {
		try {
			await executeCustomQuery(query);
		} catch (_e) {
			errors.push(new Error(`Failed to execute custom query: ${query}`));
		}
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
	}).catch(() => {
		throw new Error();
	});
};

async function getDatabaseTables(): Promise<string[]> {
	const tables = await client.execute('SHOW TABLES;');

	if (tables === undefined || tables.rows === undefined || tables.rows.length === 0) {
		return [];
	}

	return tables.rows.map((row) => {
		return row[`Tables_in_${client.config.db}`]
	});
}

async function updateTable(rowConfig: RowConfig, table: string) {
	if (rowConfig.truncate) {
		await truncate(table);
		return;
	}

	if (rowConfig.empty.length > 0 || rowConfig.staticValue.length > 0) {
		await updateToStaticValue(table, rowConfig);
	}

	if (rowConfig.fakerValue.length > 0) {
		await updateToFakerValue(table, rowConfig);
	}

	console.timeEnd(`  Table ${table} done in`);
	console.log('');
	console.log('--------------------------------------------------------------------------------------------');
	console.log('');
}

async function getDatabaseTableColumns(table: string) {
	return await client.execute(`SELECT COLUMN_NAME
                                 FROM INFORMATION_SCHEMA.COLUMNS
                                 WHERE TABLE_SCHEMA = ?
                                   AND TABLE_NAME = ?;`, [
		client.config.db,
		table
	]);
}

/**
 * Only process columns that exists in the database and is specified in the config file.
 * Also skip the 'id' column because it's the primary key and thereby not allowed to be anonymized.
 */
async function getColumnsToBeProcessed(table: string, configColumns: Record<string, Column>): Promise<string[]> {
	const columns = await getDatabaseTableColumns(table);

	if (columns === undefined || columns.rows === undefined || columns.rows.length === 0) {
		return [];
	}

	return columns.rows.map(row => row['COLUMN_NAME'])
		.filter(column => column !== 'id')
		.filter(column => Object.keys(configColumns).includes(column));
}

/**
 * Check if the tables specified in the config file exists in the database, if not, log an error.
 * @param configTables tables as defined in the config file (i.e. the json file in anonymizer folder)
 * @param toBeProcessedTables tables found in the database
 * @param errors
 */
function validateConfigTables(configTables: Record<string, Table>, toBeProcessedTables: string[], errors: Error[]) {
	if (toBeProcessedTables.length === 0) {
		errors.push(new Error(`No tables found in database '${client.config.db}'`));
	}
	Object.keys(configTables)
		.filter(table => !toBeProcessedTables.includes(table))
		.forEach(table => errors.push(new Error(`Given table '${table}' does not exist in the database`)));
}

/**
 * Check if the columns specified in the config file exists in the database, if not, log an error.
 * @param configColumns the columns as defined in the config file (i.e. the json file in anonymizer folder)
 * @param toBeProcessedColumns columns found in the database and specified in the config file
 * @param errors
 * @param table the name of the table
 */
function validateConfigColumns(configColumns: Record<string, Column>, toBeProcessedColumns: string[], errors: Error[], table: string) {
	if (toBeProcessedColumns.length === 0) {
		errors.push(new Error(`No columns found in database table '${table}'`));
	}

	Object.keys(configColumns)
		.filter(column => !toBeProcessedColumns.includes(column))
		.forEach(column => errors.push(new Error(`Given column '${column}' does not exist in database table '${table}'`)));
}

/**
 * Run the queries specified in the JSON config file.
 */
const runQueriesFromConfig = async (errors: Error[]) => {
	console.time('Anonymizer done in: ');

	const configTables: Record<string, Table> = config.tables;
	const databaseTables: string[] = await getDatabaseTables();
	const toBeProcessedTables: string[] = Object.keys(configTables).filter(table => databaseTables.includes(table));

	validateConfigTables(configTables, databaseTables, errors);

	for (const table of toBeProcessedTables) {
		console.log(`>> Starting for table ${table}`);
		console.time(`  Table ${table} done in`);

		const configColumns: Record<string, Column> = configTables[table];
		const toBeProcessedColumns: string[] = await getColumnsToBeProcessed(table, configColumns);

		validateConfigColumns(configColumns, toBeProcessedColumns, errors, table);

		await updateTable(parseRowConfig(toBeProcessedColumns, configColumns), table);
	}

	await client.execute('DROP TABLE IF EXISTS `ANONYMIZER_JOIN_TABLE`;');
	console.timeEnd('Anonymizer done in: ');
};

export {executeCustomQueries, runQueriesFromConfig};
