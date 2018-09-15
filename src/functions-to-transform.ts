import { nameof } from './nameof';
import { IType, IClassType } from '.';

export const abstractionFnName = nameof('abstraction', { abstraction });
export const concretionFnName = nameof('concretion', { concretion });

const useTransformerErrorMessage =
    `In order to use "${abstractionFnName}" or "${concretionFnName}" functions a TypeScript transformer from the same package needs to be added to the compilation pipeline.`;

export function abstraction<T>(): IType<T> {
    throw new Error(useTransformerErrorMessage);
}

export function concretion<T>(concretionConstructor: new (...params: any[]) => T): IClassType<T> {
    throw new Error(useTransformerErrorMessage);
}