import * as ts from 'typescript';
import transformer from '../src/transformer';

export function compile(filePaths: string[]): void {
    const program = ts.createProgram(filePaths, {
        target: ts.ScriptTarget.ES5,
        strict: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        noEmitOnError: true,
        esModuleInterop: true,
        sourceMap: true,
        outDir: __dirname
    });

    const transformers: ts.CustomTransformers = {
        before: [transformer(program)]
    };

    const emitResult = program.emit(undefined, undefined, undefined, false, transformers);

    if (emitResult.emitSkipped) {
        // TODO: Prettify this
        const errorMessage = ts.formatDiagnostics(emitResult.diagnostics, {
            getCanonicalFileName: fileName => fileName,
            getCurrentDirectory: () => __dirname,
            getNewLine: () => '\n'
        });

        throw new Error(errorMessage);
    }
}
