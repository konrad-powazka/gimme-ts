import 'mocha';
import { runTestCases, runTestCase, getAll2sFrom1s, getAll3sFrom1s } from './three-level-registration-runner';
import { Lifecycle } from '../../../src';
import { expectAllEqual, expectAllNotEqual } from '../../utils/assertions';
import _ from 'lodash';

runTestCases(() => {
    runTestCase(
        Lifecycle.Transient,
        Lifecycle.Transient,
        Lifecycle.Transient,
        instances => {
            instances.expectAll1s2s3sNotEqual();
        }
    );

    runTestCase(
        Lifecycle.Scoped,
        Lifecycle.Scoped,
        Lifecycle.Scoped,
        instances => {
            expectAllEqual(instances.getAll1sFromScope1());
            expectAllEqual(instances.getAll1sFromScope2());
            expectAllNotEqual([instances.scope1Instance11, instances.scope2Instance11]);

            expectAllEqual(getAll2sFrom1s([instances.scope1Instance11]));
            expectAllEqual(getAll2sFrom1s([instances.scope2Instance11]));
            expectAllNotEqual([instances.scope1Instance11.d21, instances.scope2Instance11.d21]);

            expectAllEqual(getAll3sFrom1s([instances.scope1Instance11]));
            expectAllEqual(getAll3sFrom1s([instances.scope2Instance11]));
            expectAllNotEqual([instances.scope1Instance11.d31, instances.scope2Instance11.d31]);
        }
    );

    runTestCase(
        Lifecycle.Singleton,
        Lifecycle.Singleton,
        Lifecycle.Singleton,
        instances => {
            instances.expectAll1s2s3sEqual();
        }
    );
});