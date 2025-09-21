/** Generate FFI bindings for Deno */

import * as Code from "./code.ts";
import * as Config from "./config.ts";
import type * as Symbol from "./symbol.ts";

export * as Symbol from "./symbol.ts";
export * as Types from "./types.ts";

type PreambleConfig = {
    paths: { types: string };
    export: string;
};

/** Generate a foreign library interface */
export class Writer extends Code.Writer {
    /** Reset the underlying writer */
    override reset(): void {
        super.reset();
    }

    /** Begin writing the output */
    preamble(config: PreambleConfig): void {
        this.writeln(`import * as ${Config.TYPES_NAMESPACE} from "${config.paths.types}"`);
        this.writeln("");
        this.writeln(`export const ${config.export} = {`);
        this.indent++;
    }

    /** End writing the output */
    end(): void {
        this.indent--;
        this.writeln("} as const satisfies Deno.ForeignLibraryInterface;");
    }

    /** Define a symbol */
    addSymbol(symbol: Symbol.Definition): void {
        if (symbol.docstring) this.writeln(`/** ${symbol.docstring} */`);

        this.writeln(`${symbol.name}: {`);
        this.indent++;

        this.writeln(`name: "${symbol.cName}",`);

        this.writeln("parameters: [");
        this.indent++;
        symbol.parameters.forEach(({ type, name }) => this.writeln(`${type.type}, // <${type.cType}> ${name}`));
        this.indent--;
        this.writeln("],");

        this.writeln(`result: ${symbol.result.type}, // <${symbol.result.cType}>`);

        this.writeln(`optional: ${symbol.optional},`);
        this.writeln(`nonblocking: ${symbol.nonblocking}`);

        this.indent--;
        this.writeln("},");
        this.writeln("");
    }
}
