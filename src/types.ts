/** FFI type utils */

import * as Utils from "./utils.ts";

import literal = Utils.literal;

/**
 * Map C types to FFI types.
 *
 * For functions, use `"FUNCTION"` as the C type.
 */
export const map = new Map<string, string>([
    ["int", "i32"],
    ["signed int", "i32"],
    ["unsigned int", "u32"],

    ["char", "i8"],
    ["signed char", "i8"],
    ["unsigned char", "u8"],

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

    ["void", "void"],
    ["bool", "bool"],

    ["size_t", "usize"],

    ["uint8_t", "u8"],
    ["uint16_t", "u16"],
    ["uint32_t", "u32"],
    ["uint64_t", "u64"],

    ["int8_t", "i8"],
    ["int16_t", "i16"],
    ["int32_t", "i32"],
    ["int64_t", "i64"],

    ["char *", "buffer"],
    ["uint8_t *", "buffer"],

    ["FUNCTION", "function"],
]);

const STRUCT_NAMESPACE = "Struct";

function structLiteral(name: string): string {
    return `{ struct: ${STRUCT_NAMESPACE}.${name} }`;
}

/** An FFI type with an optional pointer type (for docs) */
export type FfiType = { type: string; ptrTo?: string };

const CONST_MODIFIER = "const ";

/** Parse a C type into an FFI type */
export function parse(ctype: string): FfiType {
    ctype = ctype.trim();

    if (ctype.startsWith(CONST_MODIFIER)) ctype = ctype.slice(CONST_MODIFIER.length).trim();

    const mapped = map.get(ctype)?.trim();

    const isPtr = mapped ? false : ctype.endsWith("*");
    if (isPtr) ctype = ctype.slice(0, -1).trim();

    const type = isPtr ? literal("pointer") : (mapped ? literal(mapped) : structLiteral(ctype));
    const ptrTo = isPtr ? (mapped ?? ctype) : undefined;

    return { type, ptrTo };
}

/** A C type and a name */
export type TypeAndName = { type: string; name: string };

/**
 * Split a C type and a name.
 *
 * - Splits a function's return type and name, or a parameter's type and name.
 * - Supports pointers.
 */
export function split(typeAndName: string): TypeAndName {
    const isPtr = typeAndName.includes("*");
    const sliceAt = typeAndName.lastIndexOf(isPtr ? "*" : " ");
    if (sliceAt === -1) return { type: typeAndName.trim(), name: "" };
    const [type, name] = [typeAndName.slice(0, sliceAt + 1), typeAndName.slice(sliceAt + 1)];
    return { type: type.trim(), name: name.trim() };
}
