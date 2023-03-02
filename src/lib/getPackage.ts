import axios from 'axios';
import { type PackageJson } from 'types-package-json';

/**
 * Get package information from the npm registry.
 *
 * @param {string} packageName
 * @return Package data.
 */
export async function getPackage (packageName: string): Promise<PackageJson> {
	const res = await axios({
		method: 'get',
		url: 'https://registry.npmjs.org/' + packageName + '/latest',
		responseType: 'text',
		responseEncoding: 'binary',
		headers: {
			'Accept-Encoding': 'raw'
		}
	});

	return JSON.parse(res.data);
}
