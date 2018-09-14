export interface IType {
    readonly id: string;
}

export interface IClassType<TClass> extends IType {
    readonly constructor: IConstructor<TClass>;
}

export interface IConstructor<TClass> {
    readonly function: new (...params: unknown[]) => TClass;
    readonly params: ReadonlyArray<IConstructorParam>;
}

export interface IConstructorParam {
    readonly typeId: string;
}
