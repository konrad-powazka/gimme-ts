import { expect } from 'chai';
import 'mocha';
import { Container } from '../../src';
import { ComplexCtorClass, IComplexCtorClass, IDependency1, IDependency2 } from '../test-modules/complex-ctor-class';
import { nameof } from '../../src/nameof';
import { abstraction, concretion } from '../../src/functions-to-transform';

describe(nameof('Container', { Container }), () => {
    let container: Container;

    beforeEach(() => {
        container = new Container();
    });

    it('creates a concretion with dependencies registered as instances', () => {
        const dependency1: IDependency1 = { prop1: 1 };
        container.for(abstraction<IDependency1>()).useInstance(dependency1);
        const dependency2: IDependency2 = { prop2: 2 };
        container.for(abstraction<IDependency2>()).useInstance(dependency2);
        container.for(abstraction<IComplexCtorClass>()).use(concretion(ComplexCtorClass));

        const instance = container.get<IComplexCtorClass>(abstraction<IComplexCtorClass>());

        expect(instance).to.be.instanceof(ComplexCtorClass);
        expect(instance.dependency1).to.equal(dependency1);
        expect(instance.dependency2).to.equal(dependency2);
    });
});
