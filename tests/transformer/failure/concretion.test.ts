import { expect } from 'chai';
import 'mocha';
import { TransformationError, TransformationErrorCode } from '../../../src/transformation-error';
import { compile } from '../../compile';

// TODO: Make it faster
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

function runTransformationExpectingError(
    title: string,
    fileName: string,
    ...expectedErrorCodes: TransformationErrorCode[]) {
    it(title, () => {
        const filePath = `${process.cwd()}/tests/transformer/failure/uncompilable-test-modules/${fileName}`;
        const action = () => compile([filePath]);

        expect(action).to.throw(TransformationError)
            .that.satisfies((error: TransformationError) => {
                const errorCodes = error.entries.map(entry => entry.code);
                expect(errorCodes).to.have.members(expectedErrorCodes);
                return true;
            });
    }).timeout(30000);
}
