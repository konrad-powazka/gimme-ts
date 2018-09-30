import { IClassType, IType } from '.';
import { nameof } from './nameof';

/** @ignore @internal */
export const abstractionFnName = nameof('abstraction', { abstraction });

/** @ignore @internal */
export const concretionFnName = nameof('concretion', { concretion });

const useTransformerErrorMessage =
    `In order to use "${abstractionFnName}" or "${concretionFnName}" functions a TypeScript transformer from the same package needs to be added to the compilation pipeline.`;

/**
 * A marker function which during compilation is replaced with an object which contains 
 * information about given abstraction type.
 * @param TAbstraction The type to extract information about.
 * @returns Transformation effectively makes it return the extracted type information.
 * If not transformed, then throws an exception.
 */
export function abstraction<TAbstraction>(): IType<TAbstraction> {
    throw new Error(useTransformerErrorMessage);
}

/**
 * A marker function which during compilation is replaced with an object which contains 
 * information about given concretion type.
 * @param TConcretion The type to extract information about. It has to be a class.
 * @param concretionConstructor The constructor function of the concretion class.
 * @returns Transformation effectively makes it return the extracted type information.
 * If not transformed, then throws an exception.
 */
export function concretion<TConcretion>(
    concretionConstructor: new (...params: any[]) => TConcretion): IClassType<TConcretion> {
    throw new Error(useTransformerErrorMessage);
}

/**
 * A module marker export which allows to reliably identify [[abstraction]] and [[concretion]] functions
 * during transformation.
 */
export const moduleId = 'gimme-ts/functions-to-transform';
