import { expect } from 'chai';
import 'mocha';
import { concretion, concretionFnName } from '../../../../src/functions-to-transform';
import { ConflictedNameClass as ConflictedNameClass1 } from '../../../test-modules/conflicted-name-class-1';
import { ConflictedNameClass as SameClassAlias1 } from '../../../test-modules/conflicted-name-class-1';
import { ConflictedNameClass as SameClassAlias2 } from '../../../test-modules/conflicted-name-class-1';
import { ConflictedNameClass as ConflictedNameClass2 } from '../../../test-modules/conflicted-name-class-2';
import { differentClassInMultipleNamespacesNamespace, DifferentClassInMultipleNamespaces } from '../../../test-modules/different-class-in-namespace';
import { sameClassInMultipleNamespacesNamespace1, sameClassInMultipleNamespacesNamespace2 } from '../../../test-modules/same-class-in-namespace';

describe(concretionFnName, () => {
    it('assigns different ids for classes with same names in different modules', () => {
        const type1 = concretion(ConflictedNameClass1);
        const type2 = concretion(ConflictedNameClass2);

        expect(type1.id).to.not.be.equal(type2.id);
    });

    it('assigns same ids for two invocations on same type', () => {
        const type1 = concretion(SameClassAlias1);
        const type2 = concretion(SameClassAlias1);

        expect(type1.id).to.be.equal(type2.id);
    });

    it('assigns same ids for two invocations on same type under different aliases', () => {
        const type1 = concretion(SameClassAlias1);
        const type2 = concretion(SameClassAlias2);

        expect(type1.id).to.be.equal(type2.id);
    });

    it('assigns different ids for types with same name and in different namespaces', () => {
        const type1 = concretion(DifferentClassInMultipleNamespaces);
        const type2 = concretion(differentClassInMultipleNamespacesNamespace.DifferentClassInMultipleNamespaces);

        expect(type1.id).to.not.be.equal(type2.id);
    });

    it('assigns same ids for types with same name and in different namespaces', () => {
        const type1 = concretion(sameClassInMultipleNamespacesNamespace1.SameClassInMultipleNamespaces);
        const type2 = concretion(sameClassInMultipleNamespacesNamespace2.SameClassInMultipleNamespaces);

        expect(type1.id).to.be.equal(type2.id);
    });
});
