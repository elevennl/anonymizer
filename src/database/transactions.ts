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
import {getFakeData} from '../faker/faker.ts';
import {FakerType} from '../faker/faker.type.enum.ts';
import {Column, Table} from '../interfaces/anonymizer.rules.ts';
import {ActionType} from './action.type.enum.ts';
import {config} from './config.ts';
import {client} from './connection.ts';

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
 * Execute the queries as configured in the given JSON file.
 *
 * @param table
 * @param column
 * @param fakerType
 * @param actionType
 * @param value
 */
const executeQuery = async (table: string, column: string, fakerType: FakerType | undefined, actionType: string, value: string | undefined): Promise<void> => {
	if (ActionType.TRUNCATE === actionType) {
		return await client.transaction(async (conn) => {
			await conn.execute(`SET FOREIGN_KEY_CHECKS = ?`, [0]);
			await conn.execute(`TRUNCATE ??;`, [table]);
			await conn.execute(`SET FOREIGN_KEY_CHECKS = ?;`, [1]);
		});
	}

	if (ActionType.EMPTY === actionType) {
		return await client.transaction(async (conn) => {
			// @formatter:off
			await conn.execute(`UPDATE ?? SET ?? = ''`, [table, column]);
			// @formatter:on
		});
	}

	if (ActionType.SET_STATIC === actionType && value) {
		return await client.transaction(async (conn) => {
			// @formatter:off
			await conn.query(`UPDATE ?? SET ?? = ?`, [table, column, `${value}`]);
			// @formatter:on
		});
	}

	if (ActionType.UPDATE === actionType && fakerType !== undefined) {
		// @formatter:off
		const {rows: rows} = await client.execute(`SELECT * FROM ??`, [table]);
		// @formatter:on
		const columnId: string = await getPrimaryColumnForTable(table);

		if (rows && rows.length > 0) {
			for (const row of rows) {
				const fakeData = getFakeData(fakerType);

				await client.transaction(async (conn) => {
					// @formatter:off
					return await conn.query(`UPDATE ?? SET ?? = ? WHERE ?? = ?`, [
						`${table}`,
						`${column}`,
						`${fakeData}`,
						`${columnId}`,
						`${row[columnId]}`
					]);
					// @formatter:on
				});
			}
		}
	}
};

/**
 * Get the primary key column, or the column used as the id for the given table.
 * @param table
 */
const getPrimaryColumnForTable = async (table: string): Promise<string> => {
	const {rows: primaryColumns} = await client.execute(`SHOW KEYS FROM ?? WHERE Key_name = 'PRIMARY'`, [table]);
	return (primaryColumns && primaryColumns.length > 0) ? primaryColumns[0].Column_name : 'id';
};

/**
 * Run the queries specified in the JSON config file.
 */
const runQueriesFromConfig = async () => {
	const tables: Record<string, Table> = config.tables;
	const tableNames: string[] = Object.keys(tables);

	for (const table of tableNames) {
		const columns: Record<string, Column> = tables[table];
		const columnNames: string[] = Object.keys(columns);

		for (const column of columnNames) {
			const actionType: ActionType = columns[column]?.action;
			const fakerType: FakerType | undefined = columns[column]?.type;
			const value: string | undefined = columns[column]?.value;

			await executeQuery(table, column, fakerType, actionType, value);
		}
	}
};

export {executeCustomQueries, executeQuery, runQueriesFromConfig};
