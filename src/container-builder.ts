import _ from 'lodash';
import { IClassType, IType } from './type';
import { Lifecycle, Container, ConcretionTypeOrFactoryFn } from '.';

export class ContainerBuilder {
    private readonly tentativeRegistrations: ITentativeRegistration<unknown>[] = [];

    for<TAbstraction>(abstractionType: IType<TAbstraction>) {
        const registration: ITentativeRegistration<TAbstraction> = {
            abstractionType: abstractionType,
            lifecycle: Lifecycle.Transient
        };

        this.tentativeRegistrations.push(registration);
        return new RegistrationBuilder<TAbstraction>(registration);
    }

    build(): Container {
        // TODO: Validate registrations
        const registrations = this.tentativeRegistrations.map(tentativeRegistration => ({
            abstractionType: tentativeRegistration.abstractionType,
            concretionTypeOrFactoryFn: tentativeRegistration.concretionTypeOrFactoryFn!,
            lifecycle: tentativeRegistration.lifecycle
        }));

        return new Container(registrations);
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

class RegistrationBuilder<TAbstraction> implements IRegistrationBuilder<TAbstraction> {
    constructor(
        private readonly registration: ITentativeRegistration<TAbstraction>) {
    }

    use<TConcretion extends TAbstraction>(concretionType: IClassType<TConcretion>) {
        this.registration.concretionTypeOrFactoryFn = concretionType;
        return this;
    }

    useInstance<TConcretion extends TAbstraction>(instance: TConcretion):
        IRegistrationBuilder<TConcretion> {
        return this.useFactory(() => instance);
    }

    useFactory<TConcretion extends TAbstraction>(factoryFn: () => TConcretion): IRegistrationBuilder<TConcretion> {
        this.registration.concretionTypeOrFactoryFn = factoryFn;
        return this;
    }

    inTransientLifecycle() {
        return this.inLifecycle(Lifecycle.Transient);
    }

    inSingletonLifecycle() {
        return this.inLifecycle(Lifecycle.Singleton);
    }

    inScopedLifecycle() {
        return this.inLifecycle(Lifecycle.Scoped);
    }

    inLifecycle(lifecycle: Lifecycle) {
        this.registration.lifecycle = lifecycle;
        return this;
    }
}

interface ITentativeRegistration<TAbstraction> {
    readonly abstractionType: IType<TAbstraction>;
    lifecycle: Lifecycle;
    concretionTypeOrFactoryFn?: ConcretionTypeOrFactoryFn<TAbstraction>;
}
