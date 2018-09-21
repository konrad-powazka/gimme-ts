import _ from 'lodash';
import { IClassType, IType } from './type';

export class Container {
    private readonly concretionsInstantiatedInThisScope: IInstantiatedConcretion[] = [];

    constructor(
        private readonly registrations: ReadonlyArray<IRegistration<unknown>>,
        private readonly parentContainer?: Container) {
    }

    resolve<TAbstraction>(abstractionType: IType<TAbstraction>): TAbstraction {
        return this.resolveByTypeId(abstractionType.id);
    }

    resolveByTypeId<TAbstraction>(abstractionTypeId: string): TAbstraction {
        return this.resolveByTypeIdInternal(abstractionTypeId, []);
    }

    private resolveByTypeIdInternal<TAbstraction>(
        abstractionTypeId: string,
        pendingConcretionTypeIdsStack: string[]): TAbstraction {
        const registration = _.find(
            this.registrations,
            potentialRegistration => potentialRegistration.abstractionType
                && potentialRegistration.abstractionType.id === abstractionTypeId) as
            IRegistration<TAbstraction> | undefined;

        if (!registration) {
            throw new Error(`Type ${abstractionTypeId} has not been registered and ` +
                'therefore an instance of it cannot be retrieved.');
        }

        if (registration.lifecycle === Lifecycle.Singleton && this.parentContainer) {
            return this.parentContainer.resolveByTypeIdInternal(abstractionTypeId, pendingConcretionTypeIdsStack);
        }

        const instanceShouldBeSavedInThisScope =
            registration.lifecycle === Lifecycle.Singleton || registration.lifecycle === Lifecycle.Scoped;

        if (instanceShouldBeSavedInThisScope) {
            const existingConcretion =
                _.find(this.concretionsInstantiatedInThisScope, concretion => concretion.abstractionTypeId === abstractionTypeId);

            if (existingConcretion) {
                return existingConcretion.instance as TAbstraction;
            }
        }

        const newInstance =
            typeof registration.concretionTypeOrFactoryFn === 'function'
                ? registration.concretionTypeOrFactoryFn()
                : this.createConcretion(
                    registration.concretionTypeOrFactoryFn,
                    pendingConcretionTypeIdsStack);

        if (instanceShouldBeSavedInThisScope) {
            this.concretionsInstantiatedInThisScope.push({
                abstractionTypeId: abstractionTypeId,
                instance: newInstance
            });
        }

        return newInstance;
    }

    private createConcretion<TConcretion>(
        concretionType: IClassType<TConcretion>,
        pendingConcretionTypeIdsStack: string[]) {
        const cycleWasDetected = _(pendingConcretionTypeIdsStack).includes(concretionType.id);

        if (cycleWasDetected) {
            // TODO: Provide more info
            throw new Error('A dependency cycle has been detected.');
        }

        pendingConcretionTypeIdsStack.push(concretionType.id);
        const ctorParamValues: unknown[] = [];

        for (const ctorParam of concretionType.constructor.params) {
            const ctorParamValue = this.resolveByTypeIdInternal(
                ctorParam.typeId,
                pendingConcretionTypeIdsStack);

            ctorParamValues.push(ctorParamValue);
        }

        const poppedPendingConcretionTypeIdsStack = pendingConcretionTypeIdsStack.splice(-1);

        if (poppedPendingConcretionTypeIdsStack.length !== 1
            || poppedPendingConcretionTypeIdsStack[0] !== concretionType.id) {
            throw new Error('Incorrect implementation.');
        }

        return new concretionType.constructor.function(...ctorParamValues);
    }

    createScope(): Container {
        return new Container(this.registrations, this);
    }
}

interface IRegistration<TAbstraction> {
    readonly abstractionType: IType<TAbstraction>;
    readonly concretionTypeOrFactoryFn: ConcretionTypeOrFactoryFn<TAbstraction>;
    readonly lifecycle: Lifecycle;
}

export type ConcretionTypeOrFactoryFn<TAbstraction> = IClassType<TAbstraction> | (() => TAbstraction);

interface IInstantiatedConcretion {
    readonly instance: unknown;
    readonly abstractionTypeId: string;
}

export enum Lifecycle {
    Transient,
    Scoped,
    Singleton
}
