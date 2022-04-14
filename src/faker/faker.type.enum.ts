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
export enum FakerType {
	FIRST_NAME = 'firstname',
	LAST_NAME = 'lastname',
	FULL_NAME = 'fullname',
	STREET_NAME = 'streetname',
	STREET = 'street',
	CITY = 'city',
	POSTCODE = 'postcode',
	ZIPCODE = 'zipcode',
	TELEPHONE = 'telephone',
	PHONE = 'phone',
	EMAIL = 'email',
	EMAIL_ADDRESS = 'emailaddress',
	LOGIN = 'login',
	UNIQUE_LOGIN = 'uniq_login',
	UNIQUE_EMAIL = 'uniq_email',
	IP_ADDRESS = 'ip',
	COMPANY = 'company',
	VAT_ID = 'vat_id'
}
