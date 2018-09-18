import { expect } from 'chai';
import 'mocha';
import { abstractionFnName, abstraction } from '../../../src/functions-to-transform';
import { ConflictedNameClass as ConflictedNameClass1 } from '../../test-modules/conflicted-name-class-1';
import { ConflictedNameClass as SameClassAlias1 } from '../../test-modules/conflicted-name-class-1';
import { ConflictedNameClass as SameClassAlias2 } from '../../test-modules/conflicted-name-class-1';
import { ConflictedNameClass as ConflictedNameClass2 } from '../../test-modules/conflicted-name-class-2';
import { differentClassInMultipleNamespacesNamespace, DifferentClassInMultipleNamespaces } from '../../test-modules/different-class-in-namespace';
import { sameInterfaceInMultipleNamespacesNamespace1, sameInterfaceInMultipleNamespacesNamespace2 } from '../../test-modules/same-interface-in-namespace';

declare interface AmbientInterfaceWithTwoDeclarations {
    prop1: number;
}

declare interface AmbientInterfaceWithTwoDeclarations {
    prop2: number;
}

declare namespace fakeNamespaceContainingInterfaceAndClass {
    interface IFakeInterface{
    }

    class FakeClass{
    }
}

describe(abstractionFnName, () => {
    it('returns different values for classes with same names in different modules', () => {
        const type1 = abstraction<ConflictedNameClass1>();
        const type2 = abstraction<ConflictedNameClass2>();

        expect(type1.id).to.not.be.equal(type2.id);
    });

    it('returns same values for two invocations on same type', () => {
        const type1 = abstraction<SameClassAlias1>();
        const type2 = abstraction<SameClassAlias1>();

        expect(type1).to.deep.equal(type2);
    });

    it('returns same values for two invocations on same type under different aliases', () => {
        const type1 = abstraction<SameClassAlias1>();
        const type2 = abstraction<SameClassAlias2>();

        expect(type1).to.deep.equal(type2);
    });

    it('returns different values for types with same name and in different namespaces', () => {
        const type1 = abstraction<DifferentClassInMultipleNamespaces>();
        const type2 = abstraction<differentClassInMultipleNamespacesNamespace.DifferentClassInMultipleNamespaces>();

        expect(type1.id).to.not.be.equal(type2.id);
    });

    it('returns same values for types with same name and in different namespaces', () => {
        const type1 = 
            abstraction<sameInterfaceInMultipleNamespacesNamespace1.ISameInterfaceInMultipleNamespaces>();
            
        const type2 = 
            abstraction<sameInterfaceInMultipleNamespacesNamespace2.ISameInterfaceInMultipleNamespaces>();

        expect(type1).to.deep.equal(type2);
    });

    it('returns value for ambient type with two declarations', () => {
        const type = abstraction<AmbientInterfaceWithTwoDeclarations>();

        expect(type.id).to.contain('AmbientInterfaceWithTwoDeclarations');
    });

    it('returns value for interface in ambient namespace', () => {
        const type = abstraction<fakeNamespaceContainingInterfaceAndClass.IFakeInterface>();

        expect(type.id).to.contain('IFakeInterface');
    });

    it('returns value for class in ambient namespace', () => {
        const type = abstraction<fakeNamespaceContainingInterfaceAndClass.FakeClass>();

        expect(type.id).to.contain('FakeClass');
    });
});
