import _ from 'lodash';
import { IClassType, IType } from './type';

export class Container {
    private readonly registrations: IRegistration<unknown>[] = [];

    use<TConcretion>(concretionType: IClassType<TConcretion>) {
        return this.useFactory<TConcretion>(() => this.createConcretion(concretionType) as TConcretion);
    }

    useInstance<TConcretion>(instance: TConcretion):
        IWithConcretionRegistrationBuilder<TConcretion> {
        return this.useFactory(() => instance);
    }

    useFactory<TConcretion>(factoryFn: () => TConcretion): IWithConcretionRegistrationBuilder<TConcretion> {
        const registration: IRegistration<TConcretion> = {
            createConcretion: factoryFn,
            lifecycle: Lifecycle.Transient
        };

        this.registrations.push(registration);
        return new WithConcretionRegistrationBuilder<TConcretion>(registration);
    }

    get<TConcretion = unknown>(abstractionType: IType): TConcretion {
        return this.getByTypeId(abstractionType.id);
    }

    getByTypeId<TConcretion = unknown>(abstractionTypeId: string): TConcretion {
        const registration = _.find(
            this.registrations,
            potentialRegistration => potentialRegistration.abstractionType
                && potentialRegistration.abstractionType.id === abstractionTypeId) as
            IRegistration<unknown> | undefined;

        if (!registration) {
            throw new Error(`Type ${abstractionTypeId} has not been registered and ` +
                'therefore an instance of it cannot be retrieved.');
        }

        return registration.createConcretion() as TConcretion;
    }

    // TODO: Handle cycles
    private createConcretion(
        concretionType: IClassType<unknown>): unknown {
        const ctorParamValues: unknown[] = [];

        for (const ctorParam of concretionType.constructor.params) {
            const ctorParamValue = this.getByTypeId(ctorParam.typeId);
            ctorParamValues.push(ctorParamValue);
        }

        return new concretionType.constructor.function(...ctorParamValues);
    }
}

export interface IWithConcretionRegistrationBuilder<TConcretion> {
    for(abstractionType: IType): IWithConcretionRegistrationBuilder<TConcretion>;
    inTransientLifecycle(): IWithConcretionRegistrationBuilder<TConcretion>;
    inSingletonLifecycle(): IWithConcretionRegistrationBuilder<TConcretion>;
    inScopedLifecycle(): IWithConcretionRegistrationBuilder<TConcretion>;
}

// TODO: Implement lifecycles
class WithConcretionRegistrationBuilder<TConcretion> implements IWithConcretionRegistrationBuilder<TConcretion> {
    constructor(private readonly registration: IRegistration<TConcretion>) {
    }

    for(abstractionType: IType) {
        this.registration.abstractionType = abstractionType;
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

interface IRegistration<TConcretion> {
    abstractionType?: IType;
    createConcretion: () => TConcretion;
    lifecycle: Lifecycle;
}

enum Lifecycle {
    Transient,
    Singleton,
    Scoped
}
