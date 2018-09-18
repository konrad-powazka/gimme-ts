import { expect } from 'chai';
import 'mocha';
import { concretion, abstraction, concretionFnName } from '../../../../src/functions-to-transform';
import { ComplexCtorClass, IDependency1, IDependency2 } from '../../../test-modules/complex-ctor-class';

declare class EmptyAmbientClass {
}

interface IEmptyAmbientClassWithCtorDependency {
}

declare class EmptyAmbientClassWithCtor {
    constructor(dependency: IEmptyAmbientClassWithCtorDependency);
}

describe(concretionFnName, () => {
    it('extracts ctor data correctly', () => {
        const type = concretion(ComplexCtorClass);

        expect(type.constructor.params).to.have.lengthOf(2);
        expect(type.constructor.params[0].typeId).to.be.equal(abstraction<IDependency1>().id);
        expect(type.constructor.params[1].typeId).to.be.equal(abstraction<IDependency2>().id);
        expect(type.constructor.function).to.equal(ComplexCtorClass);
    });

    it('extracts empty ctor for empty ambient class declaration with fake value', () => {
        const emptyAmbientClassValue = 'Not actually a class';
        eval('global["EmptyAmbientClass"] = emptyAmbientClassValue;');

        const type = concretion(EmptyAmbientClass);

        expect(type.constructor.params).to.have.lengthOf(0);
        expect(type.constructor.function).to.equal(emptyAmbientClassValue);
    });

    it('extracts ctor for ambient class declaration with fake value', () => {
        const emptyAmbientClassValue = 'Not actually a class';
        eval('global["EmptyAmbientClassWithCtor"] = emptyAmbientClassValue;');

        const type = concretion(EmptyAmbientClassWithCtor);

        expect(type.constructor.params).to.have.lengthOf(1);
        expect(type.constructor.function).to.equal(emptyAmbientClassValue);
    });

    it('extracts ctor for ambient class declaration with real value', () => {
        class EmptyAmbientClassWithCtorImplementation {
            constructor(dependency: IEmptyAmbientClassWithCtorDependency) {
            }
        }

        eval('global["EmptyAmbientClassWithCtor"] = EmptyAmbientClassWithCtorImplementation;');

        const type = concretion(EmptyAmbientClassWithCtor);

        expect(type.constructor.params).to.have.lengthOf(1);
        expect(type.constructor.function).to.equal(EmptyAmbientClassWithCtorImplementation);
    });

    it('extracts empty ctor for empty class declaration', () => {
        class EmptyClass {
        }

        const type = concretion(EmptyClass);

        expect(type.constructor.params).to.have.lengthOf(0);
        expect(type.constructor.function).to.equal(EmptyClass);
    });

    it('extracts first ctor for class with multiple ctors declared', () => {
        interface IDependency1 {
        }

        interface IDependency2 {
        }

        interface IDependency3 {
        }

        interface IDependency4 {
        }

        class MultipleCtorsClass {
            constructor(dep1: IDependency1, dep2: IDependency2)
            constructor(dep3: IDependency3, dep4: IDependency4) {
            }
        }

        const type = concretion(MultipleCtorsClass);

        expect(type.constructor.params).to.have.lengthOf(2);
        expect(type.constructor.params[0].typeId).to.equal(abstraction<IDependency1>().id);
        expect(type.constructor.params[1].typeId).to.equal(abstraction<IDependency2>().id);
        expect(type.constructor.function).to.equal(MultipleCtorsClass);
    });
});
