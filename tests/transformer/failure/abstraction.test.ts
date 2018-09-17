import 'mocha';
import { TransformationErrorCode } from '../../../src/transformation-error';
import { runTransformationExpectingError } from './erroneous-test-runner';

describe('transformer', () => {
    runTransformationExpectingError(
        'throws when abstraction generic parameter is a union',
        'abstraction-generic-param-is-union.ts',
        TransformationErrorCode.AbstractionFnCallIsNotUsedForClassOrInterface);

    runTransformationExpectingError(
        'throws when abstraction generic parameter is another generic parameter',
        'abstraction-generic-param-is-generic.ts',
        TransformationErrorCode.AbstractionFnCallIsNotUsedForClassOrInterface);
});
