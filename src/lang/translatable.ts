import { Lang } from './Lang.js';

import { EN } from './EN.js';

export let currentLang = new Lang();

// Load a language from a config file
export function setLang (_lang: typeof Lang, overrides?: Partial<Lang['data']>): void {
	currentLang = new _lang(undefined, overrides);
}

export const languages = {
	EN
};
