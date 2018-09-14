import { expect } from 'chai';
import 'mocha';
import { abstraction, concretion, Container } from '../../src';
import { ComplexCtorClass, IComplexCtorClass, IDependency1, IDependency2 } from '../test-modules/complex-ctor-class';

describe('container ', () => {
    let container: Container;

    beforeEach(() => {
        container = new Container();
    });

    it('creates a concretion with dependencies registered as instances', () => {
        const dependency1: IDependency1 = { prop1: 1 };
        container.useInstance(dependency1).for(abstraction<IDependency1>());
        const dependency2: IDependency2 = { prop2: 2 };
        container.useInstance(dependency2).for(abstraction<IDependency2>());
        container.use(concretion(ComplexCtorClass)).for(abstraction<IComplexCtorClass>());

        const instance = container.get<IComplexCtorClass>(abstraction<IComplexCtorClass>());

        expect(instance).to.be.instanceof(ComplexCtorClass);
        expect(instance.dependency1).to.equal(dependency1);
        expect(instance.dependency2).to.equal(dependency2);
    });
});
