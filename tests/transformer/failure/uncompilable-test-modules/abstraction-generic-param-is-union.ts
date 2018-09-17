import { abstraction } from '../../../../src/functions-to-transform';

// tslint:disable-next-line:no-empty-interface
interface I1 {
}

// tslint:disable-next-line:no-empty-interface
interface I2 {
}

type UnionType = I1 | I2;

abstraction<UnionType>();
