/** Generate FFI bindings for Deno */

import type * as Symbols from "./symbols.ts";

export * as Symbols from "./symbols.ts";

class CodeWriter {
    output = "";
    indent = 0;

    protected write(line: string): void {
        const indent = "\t".repeat(this.indent);
        this.output += `${indent}${line}\n`;
    }
}

type ConfigPaths = {
    structs: string;
};

/** Generate a foreign library interface */
export class Writer extends CodeWriter {
    begin(paths: ConfigPaths): void {
        this.write(`import * as Struct from "${paths.structs}";`);
        this.write("");
        this.write("export const symbols = {");
        this.indent++;
    }

    end(): void {
        this.indent--;
        this.write("} as const satisfies Deno.ForeignLibraryInterface;");
    }

    writeSymbol(symbol: Symbols.Def): void {
        if (symbol.docstring) this.write(`/** ${symbol.docstring} */`);

        this.write(`${symbol.name}: {`);
        this.indent++;

        this.write(`name: "${symbol.cname}",`);

        this.write("parameters: [");
        this.indent++;
        symbol.parameters.forEach((param) => {
            if (param.type.ptrTo) this.write(`${param.type.type}, // <${param.type.ptrTo}> ${param.name}`);
            else this.write(`${param.type.type}, // ${param.name}`);
        });
        this.indent--;
        this.write("],");

        if (symbol.result.ptrTo) this.write(`result: ${symbol.result.type}, // <${symbol.result.ptrTo}>`);
        else this.write(`result: ${symbol.result.type},`);

        this.write(`optional: ${symbol.optional},`);
        this.write(`nonblocking: ${symbol.nonblocking}`);

        this.indent--;
        this.write("},");
        this.write("");
    }
}
