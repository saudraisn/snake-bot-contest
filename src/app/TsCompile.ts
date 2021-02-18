import * as ts from "typescript";

export const compileTs = (source:string) => {
  let compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 }});
  
  const result = compiled.outputText.replace('export {};', '')
  console.log(result);
  return result
}
