/** FFI type utils */

import * as Config from "./config.ts";

/** Map C types to Deno FFI types */
export const map: Map<string, string> = new Map<string, string>([
    ["int", "i32"],
    ["signed", "i32"],
    ["signed int", "i32"],
    ["unsigned", "u32"],
    ["unsigned int", "u32"],

    ["char", "i8"],
    ["signed char", "i8"],
    ["unsigned char", "u8"],
    ["wchar_t", "u16"],
    ["char16_t", "u16"],
    ["char32_t", "u32"],

    ["short", "i16"],
    ["signed short", "i16"],
    ["unsigned short", "u16"],
    ["short int", "i16"],
    ["signed short int", "i16"],
    ["unsigned short int", "u16"],

    ["long", "i64"],
    ["signed long", "i64"],
    ["unsigned long", "u64"],
    ["long int", "i64"],
    ["signed long int", "i64"],
    ["unsigned long int", "u64"],
    ["long long", "i64"],
    ["signed long long", "i64"],
    ["unsigned long long", "u64"],

    ["float", "f32"],
    ["double", "f64"],
    ["long double", "f64"],

    ["void", "void"],
    ["bool", "bool"],

    ["ssize_t", "isize"],
    ["size_t", "usize"],
    ["ptrdiff_t", "isize"],
    ["intptr_t", "isize"],
    ["uintptr_t", "usize"],

    ["int8_t", "i8"],
    ["int16_t", "i16"],
    ["int32_t", "i32"],
    ["int64_t", "i64"],

    ["uint8_t", "u8"],
    ["uint16_t", "u16"],
    ["uint32_t", "u32"],
    ["uint64_t", "u64"],

    ["int_least8_t", "i8"],
    ["int_least16_t", "i16"],
    ["int_least32_t", "i32"],
    ["int_least64_t", "i64"],

    ["uint_least8_t", "u8"],
    ["uint_least16_t", "u16"],
    ["uint_least32_t", "u32"],
    ["uint_least64_t", "u64"],

    ["int_fast8_t", "i8"],
    ["int_fast16_t", "i16"],
    ["int_fast32_t", "i32"],
    ["int_fast64_t", "i64"],

    ["uint_fast8_t", "u8"],
    ["uint_fast16_t", "u16"],
    ["uint_fast32_t", "u32"],
    ["uint_fast64_t", "u64"],

    ["char *", "buffer"],
    ["uint8_t *", "buffer"],
    ["int8_t *", "buffer"],
    ["int_fast8_t *", "buffer"],
    ["uint_fast8_t *", "buffer"],
    ["wchar_t *", "buffer"],

    ["char[]", "buffer"],
    ["uint8_t[]", "buffer"],
    ["int8_t[]", "buffer"],
    ["int_fast8_t[]", "buffer"],
    ["uint_fast8_t[]", "buffer"],
    ["wchar_t[]", "buffer"],
]);

const QUALIFIERS = ["const", "volatile", "restrict"] as const;
const PTR = "*" as const;
const FN_PTR = "(*" as const;
const FN_PTR_PTR = "(**" as const;
const VARIADIC = "..." as const;

/** Parse a C type to a Deno FFI type */
export function parse(input: string): parse.Result {
    input = input.trim();
    let cType = input;

    if (cType.includes(VARIADIC)) throw new Error(`Variadic types are not supported: ${cType}`);

    // qualifiers have no impact on the resulting type
    for (const q of QUALIFIERS) if (cType.startsWith(q)) cType = cType.slice(q.length).trim();

    const typeFromMap = map.get(cType);

    const isFnPtrPtr = !typeFromMap && cType.includes(FN_PTR_PTR);
    const isFnPtr = !typeFromMap && !isFnPtrPtr && cType.includes(FN_PTR);
    const isPtr = !typeFromMap && cType.endsWith(PTR);

    if (isFnPtrPtr) return { type: '"pointer"', cType: input };
    if (isFnPtr) return { type: '"function"', cType: input };
    if (isPtr) return { type: '"pointer"', cType: input };
    if (typeFromMap) return { type: `"${typeFromMap}"`, cType: input };
    return { type: `${Config.TYPES_NAMESPACE}.${cType}`, cType: input };
}

export namespace parse {
    /** A C type and its parsed FFI type */
    export type Result = {
        type: string;
        cType: string;
    };
}

/**
 * Split a C type and a name
 *
 * - Splits a function's return type and name.
 * - Splits a parameter's type and name.
 * - Supports pointers.
 * - Supports function pointers.
 */
export function split(decl: string): split.Result {
    const isFnPtr = decl.includes(FN_PTR);
    const isPtr = !isFnPtr && decl.includes(PTR);
    const sliceAt = decl.lastIndexOf(isPtr ? PTR : " ");
    const type = ~sliceAt ? decl.slice(0, sliceAt + 1).trim() : decl.trim();
    const name = ~sliceAt ? decl.slice(sliceAt + 1).trim() : Config.UNNAMED_PARAM;
    return { type, name };
}

export namespace split {
    /** A C type and a name */
    export type Result = {
        type: string;
        name: string;
    };
}
