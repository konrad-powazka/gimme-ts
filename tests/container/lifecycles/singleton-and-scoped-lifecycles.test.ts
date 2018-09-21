import 'mocha';
import { runTestCases, runTestCase, getAll2sFrom1s } from './three-level-registration-runner';
import { Lifecycle } from '../../../src';
import { expectAllNotEqual, expectAllEqual } from '../../utils/assertions';

runTestCases(() => {
    runTestCase(
        Lifecycle.Scoped,
        Lifecycle.Scoped,
        Lifecycle.Singleton,
        instances => {
            expectAllEqual(instances.getAll1sFromScope1());
            expectAllEqual(instances.getAll1sFromScope2());
            expectAllNotEqual([instances.scope1Instance11, instances.scope2Instance11]);

            expectAllEqual(getAll2sFrom1s([instances.scope1Instance11]));
            expectAllEqual(getAll2sFrom1s([instances.scope2Instance11]));
            expectAllNotEqual([instances.scope1Instance11.d21, instances.scope2Instance11.d21]);

            instances.expectAll3sEqual();
        });

    runTestCase(
        Lifecycle.Scoped,
        Lifecycle.Singleton,
        Lifecycle.Scoped,
        instances => {
            expectAllEqual(instances.getAll1sFromScope1());
            expectAllEqual(instances.getAll1sFromScope2());
            expectAllNotEqual([instances.scope1Instance11, instances.scope2Instance11]);

            instances.expectAll2sEqual();

            expectAllEqual([
                instances.scope1Instance11.d31,
                instances.scope1Instance12.d32,
                instances.scope1Instance11.d31,
                instances.scope1Instance12.d32]);

            expectAllEqual([
                instances.scope2Instance11.d31,
                instances.scope2Instance12.d32,
                instances.scope2Instance11.d31,
                instances.scope2Instance12.d32]);

            expectAllNotEqual([
                instances.scope1Instance11.d31,
                instances.scope2Instance11.d31,
                instances.scope1Instance11.d21.d31,
            ]);
        });

    runTestCase(
        Lifecycle.Scoped,
        Lifecycle.Singleton,
        Lifecycle.Singleton,
        instances => {
            expectAllEqual(instances.getAll1sFromScope1());
            expectAllEqual(instances.getAll1sFromScope2());
            expectAllNotEqual([instances.scope1Instance11, instances.scope2Instance11]);

            instances.expectAll2sEqual();

            instances.expectAll3sEqual();
        });
    runTestCase(
        Lifecycle.Singleton,
        Lifecycle.Scoped,
        Lifecycle.Scoped,
        instances => {
            instances.expectAll1sEqual();

            instances.expectAll2sEqual();

            instances.expectAll3sEqual();
        });

    runTestCase(
        Lifecycle.Singleton,
        Lifecycle.Scoped,
        Lifecycle.Singleton,
        instances => {
            instances.expectAll1sEqual();

            instances.expectAll2sEqual();

            instances.expectAll3sEqual();
        });

    runTestCase(
        Lifecycle.Singleton,
        Lifecycle.Singleton,
        Lifecycle.Scoped,
        instances => {
            instances.expectAll1sEqual();

            instances.expectAll2sEqual();

            instances.expectAll3sEqual();
        });
});
