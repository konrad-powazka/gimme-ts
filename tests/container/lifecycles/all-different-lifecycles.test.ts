import 'mocha';
import { runTestCases, runTestCase, getAll2sFrom1s, getAll3sFrom1s } from './three-level-registration-runner';
import { Lifecycle } from '../../../src';
import { expectAllEqual, expectAllNotEqual } from '../../utils/assertions';
import _ from 'lodash';

runTestCases(() => {
    runTestCase(
        Lifecycle.Transient,
        Lifecycle.Scoped,
        Lifecycle.Singleton,
        instances => {
            instances.expectAll1sNotEqual();

            expectAllEqual([
                instances.scope1Instance11.d21,
                instances.scope1Instance11.d22,
                instances.scope1Instance12.d21,
                instances.scope1Instance12.d21]);

            expectAllEqual([
                instances.scope2Instance11.d21,
                instances.scope2Instance11.d22,
                instances.scope2Instance12.d21,
                instances.scope2Instance12.d21]);


            expectAllNotEqual([instances.scope1Instance11.d21, instances.scope2Instance11.d21]);

            instances.expectAll3sEqual();
        }
    );

    runTestCase(
        Lifecycle.Transient,
        Lifecycle.Singleton,
        Lifecycle.Scoped,
        instances => {
            instances.expectAll1sNotEqual();

            instances.expectAll2sEqual();

            expectAllNotEqual([
                instances.scope1Instance11.d31,
                instances.scope2Instance11.d31,
                instances.scope1Instance11.d21.d31]);

            expectAllEqual([
                instances.scope1Instance11.d31,
                instances.scope1Instance11.d32,
                instances.scope1Instance12.d31,
                instances.scope1Instance12.d32]);
            
            expectAllEqual([
                instances.scope2Instance11.d31,
                instances.scope2Instance11.d32,
                instances.scope2Instance12.d31,
                instances.scope2Instance12.d32]);
            
            expectAllEqual([instances.scope1Instance11.d21.d31, instances.scope1Instance11.d21.d32]);
        }
    );

    runTestCase(
        Lifecycle.Scoped,
        Lifecycle.Transient,
        Lifecycle.Singleton,
        instances => {
            expectAllEqual(instances.getAll1sFromScope1());
            expectAllEqual(instances.getAll1sFromScope2());
            expectAllNotEqual([instances.scope1Instance11, instances.scope2Instance12])

            expectAllNotEqual([
                instances.scope1Instance11.d21,
                instances.scope1Instance11.d22,
                instances.scope2Instance11.d21,
                instances.scope2Instance11.d22]);

            instances.expectAll3sEqual();
        }
    );

    runTestCase(
        Lifecycle.Scoped,
        Lifecycle.Singleton,
        Lifecycle.Transient,
        instances => {
            expectAllEqual(instances.getAll1sFromScope1());
            expectAllEqual(instances.getAll1sFromScope2());
            expectAllNotEqual([instances.scope1Instance11, instances.scope2Instance12])

            instances.expectAll2sEqual();

            expectAllNotEqual([
                instances.scope1Instance11.d31,
                instances.scope1Instance11.d32,
                instances.scope1Instance11.d21.d31,
                instances.scope1Instance11.d21.d32,
                instances.scope2Instance11.d31,
                instances.scope2Instance11.d32]);
        }
    );

    runTestCase(
        Lifecycle.Singleton,
        Lifecycle.Transient,
        Lifecycle.Scoped,
        instances => {
            instances.expectAll1sEqual();

            const all2s = getAll2sFrom1s([instances.scope1Instance11]);
            expectAllNotEqual(all2s);

            instances.expectAll3sEqual();
        }
    );

    runTestCase(
        Lifecycle.Singleton,
        Lifecycle.Scoped,
        Lifecycle.Transient,
        instances => {
            instances.expectAll1sEqual();

            instances.expectAll2sEqual();

            expectAllNotEqual([
                instances.scope1Instance11.d21.d31,
                instances.scope1Instance11.d21.d32,
                instances.scope1Instance11.d31,
                instances.scope1Instance11.d32]);
        }
    );
});
