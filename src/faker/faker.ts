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
import {faker} from '../deps.ts';
import {getFakerLocaleEnvironmentVariable, unreachable} from '../utils/helper.ts';
import {FakerType} from './faker.type.enum.ts';

faker.locale = await getFakerLocaleEnvironmentVariable();

/**
 * Returns fake data based on the given dataType.
 * @param dataType
 */
export const getFakeData = (dataType: FakerType): string => {
	switch (dataType) {
		case FakerType.CITY:
			return faker.fake('{{address.cityPrefix}} {{address.citySuffix}}');
		case FakerType.COMPANY:
			return faker.company.companyName();
		case FakerType.VAT_ID:
			return faker.fake('{{address.countryCode}}{{random.number}}');
		case FakerType.EMAIL:
			return faker.internet.email();
		case FakerType.EMAIL_ADDRESS:
			return faker.internet.email();
		case FakerType.FIRST_NAME:
			return faker.name.firstName();
		case FakerType.FULL_NAME:
			return faker.fake('{{name.firstName}} {{name.lastName}}');
		case FakerType.IP_ADDRESS:
			return faker.internet.ip();
		case FakerType.LAST_NAME:
			return faker.name.lastName();
		case FakerType.LOGIN:
			return faker.internet.userName();
		case FakerType.PHONE:
			return faker.phone.phoneNumber();
		case FakerType.POSTCODE:
			return faker.address.zipCode();
		case FakerType.STREET:
			return faker.address.streetName();
		case FakerType.STREET_NAME:
			return faker.address.streetName();
		case FakerType.TELEPHONE:
			return faker.phone.phoneNumber();
		case FakerType.UNIQUE_EMAIL:
			return faker.internet.email();
		case FakerType.UNIQUE_LOGIN:
			return faker.internet.userName();
		case FakerType.ZIPCODE:
			return faker.address.zipCode();
		case FakerType.QUOTE:
			return faker.lorem.words(7);
		default:
			unreachable(dataType);
			throw new Error(`Could not handle the method due to invalid FakerType: ${dataType}`);
	}
};
