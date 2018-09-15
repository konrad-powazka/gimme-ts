import _ from 'lodash';
import { IClassType, IType } from './type';

type CreateConcretionFn = <TConcretion>(
    concretionType: IClassType<TConcretion>,
    pendingConcretionTypeIdsStack: string[]) => TConcretion;

export class Container {
    private readonly registrations: IRegistration<unknown>[] = [];

    for<TAbstraction>(abstractionType: IType<TAbstraction>) {
        const registration: IRegistration<TAbstraction> = {
            abstractionType: abstractionType,
            lifecycle: Lifecycle.Transient
        };

        this.registrations.push(registration);
        return new RegistrationBuilder<TAbstraction>(registration, this.createConcretion);
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

        if (!registration.createConcretion) {
            throw new Error(`No concretion has been registered fo type ${abstractionTypeId}.`);
        }

        return registration.createConcretion(pendingConcretionTypeIdsStack);
    }

    private createConcretion: CreateConcretionFn = <TConcretion>(
        concretionType: IClassType<TConcretion>,
        pendingConcretionTypeIdsStack: string[]) => {
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
}

export interface IRegistrationBuilder<TAbstraction> {
    use<TConcretion extends TAbstraction>(concretionType: IClassType<TConcretion>): IRegistrationBuilder<TAbstraction>;
    useInstance<TConcretion extends TAbstraction>(instance: TConcretion): IRegistrationBuilder<TAbstraction>;
    useFactory<TConcretion extends TAbstraction>(factoryFn: () => TConcretion): IRegistrationBuilder<TConcretion>;
    inTransientLifecycle(): IRegistrationBuilder<TAbstraction>;
    inSingletonLifecycle(): IRegistrationBuilder<TAbstraction>;
    inScopedLifecycle(): IRegistrationBuilder<TAbstraction>;
}

// TODO: Implement lifecycles
class RegistrationBuilder<TAbstraction> implements IRegistrationBuilder<TAbstraction> {
    constructor(
        private readonly registration: IRegistration<TAbstraction>,
        private readonly createConcretionFn: CreateConcretionFn) {
    }

    use<TConcretion extends TAbstraction>(concretionType: IClassType<TConcretion>) {
        this.registration.createConcretion = 
            pendingConcretionTypeIdsStack => this.createConcretionFn(concretionType, pendingConcretionTypeIdsStack);
        
        return this;
    }

    useInstance<TConcretion extends TAbstraction>(instance: TConcretion):
        IRegistrationBuilder<TConcretion> {
        return this.useFactory(() => instance);
    }

    useFactory<TConcretion extends TAbstraction>(factoryFn: () => TConcretion): IRegistrationBuilder<TConcretion> {
        this.registration.createConcretion = factoryFn;
        return this;
    }

    inTransientLifecycle() {
        throw new Error('Method not implemented.');
        return this;
    }

    inSingletonLifecycle() {
        throw new Error('Method not implemented.');
        return this;
    }

    inScopedLifecycle() {
        throw new Error('Method not implemented.');
        return this;
    }
}

interface IRegistration<TAbstraction> {
    readonly abstractionType: IType<TAbstraction>;
    createConcretion?: (pendingConcretionTypeIdsStack: string[]) => TAbstraction;
    lifecycle: Lifecycle;
}

enum Lifecycle {
    Transient,
    Singleton,
    Scoped
}
