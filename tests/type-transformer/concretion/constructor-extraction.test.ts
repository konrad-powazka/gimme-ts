import { expect } from 'chai';
import 'mocha';
import { concretion, abstraction } from '../../../src';
import { ComplexCtorClass, IDependency1, IDependency2 } from '../../test-modules/complex-ctor-class';
import { nameof } from '../../../src/nameof';

describe(nameof('concretion', { concretion }), () => {
    it('extracts ctor data correctly', () => {
        const type = concretion(ComplexCtorClass);

        expect(type.constructor.params).to.have.lengthOf(2);
        expect(type.constructor.params[0].typeId).to.be.equal(abstraction<IDependency1>().id);
        expect(type.constructor.params[1].typeId).to.be.equal(abstraction<IDependency2>().id);
        expect(type.constructor.function).to.equal(ComplexCtorClass);
    });
});
