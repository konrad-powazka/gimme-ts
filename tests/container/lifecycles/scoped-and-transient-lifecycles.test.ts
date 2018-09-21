import 'mocha';
import { runTestCases, runTestCase, getAll2sFrom1s, getAll3sFrom1s } from './three-level-registration-runner';
import { Lifecycle } from '../../../src';
import { expectAllNotEqual, expectAllEqual } from '../../utils/assertions';
import _ from 'lodash';

runTestCases(() => {
    runTestCase(
        Lifecycle.Transient,
        Lifecycle.Transient,
        Lifecycle.Scoped,
        instances => {
            instances.expectAll1sNotEqual();

            instances.expectAll2sNotEqual();

            expectAllEqual(getAll3sFrom1s(instances.getAll1sFromScope1()));
            expectAllEqual(getAll3sFrom1s(instances.getAll1sFromScope2()));
            expectAllNotEqual([instances.scope1Instance11.d31, instances.scope2Instance12.d31]);
        });

    runTestCase(
        Lifecycle.Transient,
        Lifecycle.Scoped,
        Lifecycle.Transient,
        instances => {
            instances.expectAll1sNotEqual();

            expectAllEqual(getAll2sFrom1s(instances.getAll1sFromScope1()));
            expectAllEqual(getAll2sFrom1s(instances.getAll1sFromScope2()));
            expectAllNotEqual([instances.scope1Instance11.d21, instances.scope2Instance11.d21]);

            const instance3sExpectedToNotBeEqual = _(instances.getAll1s())
                .map(instance1 => [instance1.d31, instance1.d32])
                .flatten()
                .value()
                .concat([
                    instances.scope1Instance11.d21.d31,
                    instances.scope1Instance11.d21.d32,
                    instances.scope2Instance11.d21.d31,
                    instances.scope2Instance11.d21.d32]);

            expectAllNotEqual(instance3sExpectedToNotBeEqual);
        });

    runTestCase(
        Lifecycle.Transient,
        Lifecycle.Scoped,
        Lifecycle.Scoped,
        instances => {
            instances.expectAll1sNotEqual();

            expectAllEqual(getAll2sFrom1s(instances.getAll1sFromScope1()));
            expectAllEqual(getAll2sFrom1s(instances.getAll1sFromScope2()));
            expectAllNotEqual([instances.scope1Instance11.d21, instances.scope2Instance11.d21]);

            expectAllEqual(getAll3sFrom1s(instances.getAll1sFromScope1()));
            expectAllEqual(getAll3sFrom1s(instances.getAll1sFromScope2()));
            expectAllNotEqual([instances.scope1Instance11.d31, instances.scope2Instance11.d31]);
        });

    runTestCase(
        Lifecycle.Scoped,
        Lifecycle.Transient,
        Lifecycle.Transient,
        instances => {
            expectAllEqual(instances.getAll1sFromScope1());
            expectAllEqual(instances.getAll1sFromScope2());
            expectAllNotEqual([instances.scope1Instance11, instances.scope2Instance11]);

            expectAllNotEqual(getAll2sFrom1s([instances.scope2Instance11]));
            expectAllNotEqual(getAll2sFrom1s([instances.scope1Instance11]));

            expectAllNotEqual(getAll3sFrom1s([instances.scope1Instance11]));
            expectAllNotEqual(getAll3sFrom1s([instances.scope2Instance11]));
        });
    runTestCase(
        Lifecycle.Scoped,
        Lifecycle.Transient,
        Lifecycle.Scoped,
        instances => {
            expectAllEqual(instances.getAll1sFromScope1());
            expectAllEqual(instances.getAll1sFromScope2());
            expectAllNotEqual([instances.scope1Instance11, instances.scope2Instance11]);

            expectAllNotEqual(getAll2sFrom1s([instances.scope1Instance11, instances.scope2Instance11]));

            expectAllEqual(getAll3sFrom1s([instances.scope1Instance11]));
            expectAllEqual(getAll3sFrom1s([instances.scope2Instance11]));
            expectAllNotEqual([instances.scope1Instance11.d31, instances.scope2Instance11.d31]);
        });

    runTestCase(
        Lifecycle.Scoped,
        Lifecycle.Scoped,
        Lifecycle.Transient,
        instances => {
            expectAllEqual(instances.getAll1sFromScope1());
            expectAllEqual(instances.getAll1sFromScope2());
            expectAllNotEqual([instances.scope1Instance11, instances.scope2Instance11]);

            expectAllEqual(getAll2sFrom1s([instances.scope1Instance11]));
            expectAllEqual(getAll2sFrom1s([instances.scope2Instance12]));
            expectAllNotEqual([instances.scope1Instance11.d21, instances.scope2Instance11.d21]);

            expectAllNotEqual([
                instances.scope1Instance11.d31,
                instances.scope1Instance11.d32,
                instances.scope1Instance11.d21.d31,
                instances.scope1Instance11.d21.d32]);

            expectAllNotEqual([
                instances.scope2Instance11.d31,
                instances.scope2Instance11.d32,
                instances.scope2Instance11.d21.d31,
                instances.scope2Instance11.d21.d32]);
        });
});
