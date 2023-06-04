import * as ts from 'typescript';

function extractMethodDetails(filename: string) {
    // Parse the TypeScript file
    const program = ts.createProgram([filename], {});
    const sourceFile: ts.SourceFile = program.getSourceFile(filename)!;

    // Visit each node in the AST (Abstract Syntax Tree)
    const methodDetails: Record<string, any> = {};
    ts.forEachChild(sourceFile, visit);

    function visit(node: ts.Node) {
        if (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) {
            const name = node.name!.getText(sourceFile); // method name
            const parameters = node.parameters
                .filter(param => param.questionToken === undefined) // Ignore optional parameters
                .map(param => ({
                    name: param.name.getText(sourceFile),
                    type: param.type ? param.type.getText(sourceFile) : 'any',
                }));

            methodDetails[name] = parameters;
        }

        ts.forEachChild(node, visit);
    }

    const sortedMethodDetails: Record<string, any> = {}
    Object.keys(methodDetails)
    .sort()
    .reduce((result, key) => {
        sortedMethodDetails[key] = methodDetails[key];
        return result;
    }, {});

    return sortedMethodDetails
}

const filename = '../lib-ethers/src/EthersLiquity.ts';
console.log(extractMethodDetails(filename));
