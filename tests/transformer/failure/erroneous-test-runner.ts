import { expect } from 'chai';
import { TransformationError, TransformationErrorCode } from '../../../src/transformation-error';
import { compile } from '../../compile';

// TODO: Make it faster
export function runTransformationExpectingError(
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