export * from './container';
export * from './type-transformer';

export declare function getType<T>(): IType;

export interface IType {
    id: string;
}