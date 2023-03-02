import * as ResEdit from 'resedit';
import { readFileSync, writeFileSync } from 'fs';
import { VersionStringValues } from 'resedit/dist/resource';

// Language code for en-us and encoding codepage for UTF-16
const language = {
	lang: 1033, // en-us
	codepage: 1200 // UTF-16
};

export interface Properties {
    FileDescription: string;
    ProductName: string;
    CompanyName: string;
    LegalCopyright: string;
}

export interface Options {
	// input exe file to modify
	file: string;

	// output file
	out: string;

	// product version
	version?: `${number}.${number}.${number}`;

	properties?: Properties;

	/**
     * Absolute path to the [ICO-formatted icon](https://en.wikipedia.org/wiki/ICO_(file_format))
     * to set as the application's icon.
     */
	icon?: string;
}

/**
 * Modify an exe file's metadata
 * @param {Options} options
 * @returns {void}
 */
export function mod(options: Options): void {
	// Modify .exe w/ ResEdit
	const data = readFileSync(options.file);
	const executable = ResEdit.NtExecutable.from(data);
	const res = ResEdit.NtExecutableResource.from(executable);
	const vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];

	// Remove original filename
	vi.removeStringValue(language, 'OriginalFilename');
	vi.removeStringValue(language, 'InternalName');

	// Product version
	if (options.version) {
		// Convert version to tuple of 3 numbers
		const version = options.version
			.split('.')
			.map(v => Number(v) || 0)
			.slice(0, 3) as [number, number, number];

		// Update versions
		vi.setProductVersion(...version, 0, language.lang);
		vi.setFileVersion(...version, 0, language.lang);
	}

	// Add additional user specified properties
	if (options.properties) {
		vi.setStringValues(language, options.properties as unknown as VersionStringValues);
	}

	vi.outputToResourceEntries(res.entries);

	// Add icon
	if (options.icon) {
		const iconFile = ResEdit.Data.IconFile.from(readFileSync(options.icon));
		ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
			res.entries,
			1,
			language.lang,
			iconFile.icons.map(item => item.data)
		);
	}

	// Regenerate and write to .exe
	res.outputResource(executable);
	writeFileSync(options.out, Buffer.from(executable.generate()));
}
