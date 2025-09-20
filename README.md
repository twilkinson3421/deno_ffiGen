# Deno FFI Symbol Generator

Generate foreign function interfaces for Deno. Very early version; may generate incorrect bindings; always check the
output.

## Usage

```ts
import * as FfiGen from "@zerm/ffigen";

import Writer = FfiGen.Writer;
import parse = FfiGen.Symbols.parse;

const w = new Writer();

// path to a file which defines structs
// see https://docs.deno.com/runtime/fundamentals/ffi/#working-with-structs
w.begin({ structs: "./structs.ts" });

w.writeSymbol(
    parse("void InitWindow(int width, int height, const char *title); // Initialize window and OpenGL context"),
);
// more symbols...

w.end();

Deno.writeTextFileSync("./symbols.ts", w.output);
```

The output will be written to `symbols.ts`.

```ts
import * as Struct from "./structs.ts";

export const symbols = {
    /** Initialize window and OpenGL context */
    initWindow: {
        name: "InitWindow",
        parameters: [
            "i32", // width
            "i32", // height
            "buffer", // title
        ],
        result: "void",
        optional: false,
        nonblocking: false,
    },
} as const satisfies Deno.ForeignLibraryInterface;
```

## Quirks

- Use `?` to make a symbol optional.
- Use `!` to make a symbol non-blocking (can be combined AFTER `?`).
- Remove any calling conventions.
- Any unknown types are assumed to be structs defined in your provided `structs.ts` file
  (https://docs.deno.com/runtime/fundamentals/ffi/#working-with-structs).
- Function pointers (both return and parameters) should be changed to `FUNCTION` before parsing.
