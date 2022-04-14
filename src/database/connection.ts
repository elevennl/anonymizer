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
import {Client} from '../deps.ts';
import {getDatabaseEnvironmentVariables} from '../utils/helper.ts';

const {database, username, password} = getDatabaseEnvironmentVariables();

/**
 * Connect to the database by reading the command line arguments
 */
const client: Client = await new Client().connect({
	hostname: '127.0.0.1',
	username,
	db: database,
	poolSize: 3,
	password
});

export {client};
