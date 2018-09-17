import _ from 'lodash';
import ts from 'typescript';
import { IConstructor, IConstructorParam, IType, IClassType } from './type';
import { abstractionFnName, concretionFnName } from './functions-to-transform';
import { TransformationErrorEntry, TransformationError, TransformationErrorCode } from './transformation-error';

enum NodeIdentificationResult {
    AbstractionFnCall,
    ConcretionFnCall,
    Other
}

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) =>
        (node: ts.SourceFile) => {
            const errorEntries: TransformationErrorEntry[] = [];

            const result = transformTypeExtractionFnCallsForNodeAndChildren(program, context, node, errorEntries);

            if (errorEntries.length > 0) {
                // TODO: do not throw, write to compilation diagnostics
                throw new TransformationError(errorEntries);
            }

            return result;
        };
}

function transformTypeExtractionFnCallsForNodeAndChildren(
    program: ts.Program,
    context: ts.TransformationContext,
    node: ts.SourceFile | ts.Node,
    errorEntries: TransformationErrorEntry[]): ts.SourceFile;

function transformTypeExtractionFnCallsForNodeAndChildren(
    program: ts.Program,
    context: ts.TransformationContext,
    node: ts.Node,
    errorEntries: TransformationErrorEntry[]): ts.Node {
    const typeChecker = program.getTypeChecker();
    const nodeIdentificationResult = identifyNode(node, typeChecker);

    if (nodeIdentificationResult === NodeIdentificationResult.AbstractionFnCall
        || nodeIdentificationResult === NodeIdentificationResult.ConcretionFnCall) {
        const typeExtractionFnCallNode = node as ts.CallExpression;

        const addErrorEntryFn: AddErrorEntryFn = (code: TransformationErrorCode, message: string) => {
            const errorEntry = new TransformationErrorEntry(code, message, node);
            errorEntries.push(errorEntry);
            return node;
        };

        if (nodeIdentificationResult === NodeIdentificationResult.AbstractionFnCall) {
            return createAbstractionFnCallNodeSubstitute(typeExtractionFnCallNode, typeChecker, addErrorEntryFn);
        }

        if (nodeIdentificationResult === NodeIdentificationResult.ConcretionFnCall) {
            return createConcretionFnCallNodeSubstitute(typeExtractionFnCallNode, typeChecker, addErrorEntryFn);
        }
    }

    return ts.visitEachChild(
        node,
        childNode => transformTypeExtractionFnCallsForNodeAndChildren(program, context, childNode, errorEntries),
        context);
}

function identifyNode(node: ts.Node, typeChecker: ts.TypeChecker): NodeIdentificationResult {
    if (node.kind !== ts.SyntaxKind.CallExpression) {
        return NodeIdentificationResult.Other;
    }

    const signature = typeChecker.getResolvedSignature(node as ts.CallExpression);

    if (!signature) {
        return NodeIdentificationResult.Other;
    }

    const { declaration } = signature;

    // TODO: check if declaration is in proper file to avoid name conflicts with other libs
    if (!declaration || declaration.kind !== ts.SyntaxKind.FunctionDeclaration) {
        return NodeIdentificationResult.Other;
    }

    const functionDeclaration = declaration as ts.FunctionDeclaration;

    if (!functionDeclaration.name) {
        return NodeIdentificationResult.Other;
    }

    const functionDeclarationNameText = functionDeclaration.name.getText();

    switch (functionDeclarationNameText) {
        case abstractionFnName:
            return NodeIdentificationResult.AbstractionFnCall;
        case concretionFnName:
            return NodeIdentificationResult.ConcretionFnCall;
        default:
            return NodeIdentificationResult.Other;
    }
}

function createAbstractionFnCallNodeSubstitute(
    abstractionFnCallNode: ts.CallExpression,
    typeChecker: ts.TypeChecker,
    addErrorEntryFn: AddErrorEntryFn): ts.Node {
    const { typeArguments } = abstractionFnCallNode;

    if (!typeArguments || typeArguments.length !== 1) {
        return addErrorEntryFn(
            TransformationErrorCode.AbstractionFnCallDoesNotHaveSingleGenericParam,
            `A call to "${abstractionFnName}" requires exactly one generic type parameter.`);
    }

    const typeArgument = typeArguments[0];
    const type = typeChecker.getTypeFromTypeNode(typeArgument);

    if (!type.isClassOrInterface()) {
        return addErrorEntryFn(
            TransformationErrorCode.AbstractionFnCallIsNotUsedForClassOrInterface,
            `A call to "${abstractionFnName}" can only have an interface or a class as it's a generic type parameter.`);
    }

    const typeId = getSymbolId(type.symbol);
    const typeIdLiteral = ts.createStringLiteral(typeId);
    const typeIdPropertyAssignment = createPropertyAssignment<IType<unknown>>('id', typeIdLiteral);
    const typePropertyAssignments = [typeIdPropertyAssignment];
    return ts.createObjectLiteral(typePropertyAssignments);
}

function createConcretionFnCallNodeSubstitute(
    concretionFnCallNode: ts.CallExpression,
    typeChecker: ts.TypeChecker,
    addErrorEntryFn: AddErrorEntryFn): ts.Node {
    const callArguments = concretionFnCallNode.arguments;

    if (!callArguments || callArguments.length !== 1) {
        return addErrorEntryFn(
            TransformationErrorCode.ConcretionFnCallDoesNotHaveSingleParameter,
            `A call to "${concretionFnName}" function requires exactly one parameter.`);
    }

    const callArgument = callArguments[0];

    if (callArgument.kind !== ts.SyntaxKind.Identifier) {
        return addErrorEntryFn(
            TransformationErrorCode.ConcretionFnCallParameterIsNotIdentifier,
            `A call to "${concretionFnName}" function requires a class constructor as parameter.`);
    }

    const callArgumentIdentifier = callArgument as ts.Identifier;
    const callArgumentType = typeChecker.getTypeAtLocation(callArgumentIdentifier);

    // TODO: What about ClassExpression?
    const callArgumentClassDeclaration =
        _(callArgumentType.symbol.declarations)
            .find(declaration => declaration.kind === ts.SyntaxKind.ClassDeclaration) as
        ts.ClassDeclaration | undefined;

    if (!callArgumentClassDeclaration) {
        return addErrorEntryFn(
            TransformationErrorCode.ConcretionFnCallParameterIsNotClassCtor,
            `A call to "${concretionFnName}" function requires a class constructor as parameter.`);
    }

    const callArgumentClassType = typeChecker.getTypeOfSymbolAtLocation(
        callArgumentType.symbol,
        callArgumentIdentifier);

    const typeCtorObjectLiteral = createClassTypeCtorObjectLiteral(
        callArgumentIdentifier,
        callArgumentClassType,
        typeChecker);

    const typeCtorPropertyAssignment =
        createPropertyAssignment<IClassType<unknown>>('constructor', typeCtorObjectLiteral);

    const typeId = getSymbolId(callArgumentType.symbol);
    const typeIdLiteral = ts.createStringLiteral(typeId);
    const typeIdPropertyAssignment = createPropertyAssignment<IClassType<unknown>>('id', typeIdLiteral);
    const typePropertyAssignments = [typeIdPropertyAssignment, typeCtorPropertyAssignment];

    return ts.createObjectLiteral(typePropertyAssignments);
}

function createClassTypeCtorObjectLiteral(
    ctorFunctionIdentifier: ts.Identifier,
    type: ts.Type,
    typeChecker: ts.TypeChecker) {
    const ctorFunctionPropertyAssignment =
        createPropertyAssignment<IConstructor<unknown>>('function', ctorFunctionIdentifier);

    const ctorParamsArrayLiteral = createCtorParamsArrayLiteral(type, typeChecker);

    const ctorParamsPropertyAssignment =
        createPropertyAssignment<IConstructor<unknown>>('params', ctorParamsArrayLiteral);

    return ts.createObjectLiteral([ctorFunctionPropertyAssignment, ctorParamsPropertyAssignment]);
}

function createCtorParamsArrayLiteral(type: ts.Type, typeChecker: ts.TypeChecker): ts.ArrayLiteralExpression {
    const constructSignatures = type.getConstructSignatures();

    if (constructSignatures.length === 0) {
        return ts.createArrayLiteral();
    }

    const constructSignature = constructSignatures[0];

    const ctorParamsArrayElementExpressions = _.map(constructSignature.parameters, param => {
        const paramType = typeChecker.getTypeAtLocation(param.getDeclarations()![0]);
        const typeId = getSymbolId(paramType.symbol);
        const typeIdLiteral = ts.createStringLiteral(typeId);
        const typeIdPropertyAssignment = createPropertyAssignment<IConstructorParam>('typeId', typeIdLiteral);
        return ts.createObjectLiteral([typeIdPropertyAssignment]);
    });

    return ts.createArrayLiteral(ctorParamsArrayElementExpressions);
}

function getSymbolId(symbol: ts.Symbol) {
    const declarationSourceFiles =
        _(symbol.declarations)
            .map(declaration => declaration.getSourceFile().fileName)
            .sort()
            .value();

    const idSegments = [symbol.name].concat(declarationSourceFiles);
    return idSegments.join('::');
}

function createPropertyAssignment<TPropertyParent>(name: keyof TPropertyParent & string, value: ts.Expression):
    ts.PropertyAssignment {
    return ts.createPropertyAssignment(name, value);
}

type AddErrorEntryFn = (code: TransformationErrorCode, message: string) => ts.Node;
