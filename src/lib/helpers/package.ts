import { type PackageJson } from 'types-package-json';

// Get package.json object
function getPackage (): PackageJson {
	return require('../../../package.json');
}

export const _package = getPackage();
