import _ from 'lodash';
import { IClassType, IType } from './type';
import { Lifecycle, Container, ConcretionTypeOrFactoryFn, IContainer } from '.';

/**
 * Used to configure and instantiate an [[IContainer]].
 */
export class ContainerBuilder {
    /** @ignore @internal */
    private readonly tentativeRegistrations: ITentativeRegistration<unknown>[] = [];

    /**
     * Registers an abstraction type. It can later be explicitly resolved from a container
     * or it can be automatically injected to concretion classes which depend on it.
     * @param TAbstraction The type of the abstraction to register.
     * @param abstractionType The type information of the abstraction to register.
     * @returns A builder which can be used to further configure the registration.
     */
    for<TAbstraction>(abstractionType: IType<TAbstraction>): IRegistrationBuilder<TAbstraction> {
        const registration: ITentativeRegistration<TAbstraction> = {
            abstractionType: abstractionType,
            lifecycle: Lifecycle.Transient
        };

        this.tentativeRegistrations.push(registration);
        return new RegistrationBuilder<TAbstraction>(registration);
    }

    /**
     * Creates an instance of a container with configuration provided so far.
     * @returns A configured container.
     */
    build(): IContainer {
        // TODO: Validate registrations
        const registrations = this.tentativeRegistrations.map(tentativeRegistration => ({
            abstractionType: tentativeRegistration.abstractionType,
            concretionTypeOrFactoryFn: tentativeRegistration.concretionTypeOrFactoryFn!,
            lifecycle: tentativeRegistration.lifecycle
        }));

        return new Container(registrations);
    }
}

/**
 * Used to configure a registration for `TAbstraction`.
 * @param TAbstraction The type of an abstraction that is being configured.
 */
export interface IRegistrationBuilder<TAbstraction> {
    /**
     * Registers a concretion type to use when resolving `TAbstraction`.
     * @param TConcretion The type of concretion to use when resolving `TAbstraction`.
     * @param concretionType The type information of concretion to use when resolving the abstraction.
     * @returns Self.
     */
    use<TConcretion extends TAbstraction>(concretionType: IClassType<TConcretion>): IRegistrationBuilder<TAbstraction>;

    /**
     * Registers an already existing concretion instance to use when resolving `TAbstraction`.
     * @param TConcretion The type of the concretion instance.
     * @param instance The instance of the concretion to use when resolving `TAbstraction`.
     * @returns Self.
     */
    useInstance<TConcretion extends TAbstraction>(instance: TConcretion): IRegistrationBuilder<TAbstraction>;

    /**
     * Registers a factory function to use when resolving `TAbstraction`.
     * @param TConcretion The type of a concretion that will be returned by `factoryFn`.
     * @param factoryFn The function which will be invoked every time a concretion
     * for given `TAbstraction` is be needed.
     * @returns Self.
     */
    useFactory<TConcretion extends TAbstraction>(factoryFn: () => TConcretion): IRegistrationBuilder<TConcretion>;

    /**
     * Sets the lifecycle of `TAbstraction` to [[Lifecycle.Transient]].
     * @returns Self.
     */
    inTransientLifecycle(): IRegistrationBuilder<TAbstraction>;

    /**
     * Sets the lifecycle of `TAbstraction` to [[Lifecycle.Scoped]].
     * @returns Self.
     */
    inScopedLifecycle(): IRegistrationBuilder<TAbstraction>;

    /**
     * Sets the lifecycle of `TAbstraction` to [[Lifecycle.Singleton]].
     * @returns Self.
     */
    inSingletonLifecycle(): IRegistrationBuilder<TAbstraction>;

    /**
     * Sets the lifecycle of `TAbstraction` to given value.
     * @param lifecycle The lifecycle to set.
     * @returns Self.
     */
    inLifecycle(lifecycle: Lifecycle): IRegistrationBuilder<TAbstraction>;
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
