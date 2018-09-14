
import glob from 'glob';
import { compile } from './compile';

const testFilesGlobPattern = '**/*.test.ts';
const testFilePaths = glob.sync(testFilesGlobPattern);
compile(testFilePaths);
