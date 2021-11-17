import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

/// Recursively gets all of a TypeScript file's dependencies
/// Note: only works with "import" based dependencies.
export const getFileDependencies = function(args: { sourceFilePath: string, allDependencies: string[] }) {
  const sourceDirectoryPath = path.resolve(args.sourceFilePath, '../');
  const sourceFileName = path.basename(args.sourceFilePath);
  const sourceText = fs.readFileSync(args.sourceFilePath).toString();
  const sourceFileTs = ts.createSourceFile(sourceFileName, sourceText, ts.ScriptTarget.ES2017);
  sourceFileTs.statements.forEach(function(statement: ts.Statement) {
    if (ts.isImportDeclaration(statement)) {
      const importText = (statement.moduleSpecifier as ts.StringLiteral).text;
      if (importText.startsWith(`.`)) {
        const relativePath = importText + `.ts`;
        const absolutePath = path.resolve(sourceDirectoryPath, relativePath);
        if (!args.allDependencies.includes(absolutePath)) {
          args.allDependencies.push(absolutePath);
          args.allDependencies = getFileDependencies({
            sourceFilePath: absolutePath,
            allDependencies: args.allDependencies,
          });
        }
      }
    }
  });
  return args.allDependencies;
}
