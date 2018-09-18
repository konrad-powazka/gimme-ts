import 'mocha';
import { TransformationErrorCode } from '../../../src/transformation-error';
import { runTransformationExpectingError } from './erroneous-test-runner';

describe('transformer', () => {
    runTransformationExpectingError(
        'throws when concretion parameter is not a class constructor',
        'concretion-param-is-not-ctor.ts',
        TransformationErrorCode.ConcretionFnCallParameterIsNotClassCtor);

    runTransformationExpectingError(
        'throws when concretion parameter is cast to any inline',
        'concretion-param-is-cast-to-any.ts',
        TransformationErrorCode.ConcretionFnCallParameterIsNotClassCtor);

    runTransformationExpectingError(
        'throws when concretion parameter is of type any',
        'concretion-param-is-any.ts',
        TransformationErrorCode.ConcretionFnCallParameterIsNotClassCtor);
});
