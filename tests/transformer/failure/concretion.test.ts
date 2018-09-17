import 'mocha';
import { TransformationErrorCode } from '../../../src/transformation-error';
import { runTransformationExpectingError } from './erroneous-test-runner';

describe('transformer', () => {
    runTransformationExpectingError(
        'throws when concretion parameter is not a class constructor',
        'concretion-param-is-not-ctor.ts',
        TransformationErrorCode.ConcretionFnCallParameterIsNotClassCtor);

    runTransformationExpectingError(
        'throws when concretion parameter is not an identifier',
        'concretion-param-is-not-identifier.ts',
        TransformationErrorCode.ConcretionFnCallParameterIsNotIdentifier);
});
