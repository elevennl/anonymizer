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
import {ActionType} from '../database/action.type.enum.ts';
import {FakerType} from '../faker/faker.type.enum.ts';

export interface AnonymizerRules {
	tables: Record<string, Table>;
	custom_queries: CustomQueries;
}

export interface Table {
	[key: string]: Column;
}

export interface Column {
	type?: FakerType;
	action: ActionType;
	value?: string;
}

export interface CustomQueries {
	before: string[];
	after: string[];
}
