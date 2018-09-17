import { concretion } from '../../../../src/functions-to-transform';

// tslint:disable-next-line:no-empty
function notClassFn() {
}

concretion(notClassFn as any);
