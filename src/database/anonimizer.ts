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
import {getFakeData} from '../faker/faker.ts';
import {FakerType} from '../faker/faker.type.enum.ts';
import {countdown, getTimeoutEnvironmentVariable, progress, unreachable} from '../utils/helper.ts';
import {client} from './connection.ts';

import {Progress} from '../deps.ts';
import {Column} from '../interfaces/anonymizer.rules.ts';
import {ActionType} from './action.type.enum.ts';

type ColumnName = string

interface StaticValueConfig {
	columnName: ColumnName,
	value: string
}

interface FakerValueConfig {
	columnName: ColumnName,
	value: FakerType
}

export interface RowConfig {
	truncate: boolean,
	empty: ColumnName[],
	staticValue: StaticValueConfig[],
	fakerValue: FakerValueConfig[]
}

const timeout: number = getTimeoutEnvironmentVariable();

export const parseRowConfig = (columnNames: string[], columns: Record<string, Column>) => {
	const rowConfig: RowConfig = {
		truncate: false,
		empty: [],
		staticValue: [],
		fakerValue: []
	};

	for (const column of columnNames) {
		const columnConfig = columns[column];
		switch (columnConfig.action) {
			case ActionType.SET_STATIC:
				rowConfig.staticValue.push({
					columnName: column,
					value: columnConfig.value!
				});
				break;
			case ActionType.EMPTY:
				rowConfig.empty.push(column);
				break;
			case ActionType.UPDATE:
				rowConfig.fakerValue.push({
					columnName: column,
					value: columnConfig.type!
				});
				break;
			case ActionType.TRUNCATE:
				rowConfig.truncate = true;
				break;
			default:
				unreachable(columnConfig.action);
		}
	}

	return rowConfig;
};

/**
 * Get the primary key column, or the column used as the id for the given table.
 * @param table
 */
const getPrimaryColumnForTable = async (table: string): Promise<string> => {
	const {rows: primaryColumns} = await client.execute(`SHOW KEYS FROM ?? WHERE Key_name = 'PRIMARY'`, [table]);
	return (primaryColumns && primaryColumns.length > 0) ? primaryColumns[0].Column_name : 'id';
};

export const truncate = async (tableName: string) => {
	console.log('     [i] executing truncate');

	const updateProgress = countdown(timeout);
	let current = timeout;
	const interval = setInterval(() => {
		current -= 1;
		updateProgress.render(current);
	}, 1000);

	await client.transaction(async (conn) => {
		await conn.execute(`SET FOREIGN_KEY_CHECKS = ?`, [0]);
		await conn.execute(`TRUNCATE ??;`, [tableName]);
		await conn.execute(`SET FOREIGN_KEY_CHECKS = ?;`, [1]);
	});

	clearInterval(interval);
	updateProgress.end();
};

export const updateToStaticValue = async (table: string, rowConfig: RowConfig) => {
	const sets = [] as string[];
	const data = [table];

	rowConfig.empty.forEach(columnName => {
		sets.push(`?? = ''`);
		data.push(columnName);
	});

	rowConfig.staticValue.forEach(({columnName, value}) => {
		sets.push(`?? = ?`);
		data.push(columnName, value);
	});

	if (sets.length > 0) {
		const query = `UPDATE ??
                       SET ${sets.join(', ')}`;
		await client.execute(query, data);
	}
};

export const updateToFakerValue = async (table: string, rowConfig: RowConfig) => {
	console.log(`     [i] creating merge table`);
	const schema = [] as string[];

	rowConfig.fakerValue.forEach(({columnName}) => {
		schema.push(columnName);
	});

	await client.execute('DROP TABLE IF EXISTS `ANONYMIZER_JOIN_TABLE`;');
	await client.execute('CREATE TABLE ANONYMIZER_JOIN_TABLE (`id` BIGINT NOT NULL AUTO_INCREMENT, ' + schema.map(() => `?? varchar(255)`).join(', ') + ', primary key (id))', schema);

	console.log(`     [i] seeding merge table`);
	schema.unshift('id');

	const columnId: string = await getPrimaryColumnForTable(table);
	const {rows: countRows} = await client.execute(`SELECT COUNT(??) as count
                                                    FROM ??`, [columnId, table]);
	const count = countRows?.[0]?.count;
	if (count === undefined) {
		throw new Error('Expected value');
	}
	const pb = progress(10_000);

	const schemaWithoutId = schema.slice(1);
	const queue = new Set<string[]>();
	for (let j = 0; j < 10; j++) {
		for (let i = 0; i < 1000; i++) {
			pb.render((j * 1000) + i);

			const data = [] as string[];
			rowConfig.fakerValue.forEach(({value}) => {
				data.push(getFakeData(value));
			});
			queue.add(data);
		}

		const columnPlaceholders = Array(schemaWithoutId.length).fill('??').join(', ');
		const valuePlaceholders = Array(schemaWithoutId.length).fill('?').join(', ');
		const v = Array(queue.size).fill(`(${valuePlaceholders})`).join(', ');
		await client.execute(`INSERT INTO ANONYMIZER_JOIN_TABLE (${columnPlaceholders})
                              VALUES ${v}`, [...schemaWithoutId, ...[...queue].flat(1)]);
		queue.clear();
	}
	pb.render(10_000);

	console.log(`     [i] replacing faker data`);

	const updatePlaceholders = schema.slice(1).map(() => `?? = ??`).join(', ');
	const updateData = schema.slice(1).flatMap(colName => [`target.${colName}`, `data.${colName}`]);

	const updateQuery = `
        UPDATE \`${table}\` as target
            INNER JOIN \`ANONYMIZER_JOIN_TABLE\` as data
        ON IF (target.${columnId} % 10000 = 0, 10000, target.${columnId} % 10000) = data.id
            SET ${updatePlaceholders}
	`;

	let updateProgress: Progress;
	let interval: number;

	if (count > 10_000) {
		console.log(`     [i] executing update for ${count} rows`);
		let current = timeout;

		updateProgress = countdown(current);
		interval = setInterval(() => {
			current -= 1;
			updateProgress.render(current);
		}, 1000);
	}

	const result = await client.execute(updateQuery, updateData);

	if (count > 10_000) {
		clearInterval(interval!);
		updateProgress!.end();
	}

	if (result.affectedRows != count) {
		console.warn('     [!] Some rows were not updated!');
		console.warn(`         affectedRows: ${result.affectedRows}, rowCount: ${count}`);
	}
};
