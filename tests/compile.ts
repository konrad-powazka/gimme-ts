import * as ts from 'typescript';
import { typeTransformer } from '../src/type-transformer';

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
    before: [typeTransformer(program)]
  };

  const emitResult = program.emit(undefined, undefined, undefined, false, transformers);

  if (emitResult.emitSkipped) {
    const errorMessage = emitResult.diagnostics.map(diagnostic => diagnostic.messageText).join('\n');
    throw new Error(errorMessage);
  }
}