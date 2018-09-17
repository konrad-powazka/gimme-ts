import { abstraction, concretion } from '../../../../src/functions-to-transform';

// tslint:disable-next-line:no-empty
function notClassFn() {
}

const notClass = notClassFn as any as (new (...params: any[]) => void);

concretion(notClass);

function fn<T>() {
    abstraction<T>();
}

concretion(notClassFn as any);
