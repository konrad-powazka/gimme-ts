import * as ts from 'typescript';

/** The code of an error encountered during transformation. */
export enum TransformationErrorCode {
    AbstractionFnCallDoesNotHaveSingleGenericParam,
    AbstractionFnCallIsNotUsedForClassOrInterface,
    ConcretionFnCallDoesNotHaveSingleParameter,
    ConcretionFnCallParameterIsNotClassCtor
}

export class TransformationErrorEntry {
    constructor(
        public readonly code: TransformationErrorCode,
        public readonly message: string,
        public readonly offendingNode: ts.Node) {
    }
}

export class TransformationError extends Error {
    // This is to make instanceof operator work as expected
    // More info: https://github.com/Microsoft/TypeScript/issues/13965
    __proto__: Error;
    readonly entries: ReadonlyArray<TransformationErrorEntry>;

    constructor(entries: ReadonlyArray<TransformationErrorEntry>) {
        const trueProto = new.target.prototype;
        const message = TransformationError.createMessage(entries);
        super(message);
        this.__proto__ = trueProto;
        this.entries = entries;
    }

    private static createMessage(entries: ReadonlyArray<TransformationErrorEntry>) {
        const generalMessage = 'Gimme.ts transformation encountered following errors:';
        const entryMessages = entries.map(entry => TransformationError.createMessageForEntry(entry));
        return [generalMessage, ...entryMessages].join('\n');
    }

    private static createMessageForEntry(entry: TransformationErrorEntry) {
        const sourceFile = entry.offendingNode.getSourceFile();
        var errorMessage = `Code ${entry.code} - ${entry.message}`;
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(entry.offendingNode.getStart());
        return sourceFile.fileName + '(' + (line + 1) + ',' + (character + 1) + '): ' + errorMessage;
    }
}
