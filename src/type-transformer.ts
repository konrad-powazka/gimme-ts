import * as ts from 'typescript';
import _ from 'lodash';

const typeExtractionFunctionName = 'getType';

export function typeTransformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) => (node: ts.SourceFile) => transformTypeExtractionFnCallsForNodeAndChildren(program, context, node);
}

function transformTypeExtractionFnCallsForNodeAndChildren(program: ts.Program, context: ts.TransformationContext, node: ts.SourceFile): ts.SourceFile;
function transformTypeExtractionFnCallsForNodeAndChildren(program: ts.Program, context: ts.TransformationContext, node: ts.Node): ts.SourceFile;
function transformTypeExtractionFnCallsForNodeAndChildren(program: ts.Program, context: ts.TransformationContext, node: ts.Node): ts.Node {
    const typeChecker = program.getTypeChecker();

    if (checkIfNodeIsTypeExtractionFnCallNode(node, typeChecker)) {
        const transformedNode = createTypeExtractionFnCallNodeSubstitute(node, typeChecker);
        return transformedNode;
    }

    return ts.visitEachChild(node, childNode => transformTypeExtractionFnCallsForNodeAndChildren(program, context, childNode), context);
}

function checkIfNodeIsTypeExtractionFnCallNode(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.CallExpression {
    if (node.kind !== ts.SyntaxKind.CallExpression) {
        return false;
    }

    const signature = typeChecker.getResolvedSignature(node as ts.CallExpression);

    if (!signature) {
        return false;
    }

    const { declaration } = signature;

    // TODO: check if declaration is in proper file to avoid name conflicts with other libs
    if (!declaration || declaration.kind !== ts.SyntaxKind.FunctionDeclaration) {
        return false;
    }

    const functionDeclaration = declaration as ts.FunctionDeclaration;

    if (!functionDeclaration.name) {
        return false;
    }

    return functionDeclaration.name.getText() === typeExtractionFunctionName;
}

function createTypeExtractionFnCallNodeSubstitute(typeExtractionFnCallNode: ts.CallExpression, typeChecker: ts.TypeChecker): ts.Node {
    const { typeArguments } = typeExtractionFnCallNode;
    
    if(!typeArguments || typeArguments.length !== 1) {
        reportError(`A call to ${typeExtractionFunctionName} requires exactly one generic type parameter.`, typeExtractionFnCallNode);
        return typeExtractionFnCallNode;
    }

    const typeArgument = typeArguments[0];
    const type = typeChecker.getTypeFromTypeNode(typeArgument);

    if(!type.isClassOrInterface) {
        reportError(`A call to ${typeExtractionFunctionName} can have only an interface or a class as it's generic type parameter.`, typeExtractionFnCallNode);
        return typeExtractionFnCallNode;
    }

    const typeId = getSymbolId(type.symbol);
    const typeIdLiteral = ts.createStringLiteral(typeId)
    const typeIdPropertyName = 'id'; // TODO: use nameof
    const typeIdPropertyAssignment = ts.createPropertyAssignment(typeIdPropertyName, typeIdLiteral);
    return ts.createObjectLiteral([typeIdPropertyAssignment]);
}

function getSymbolId(symbol: ts.Symbol){
    const declarationSourceFiles = _(symbol.declarations).map(declaration => declaration.getSourceFile().fileName).sort().value();
    const idSegments = [symbol.name].concat(declarationSourceFiles);
    return idSegments.join('|');

}

// TODO: do not throw, write to compilation diagnostics
function reportError(message: string, node: ts.Node): never {
    const sourceFile = node.getSourceFile();

    let { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

    const fullMessage =
        `${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`

    throw new Error(fullMessage);
}