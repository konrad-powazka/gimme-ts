import 'mocha';
import { expect } from 'chai';
import { getType } from '../../src';
import { ConflictedNameClass as ConflictedNameClass1 } from './test-modules/conflicted-name-class-1';
import { ConflictedNameClass as ConflictedNameClass2 } from './test-modules/conflicted-name-class-2';
import { ConflictedNameClass as SameClassAlias1 } from './test-modules/conflicted-name-class-1';
import { ConflictedNameClass as SameClassAlias2 } from './test-modules/conflicted-name-class-1';

describe('getType', () => {
    it('assigns different ids for classes with same names in different modules', () => {
        const type1 = getType<ConflictedNameClass1>();
        const type2 = getType<ConflictedNameClass2>();

        expect(type1.id).to.not.be.equal(type2.id);
    });

    it('assigns same ids for two invocations on same type', () => {
        const type1 = getType<SameClassAlias1>();
        const type2 = getType<SameClassAlias1>();

        expect(type1.id).to.be.equal(type2.id);
    });

    it('assigns same ids for two invocations on same type under different aliases', () => {
        const type1 = getType<SameClassAlias1>();
        const type2 = getType<SameClassAlias2>();

        expect(type1.id).to.be.equal(type2.id);
    });
});