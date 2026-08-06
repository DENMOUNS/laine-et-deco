const ts = require("typescript");
const files = ["src/frontend/hooks/useEntity.ts","src/frontend/hooks/useStaticEntity.ts"];
const options = {
  noEmit: true,
  skipLibCheck: true,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2022,
  lib: ["lib.es2022.d.ts","lib.dom.d.ts"],
  allowJs: false,
  strict: false,
};
const program = ts.createProgram(files, options);
const emit = program.emit();
const diagnostics = ts.getPreEmitDiagnostics(program).concat(emit.diagnostics);
if (diagnostics.length === 0) {
  console.log("OK");
  process.exit(0);
}
for (const diag of diagnostics) {
  const message = ts.flattenDiagnosticMessageText(diag.messageText, "\n");
  if (diag.file) {
    const { line, character } = diag.file.getLineAndCharacterOfPosition(diag.start);
    console.log(`${diag.file.fileName}:${line + 1}:${character + 1} - ${message}`);
  } else {
    console.log(message);
  }
}
process.exit(1);
