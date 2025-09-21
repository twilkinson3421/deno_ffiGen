/** FFI symbol utils */

import * as Types from "./types.ts";
import * as Utils from "./utils.ts";

/** An FFI symbol definition used to generate code */
export type Definition = {
    name: string;
    cName: string;
    parameters: { type: Types.parse.Result; name: string }[];
    result: Types.parse.Result;
    optional: boolean;
    nonblocking: boolean;
    docstring?: string;
};

const OPTIONAL = "?" as const;
const NONBLOCKING = "!" as const;
const PARAM_START = "(" as const;
const PARAM_END = ")" as const;
const COMMENT_START = "//" as const;
const PARAM_SEPARATOR = "," as const;
const VOID_TYPE = "void" as const;

/**
 * Parse a c-style function signature into an FFI symbol definition.
 *
 * - Prefix with `?` to make the symbol optional.
 * - Prefix with `!` to make the symbol non-blocking (can be combined AFTER `?`).
 * - Remove any calling conventions
 */
export function parse(signature: string): Definition {
    const optional = signature.startsWith(OPTIONAL);
    if (optional) signature = signature.slice(OPTIONAL.length).trim();
    const nonblocking = signature.startsWith(NONBLOCKING);
    if (nonblocking) signature = signature.slice(NONBLOCKING.length).trim();

    const parts = Utils.segments(signature, [PARAM_START, PARAM_END, COMMENT_START]);

    const fnDecl = parts.at(0)?.trim();
    if (!fnDecl) throw new Error(`Invalid symbol: ${signature}`);
    const { type: resultCType, name: cName } = Types.split(fnDecl);

    const result = Types.parse(resultCType);
    const name = cName.charAt(0).toLocaleLowerCase() + cName.slice(1);

    const parameters = parts.at(1)?.trim().split(PARAM_SEPARATOR).map((param) => {
        const { type: cType, name } = Types.split(param.trim());
        return cType === VOID_TYPE ? null : { type: Types.parse(cType), name };
    }).filter((param) => !!param) ?? [];

    const docstring = parts.at(-1)?.trim();

    return { name, cName, parameters, result, optional, nonblocking, docstring };
}
