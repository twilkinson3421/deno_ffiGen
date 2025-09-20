/** FFI symbol utils */

import * as Types from "./types.ts";
import * as Utils from "./utils.ts";

import sections = Utils.sections;

/** An FFI symbol definition used to generate code */
export type Def = {
    name: string;
    cname: string;
    parameters: { type: Types.FfiType; name: string }[];
    result: Types.FfiType;
    optional: boolean;
    nonblocking: boolean;
    docstring?: string;
};

/**
 * Parse a c-style function signature into an FFI symbol definition.
 *
 * - Prefix with `?` to make the symbol optional.
 * - Prefix with `!` to make the symbol non-blocking (can be combined AFTER `?`).
 * - Remove any calling conventions
 */
export function parse(sig: string): Def {
    let optional = false;
    let nonblocking = false;

    if (sig.startsWith("?")) optional = true;
    if (optional) sig = sig.slice(1).trim();

    if (sig.startsWith("!")) nonblocking = true;
    if (nonblocking) sig = sig.slice(1).trim();

    const parts = sections(sig, ["(", ")", "//"]);

    const decl = parts.at(0)?.trim();
    if (!decl) throw new Error(`Invalid symbol: ${sig}`);
    const { type: result, name: cname } = Types.split(decl);
    const name = cname.charAt(0).toLocaleLowerCase() + cname.slice(1);

    const parameters = parts.at(1)?.trim().split(",").map((param) => {
        const { type, name } = Types.split(param.trim());
        return type === "void" ? undefined : { type: Types.parse(type), name };
    }).filter((param) => !!param) ?? [];

    const docstring = parts.at(-1)?.trim();

    return { name, cname, parameters, result: Types.parse(result), optional, nonblocking, docstring };
}
