import { resolve, join } from 'path';

// ESM Compat: const srcPath = resolve(join(dirname(fileURLToPath(import.meta.url)), '..', '..'));
// ^ Doesn't work with CJS

export const srcPath = resolve(join(__dirname, '..', '..'));

/*
  Absolute path for the src file of the package
*/
export const mainPath = resolve(join(srcPath, '..'));
