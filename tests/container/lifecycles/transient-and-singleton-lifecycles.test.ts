import 'mocha';
import { runTestCases, runTestCase, getAll2sFrom1s, getAll3sFrom1s } from './three-level-registration-runner';
import { Lifecycle } from '../../../src';
import { expectAllNotEqual } from '../../utils/assertions';

runTestCases(() => {
    runTestCase(
        Lifecycle.Transient,
        Lifecycle.Transient,
        Lifecycle.Singleton,
        instances => {
            instances.expectAll1sNotEqual();

            instances.expectAll2sNotEqual();

            instances.expectAll3sEqual();
        });

    runTestCase(
        Lifecycle.Transient,
        Lifecycle.Singleton,
        Lifecycle.Transient,
        instances => {
            instances.expectAll1sNotEqual();

            instances.expectAll2sEqual();

            expectAllNotEqual([instances.scope1Instance11.d21.d31, instances.scope1Instance11.d21.d32]);

            for (const instance1 of instances.getAll1s()) {
                expectAllNotEqual([instance1.d21.d31, instance1.d31, instance1.d32]);
            }
        });

    runTestCase(
        Lifecycle.Transient,
        Lifecycle.Singleton,
        Lifecycle.Singleton,
        instances => {
            instances.expectAll1sNotEqual();

            instances.expectAll2sEqual();

            instances.expectAll3sEqual();
        });

    runTestCase(
        Lifecycle.Singleton,
        Lifecycle.Transient,
        Lifecycle.Transient,
        instances => {
            instances.expectAll1sEqual();

            expectAllNotEqual(getAll2sFrom1s([instances.scope1Instance11]));

            expectAllNotEqual(getAll3sFrom1s([instances.scope1Instance11]));
        });

    runTestCase(
        Lifecycle.Singleton,
        Lifecycle.Transient,
        Lifecycle.Singleton,
        instances => {
            instances.expectAll1sEqual();

            expectAllNotEqual([
                instances.scope1Instance11.d21,
                instances.scope1Instance11.d22
            ]);

            instances.expectAll3sEqual();

        });

    runTestCase(
        Lifecycle.Singleton,
        Lifecycle.Singleton,
        Lifecycle.Transient,
        instances => {
            instances.expectAll1sEqual();

            instances.expectAll2sEqual();

            expectAllNotEqual([
                instances.scope1Instance11.d21.d31,
                instances.scope1Instance11.d21.d32,
                instances.scope1Instance11.d31,
                instances.scope1Instance11.d32
            ]);
        });
});
