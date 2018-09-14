export interface IDependency1 {
    prop1: number;
}

export interface IDependency2 {
    prop2: number;
}

export interface IComplexCtorClass {
    readonly dependency1: IDependency1;
    readonly dependency2: IDependency2;
}

export class ComplexCtorClass implements IComplexCtorClass {
    constructor(
        readonly dependency1: IDependency1,
        readonly dependency2: IDependency2) {
    }
}
