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
import {AnonymizerRules} from '../interfaces/anonymizer.rules.ts';
import {getConfigEnvironmentVariable} from '../utils/helper.ts';
import {mergeRulesets} from '../utils/ruleset.ts';

/**
 * Get the Anonymizer config file given as a json file
 *
 * @see example/example.json
 */
const getConfig = async (): Promise<AnonymizerRules> => {
	const config = getConfigEnvironmentVariable();

	let configFilePaths: string[] = []

	if (config.includes(',')) {
		//join configs
		configFilePaths = config.split(',').map(item => item.trim())
	} else {
		configFilePaths = [config];
	}

	const rulesets = await Promise.all(configFilePaths.map(async (filePath) => {
		const decoder = new TextDecoder('utf-8');
		const data = await Deno.readFile(filePath);
		return JSON.parse(decoder.decode(data)) as AnonymizerRules;
	}))

	return mergeRulesets(...rulesets)
};

const config: AnonymizerRules = await getConfig();

export {getConfig, config};
