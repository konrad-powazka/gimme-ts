import 'mocha';
import { TransformationErrorCode } from '../../../src/transformation-error';
import { runTransformationExpectingError } from './erroneous-test-runner';

describe('transformer', () => {
    runTransformationExpectingError(
        'throws with multiple entries when code contains multiple errors',
        'multiple-errors.ts',
        TransformationErrorCode.ConcretionFnCallParameterIsNotClassCtor,
        TransformationErrorCode.AbstractionFnCallIsNotUsedForClassOrInterface,
        TransformationErrorCode.ConcretionFnCallParameterIsNotClassCtor);
});
