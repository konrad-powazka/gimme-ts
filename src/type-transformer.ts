import _ from 'lodash';
import ts from 'typescript';
import { nameof } from './nameof';
import { IConstructor, IConstructorParam, IType, IClassType } from './type';

const abstractionFnName = nameof('abstraction', { abstraction });
const concretionFnName = nameof('concretion', { concretion });
const typeTransformerFnName = nameof('typeTransformer', { typeTransformer });

const useTransformerErrorMessage =
    `In order to use "${abstractionFnName}" or "${concretionFnName}" functions "${typeTransformerFnName}" transformer from same package needs to be added to the TypeScript compilation pipeline`;

export function abstraction<T>(): IType {
    throw new Error(useTransformerErrorMessage);
}

export function concretion<T>(concretionConstructor: new (...params: any[]) => T): IClassType<T> {
    throw new Error(useTransformerErrorMessage);
}

enum NodeIdentificationResult {
    AbstractionFnCall,
    ConcretionFnCall,
    Other
}

export function typeTransformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) =>
        (node: ts.SourceFile) => transformTypeExtractionFnCallsForNodeAndChildren(program, context, node);
}

function transformTypeExtractionFnCallsForNodeAndChildren(
    program: ts.Program,
    context: ts.TransformationContext,
    node: ts.SourceFile | ts.Node): ts.SourceFile;

function transformTypeExtractionFnCallsForNodeAndChildren(
    program: ts.Program,
    context: ts.TransformationContext,
    node: ts.Node): ts.Node {
    const typeChecker = program.getTypeChecker();
    const nodeIdentificationResult = identifyNode(node, typeChecker);

    if (nodeIdentificationResult === NodeIdentificationResult.AbstractionFnCall
        || nodeIdentificationResult === NodeIdentificationResult.ConcretionFnCall) {
        const typeExtractionFnCallNode = node as ts.CallExpression;
        const reportErrorFn: ReportErrorFn = (message: string) => reportErrorForNode(message, typeExtractionFnCallNode);

        if (nodeIdentificationResult === NodeIdentificationResult.AbstractionFnCall) {
            return createAbstractionFnCallNodeSubstitute(typeExtractionFnCallNode, typeChecker, reportErrorFn);
        }

        if (nodeIdentificationResult === NodeIdentificationResult.ConcretionFnCall) {
            return createConcretionFnCallNodeSubstitute(typeExtractionFnCallNode, typeChecker, reportErrorFn);
        }
    }

    return ts.visitEachChild(
        node,
        childNode => transformTypeExtractionFnCallsForNodeAndChildren(program, context, childNode),
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
    reportErrorFn: ReportErrorFn): ts.Node {
    const { typeArguments } = abstractionFnCallNode;

    if (!typeArguments || typeArguments.length !== 1) {
        return reportErrorFn(`A call to "${abstractionFnName}" requires exactly one generic type parameter.`);
    }

    const typeArgument = typeArguments[0];
    const type = typeChecker.getTypeFromTypeNode(typeArgument);

    if (!type.isClassOrInterface()) {
        return reportErrorFn(
            `A call to "${abstractionFnName}" can only have an interface or a class as it's a generic type parameter.`);
    }

    const typeId = getSymbolId(type.symbol);
    const typeIdLiteral = ts.createStringLiteral(typeId);
    const typeIdPropertyAssignment = createPropertyAssignment<IType>('id', typeIdLiteral);
    const typePropertyAssignments = [typeIdPropertyAssignment];
    return ts.createObjectLiteral(typePropertyAssignments);
}

function createConcretionFnCallNodeSubstitute(
    concretionFnCallNode: ts.CallExpression,
    typeChecker: ts.TypeChecker,
    reportErrorFn: ReportErrorFn): ts.Node {
    const callArguments = concretionFnCallNode.arguments;

    if (!callArguments || callArguments.length !== 1) {
        return reportErrorFn(`A call to "${concretionFnName}" function requires exactly one parameter.`);
    }

    const callArgument = callArguments[0];

    if (callArgument.kind !== ts.SyntaxKind.Identifier) {
        return reportErrorFn(`A call to "${concretionFnName}" function requires a class constructor as parameter.`);
    }

    const callArgumentIdentifier = callArgument as ts.Identifier;
    const callArgumentType = typeChecker.getTypeAtLocation(callArgumentIdentifier);

    // TODO: What about ClassExpression?
    const callArgumentClassDeclaration =
        _(callArgumentType.symbol.declarations)
            .find(declaration => declaration.kind === ts.SyntaxKind.ClassDeclaration) as
        ts.ClassDeclaration | undefined;

    if (!callArgumentClassDeclaration) {
        return reportErrorFn(`A call to "${concretionFnName}" function requires a class constructor as parameter.`);
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
    return idSegments.join('|');
}

function createPropertyAssignment<TPropertyParent>(name: keyof TPropertyParent & string, value: ts.Expression):
    ts.PropertyAssignment {
    return ts.createPropertyAssignment(name, value);
}

// TODO: do not throw, write to compilation diagnostics
function reportErrorForNode(message: string, node: ts.Node): never {
    const sourceFile = node.getSourceFile();
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

    const fullMessage =
        `${sourceFile.fileName} (${line + 1},${character + 1}): ${message}`;

    throw new Error(fullMessage);
}

type ReportErrorFn = (message: string) => never;
