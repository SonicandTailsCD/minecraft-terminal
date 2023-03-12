import { type Lang } from './Lang.js';

import { EN } from './EN.js';

export let currentLang: Lang = new EN();

// Load a language from a config file
export function setLang (_lang: typeof Lang, overrides?: Partial<Lang['data']>): void {
	currentLang = new _lang(undefined, overrides);
}

export const languages: Record<string, typeof Lang> = {
	EN
};
