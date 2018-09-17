import { expect } from 'chai';
import 'mocha';
import { concretion, concretionFnName } from '../../../../src/functions-to-transform';
import { ConflictedNameClass as ConflictedNameClass1 } from '../../../test-modules/conflicted-name-class-1';
import { ConflictedNameClass as SameClassAlias1 } from '../../../test-modules/conflicted-name-class-1';
import { ConflictedNameClass as SameClassAlias2 } from '../../../test-modules/conflicted-name-class-1';
import { ConflictedNameClass as ConflictedNameClass2 } from '../../../test-modules/conflicted-name-class-2';

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
});
